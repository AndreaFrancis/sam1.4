/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 1.1.20151003
 *
 * By Eli Grey, http://eligrey.com
 * License: MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */

/*global self */
/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

var saveAs = saveAs || (function(view) {
	"use strict";
	// IE <10 is explicitly unsupported
	if (typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
		return;
	}
	var
		  doc = view.document
		  // only get URL when necessary in case Blob.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = "download" in save_link
		, click = function(node) {
			var event = new MouseEvent("click");
			node.dispatchEvent(event);
		}
		, is_safari = /Version\/[\d\.]+.*Safari/.test(navigator.userAgent)
		, webkit_req_fs = view.webkitRequestFileSystem
		, req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem
		, throw_outside = function(ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		, fs_min_size = 0
		// See https://code.google.com/p/chromium/issues/detail?id=375297#c7 and
		// https://github.com/eligrey/FileSaver.js/commit/485930a#commitcomment-8768047
		// for the reasoning behind the timeout and revocation flow
		, arbitrary_revoke_timeout = 500 // in ms
		, revoke = function(file) {
			var revoker = function() {
				if (typeof file === "string") { // file is an object URL
					get_URL().revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			};
			if (view.chrome) {
				revoker();
			} else {
				setTimeout(revoker, arbitrary_revoke_timeout);
			}
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, auto_bom = function(blob) {
			// prepend BOM for UTF-8 XML and text/* types (including HTML)
			if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
				return new Blob(["\ufeff", blob], {type: blob.type});
			}
			return blob;
		}
		, FileSaver = function(blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, blob_changed = false
				, object_url
				, target_view
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					if (target_view && is_safari && typeof FileReader !== "undefined") {
						// Safari doesn't allow downloading of blob urls
						var reader = new FileReader();
						reader.onloadend = function() {
							var base64Data = reader.result;
							target_view.location.href = "data:attachment/file" + base64Data.slice(base64Data.search(/[,;]/));
							filesaver.readyState = filesaver.DONE;
							dispatch_all();
						};
						reader.readAsDataURL(blob);
						filesaver.readyState = filesaver.INIT;
						return;
					}
					// don't create more object URLs than needed
					if (blob_changed || !object_url) {
						object_url = get_URL().createObjectURL(blob);
					}
					if (target_view) {
						target_view.location.href = object_url;
					} else {
						var new_tab = view.open(object_url, "_blank");
						if (new_tab == undefined && is_safari) {
							//Apple do not allow window.open, see http://bit.ly/1kZffRI
							view.location.href = object_url
						}
					}
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
					revoke(object_url);
				}
				, abortable = function(func) {
					return function() {
						if (filesaver.readyState !== filesaver.DONE) {
							return func.apply(this, arguments);
						}
					};
				}
				, create_if_not_found = {create: true, exclusive: false}
				, slice
			;
			filesaver.readyState = filesaver.INIT;
			if (!name) {
				name = "download";
			}
			if (can_use_save_link) {
				object_url = get_URL().createObjectURL(blob);
				save_link.href = object_url;
				save_link.download = name;
				setTimeout(function() {
					click(save_link);
					dispatch_all();
					revoke(object_url);
					filesaver.readyState = filesaver.DONE;
				});
				return;
			}
			// Object and web filesystem URLs have a problem saving in Google Chrome when
			// viewed in a tab, so I force save with application/octet-stream
			// http://code.google.com/p/chromium/issues/detail?id=91158
			// Update: Google errantly closed 91158, I submitted it again:
			// https://code.google.com/p/chromium/issues/detail?id=389642
			if (view.chrome && type && type !== force_saveable_type) {
				slice = blob.slice || blob.webkitSlice;
				blob = slice.call(blob, 0, blob.size, force_saveable_type);
				blob_changed = true;
			}
			// Since I can't be sure that the guessed media type will trigger a download
			// in WebKit, I append .download to the filename.
			// https://bugs.webkit.org/show_bug.cgi?id=65440
			if (webkit_req_fs && name !== "download") {
				name += ".download";
			}
			if (type === force_saveable_type || webkit_req_fs) {
				target_view = view;
			}
			if (!req_fs) {
				fs_error();
				return;
			}
			fs_min_size += blob.size;
			req_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {
				fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
					var save = function() {
						dir.getFile(name, create_if_not_found, abortable(function(file) {
							file.createWriter(abortable(function(writer) {
								writer.onwriteend = function(event) {
									target_view.location.href = file.toURL();
									filesaver.readyState = filesaver.DONE;
									dispatch(filesaver, "writeend", event);
									revoke(file);
								};
								writer.onerror = function() {
									var error = writer.error;
									if (error.code !== error.ABORT_ERR) {
										fs_error();
									}
								};
								"writestart progress write abort".split(" ").forEach(function(event) {
									writer["on" + event] = filesaver["on" + event];
								});
								writer.write(blob);
								filesaver.abort = function() {
									writer.abort();
									filesaver.readyState = filesaver.DONE;
								};
								filesaver.readyState = filesaver.WRITING;
							}), fs_error);
						}), fs_error);
					};
					dir.getFile(name, {create: false}, abortable(function(file) {
						// delete file if it already exists
						file.remove();
						save();
					}), abortable(function(ex) {
						if (ex.code === ex.NOT_FOUND_ERR) {
							save();
						} else {
							fs_error();
						}
					}));
				}), fs_error);
			}), fs_error);
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name, no_auto_bom) {
			return new FileSaver(blob, name, no_auto_bom);
		}
	;
	// IE 10+ (native saveAs)
	if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
		return function(blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			return navigator.msSaveOrOpenBlob(blob, name || "download");
		};
	}

	FS_proto.abort = function() {
		var filesaver = this;
		filesaver.readyState = filesaver.DONE;
		dispatch(filesaver, "abort");
	};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;

	return saveAs;
}(
	   typeof self !== "undefined" && self
	|| typeof window !== "undefined" && window
	|| this.content
));


/**
 * Created by Andrea on 22/07/2015.
 */

 angular.module("sam-1").controller("ReportsCtrl",['$scope','$meteor','notificationService','ModalService','AgeCalculatorService','PrintService','SELECTORS',
    function($scope, $meteor,notificationService, ModalService, AgeCalculatorService, PrintService,SELECTORS) {
      $scope.selectors = SELECTORS;
      $scope.inTypes = AgeCalculatorService.inTypes;
      $scope.initialDate = new Date();
      $scope.endDate = new Date();

      $scope.analisys = $meteor.collection(Analisys, false);
      $scope.services = $meteor.collection(Services, false);
      $scope.attentions = $meteor.collection(Attentions, false);
      $scope.results = [];
      $scope.completeStatistics = false;

      var transformFunction = function(doc){
              if(doc.patient){
                var patient = $meteor.object(Patients, doc.patient);
                doc.patientName = patient.lastName+" "+patient.lastNameMother+" "+patient.name;
                if(!!patient.age){
                	doc.age = {value:patient.age.value, in : patient.age.in};
                }
              }
              if(doc.doctor){
                var doctor = $meteor.object(Doctors,doc.doctor);
                doc.doctorName = doctor.lastName + " " + doctor.name;
              }
              if(doc.attention){
                	var attentionEs = $meteor.object(Attentions, doc.attention);
                  	doc.attentionName = attentionEs.name;
                }
                if(doc.service){
                	var serviceEs = $meteor.object(Services, doc.service);
                  	doc.serviceName = serviceEs.name;
                }
              return doc;
        };

      

      $scope.changeStatisticType = function(statisticType){
      	$scope.completeStatistics = !($scope.completeStatistics);
      	console.log(statisticType);
      }
      $scope.createDateReport = function(initialDate, endDate){
      	$scope.initialDate = initialDate;
      	$scope.endDate = endDate;
        $scope.results = Studies.find(
            {
              "creationDate": {"$gte": initialDate, "$lte": endDate}
            }
            ,{
            transform: transformFunction,
            sort: {creationDate:1}
          }).fetch();
        $scope.nroResults = $scope.results.length;
       };

      $scope.createPatientReport = function(pInitialDate,pEndDate, gender,pInitialAge,pEndAge,selectedInType){
        $scope.initialDate = pInitialDate;
        $scope.endDate = pEndDate;
        var genderPatients = $meteor.collection(function(){
            return Patients.find({$and:[
              {"age.value": {"$gte": pInitialAge, "$lte": pEndAge}},
              {"age.in":selectedInType},
              {"gender":gender}
            ]});
        },false);
        var patientIds = [];
        angular.forEach(genderPatients, function(patient){
            patientIds.push(patient._id);
        });
        $scope.nroResultsPatient = genderPatients.length;

        $scope.results = Studies.find(
            {$and:[
              {"creationDate": {"$gte": pInitialDate, "$lte": pEndDate}},
              {"patient":{$in:patientIds}}
            ]}
              ,{
                transform: transformFunction,
            	sort: {creationDate:1}
              }).fetch();
        	$scope.nroResults = $scope.results.length;
      }
      $scope.createAnalisysReport = function(initialDate, endDate, selectedAnalisys){
        $scope.results = Studies.find(
            {$and:[
                   {"creationDate": {"$gte": initialDate, "$lte": endDate}}
                   ,
                  {"analisys":{
                       $elemMatch:{"analisys":selectedAnalisys._id  }
                      }
                }
            ]}
            ,{
            	transform: transformFunction,
            	sort: {creationDate:1}
          }).fetch();
        $scope.nroResults = $scope.results.length;
      }


      $scope.createProcedenceReport = function(initialDate, endDate, attention, service, gender){
          $scope.initialDate = initialDate;
          $scope.endDate = endDate;
          var genderPatients = $meteor.collection(function(){
            return Patients.find({"gender":gender});
          },false);
          var patientIds = [];
          angular.forEach(genderPatients, function(patient){
            patientIds.push(patient._id);
          });
          $scope.nroResultsPatient = genderPatients.length;

          var query = [{"creationDate": {"$gte": initialDate, "$lte": endDate}},{"patient":{$in:patientIds}}];
          if(attention != $scope.selectors.ALL){
          	query.push({"attention":attention._id});
          }
          if(service != $scope.selectors.ALL){
          	query.push({"service":service._id});	
          }
        $scope.results = Studies.find(
            {$and:query}
              ,{
                transform: transformFunction,
            	sort: {creationDate:1}
              }).fetch();
        	$scope.nroResults = $scope.results.length;
      }


      $scope.createDiscriminated = function(pInitialDate,pEndDate){
      	//Creating keys
      	$scope.keys = {};
      	angular.forEach($scope.attentions, function(attention){
        	var detail = {};
        	angular.forEach($scope.services, function(service){
        	  	detail[service._id] = 0;
        	});
        	$scope.keys[attention._id] = detail;
      	});
      	//Creating template
        $scope.template = {};
        var analisysList = $meteor.collection(Analisys,false);
        angular.forEach(analisysList, function(analisys){
          var titles = {};
          var titlesP = Titles.find({analisys:analisys._id}).fetch();
          angular.forEach(titlesP, function(title){
            var exams = {};
            var examsP = Exams.find({title:title._id}).fetch();
            angular.forEach(examsP, function(exam){
                exams[exam._id] = {name:"Ej",select:exam.selectable,exams:exam.exams,visible:exam.visible, result: JSON.parse(JSON.stringify($scope.keys))};
            });
            titles[title._id] = {name: title.name,select:title.selectable,visible:title.visible, exams:exams, result: JSON.parse(JSON.stringify($scope.keys))};
          });
          $scope.template[analisys._id] = {name: analisys.name,select:analisys.selectable, titles:titles, result: JSON.parse(JSON.stringify($scope.keys))};
        });

        angular.forEach($scope.keys, function(servicesArray,attentionKey){
          angular.forEach(servicesArray, function(values,serviceKey){
            var resultsByAttentionAndSer = Studies.find(
                {$and:[
                       {"creationDate": {"$gte": pInitialDate, "$lte": pEndDate}}
                  ,
                   {"attention":attentionKey}
                  ,
                  {"service": serviceKey},
                  { "dailyCode": { $exists: true } },
            	  { "dailyCode": {$ne:null} }
              ]}).fetch();
            var evaluateSumAnalisys = false;
            var evaluateSumTitle = false;
            var evaluateSumExam = false;
            angular.forEach(resultsByAttentionAndSer, function(studyRes){
              angular.forEach(studyRes.analisys, function(analisys){
                var analisysCode = analisys.analisys;
                evaluateSumAnalisys = $scope.evaluateAnalisys(analisysCode,attentionKey,serviceKey);
                if(!evaluateSumAnalisys){
                	angular.forEach(analisys.titles, function(title){
                  		var titleCode = title.title;
                  		evaluateSumTitle = $scope.evaluateTitle(analisysCode, titleCode,attentionKey,serviceKey);
                  		if(!evaluateSumTitle){
                  			angular.forEach(title.exams, function(exam){
                    			var examCode = exam.exam;
								$scope.evaluateExam(analisysCode, titleCode,examCode,attentionKey,serviceKey);
                  			});
                  		}
                	});
                }                
              });
            });
          });
        });
      }

      $scope.evaluateAnalisys = function(analisysCode,attentionKey,serviceKey){
      	var selectable = $scope.template[analisysCode].select;
      	if(selectable){
      		 $scope.template[analisysCode].result[attentionKey][serviceKey]+=1;
      	}
      	return selectable;
      }

	  $scope.evaluateTitle = function(analisysCode,titleCode, attentionKey, serviceKey){
	  	var selectable = $scope.template[analisysCode].titles[titleCode].select;
      	if(selectable){
      		 $scope.template[analisysCode].titles[titleCode].result[attentionKey][serviceKey]+=1;
      		 $scope.template[analisysCode].result[attentionKey][serviceKey]+=1;
      	}
      	return selectable;
      }

	  $scope.evaluateExam = function(analisysCode, titleCode,examCode,attentionKey,serviceKey){
	    $scope.template[analisysCode].titles[titleCode].exams[examCode].result[attentionKey][serviceKey]+=1;
	    $scope.template[analisysCode].titles[titleCode].result[attentionKey][serviceKey]+=1;
	    $scope.template[analisysCode].result[attentionKey][serviceKey]+=1;
      }      
      $scope.exportExcel = function () {
       var blob = new Blob([document.getElementById('exportable').innerHTML], {
           type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
       });
       saveAs(blob, "Discriminado.xls");
     };

      $scope.printReport = function(){
      	PrintService.printReportStudies($scope.results, $scope.initialDate, $scope.endDate);
      }

      $scope.printReportByProcedence = function(){
      	PrintService.printReportStudiesByProcedence($scope.results, $scope.initialDate, $scope.endDate, $scope.selectedAttention,$scope.selectedService);
      }

      $scope.printReportByPatient = function(){
      	PrintService.printReportStudiesByPatient($scope.results, $scope.initialDate, $scope.endDate, $scope.gender,$scope.pInitialAge,$scope.pEndAge,$scope.selectedInType, $scope.nroResultsPatient);
      }

      $scope.printReportByAnalisys = function(pInitialDate,pEndDate,selectedAnalisys){
      	PrintService.printReportStudiesByAnalisys($scope.results, pInitialDate, pEndDate, selectedAnalisys);
      }
}]);
