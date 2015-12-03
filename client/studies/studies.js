function verifyText(textToVerify){
  var text = "";
  if(!!textToVerify){
    text = textToVerify;
  }
  return text;
}
/**
 * Created by Andrea on 26/07/2015.
 */

angular.module("sam-1").controller("StudiesListCtrl",['$scope','$meteor','notificationService','ModalService','$state',
    function($scope, $meteor,notificationService, ModalService, $state) {

        $scope.page = 1;
        $scope.perPage = 3;
        var query = {};
        var conditionNotProgramed = {$or:
          [
            { "dailyCode": { $exists: false } },
            { "dailyCode": null }
          ]};
        $scope.headers = ["Codigo", "Paciente", "Fecha","Acciones"];
        var userRol = localStorage.getItem("rolName");
        $scope.isBioquimic = userRol=="Bioquimico";
        $scope.isDoctor = userRol=="Doctor";
        if($scope.isBioquimic){
            query = conditionNotProgramed;
        }

        if($scope.isDoctor){
            query = {creatorId: localStorage.getItem("user")};
        }


         Meteor.subscribe('counters', function() {
          $scope.studiesCount = $meteor.object(Counts ,'studies', false);
         });

         $scope.update = function(){
          $scope.studies = Studies.find(query, {
                transform: function(doc) {
                    doc.patientObj = {};
                    if(doc.patient) {
                        doc.patientObj = $meteor.object(Patients, doc.patient);
                    }

                    doc.doctorObj = {};
                    if(!!doc.doctor){
                      doc.doctorObj = $meteor.object(Doctors, doc.doctor);
                    }

                    doc.creatorName = {};
                    if(doc.creatorId) {
                        var creatorName = $meteor.object(Users, doc.creatorId);
                        if(creatorName) {
                            doc.creatorName = creatorName.profile.name + " "+ creatorName.profile.lastName;
                        }
                    }
                    return doc;
                },
                limit: parseInt($scope.perPage),
                skip: parseInt(($scope.page - 1) * $scope.perPage)
            }).fetch();
        }

        $scope.show = function(study, ev) {
            $state.go('study',{studyId:study._id});
        }

        $scope.showAddNew = function($event) {
            $state.go('newstudy',{patientId:null});
        }

        $scope.delete = function(study, event){
          event.stopPropagation();
          ModalService.showModalWithParams('AddReasonController',  'client/studies/addReason.tmpl.ng.html',event, {study:study});
        }

        $scope.showAll = function(){
          $scope.perPage = $scope.studiesCount.count;
        }
        $scope.pageChanged = function(newPage) {
          $scope.page = newPage;
          $scope.update();
        };

        $scope.update();
}]);

angular.module("sam-1").controller("AddReasonController",AddReasonController);
function AddReasonController($scope, $meteor, study, $mdDialog, notificationService){
  $scope.reasons = $meteor.collection(Reasons);
  $scope.studies = $meteor.collection(Studies);
  $scope.cancel = function() {
      $mdDialog.cancel();
  }

  $scope.delete = function(){
      var patientName = verifyText(study.patientObj.lastName)+" "+verifyText(study.patientObj.lastNameMother)+" "+verifyText(study.patientObj.name);
      var doctorName = verifyText(study.doctorObj.lastName)+" "+ verifyText(study.doctorObj.lastNameMother)+" "+verifyText(study.doctorObj.name);
      var dailyCode = verifyText(study.dailyCode);
      var reasonObj = {
         reason: $scope.reason,
         study: study._id,
         patient: patientName,
         doctor: doctorName,
         creator: study.creatorName,
         date: new Date(),
         dailyCode: dailyCode}
      $scope.reasons.save(reasonObj).then(function(number) {
        $scope.studies.remove(study);
        notificationService.showSuccess("Se ha eliminado el estudio");
      }, function(error){
          notificationService.showError("Error al eliminar el estudio");
          console.log(error);
      });

      $mdDialog.hide();
  }
}

angular.module("sam-1").controller("AddStudyController",AddStudyController);
function AddStudyController($scope, $meteor, notificationService, $stateParams, ModalService,$state, CONDITIONS) {
    var patientId =  $stateParams.patientId;
    var userRol = localStorage.getItem("rolName");
    $scope.study = {};
    $scope.conditions = CONDITIONS;
    $scope.isBioquimic = userRol=="Bioquimico";
    $scope.isDoctor = userRol=="Doctor";
    $scope.newDoctor = {};
    $scope.creationDate = new Date();
    $scope.labs = $meteor.collection(Labs,false);
    $scope.labsCounter = [];
    angular.forEach($scope.labs, function(lab){
      $scope.labsCounter.push({lab:lab._id, counter:0});
    });
    
    if($scope.isDoctor){
      var userId = localStorage.getItem("user");
      var doctor = Doctors.findOne({userId: userId});
      if(doctor){
        $scope.selectedDoctor = doctor;
      }
    }
    if(patientId){
        $scope.patient = $meteor.object(Patients, patientId);
        $scope.existingPatient = true;

    }else{
        $scope.study = {};
        $scope.study.internData = {};
        $scope.patients = Patients.find({}, {
                transform: function(doc) {
                    doc.fullName = (doc.lastName||"")+ " "+ (doc.lastNameMother||"") + " "+doc.name;
                    return doc;
                }
            }).fetch();
    }

    $scope.attentions = $meteor.collection(Attentions, false);
    $scope.services = $meteor.collection(Services, false);
    $scope.doctors = Doctors.find({},{
        transform: function(doc){
          doc.value = doc.name +" "+ doc.lastName;
          return doc;
        }
      }).fetch();

    $scope.studies = $meteor.collection(Studies, false);
    $scope.analisysList = Analisys.find({active:true},{
          transform: function(anDoc){
            anDoc.titles = Titles.find({$and:[{active:true},{analisys:anDoc._id}]},{
                transform: function(titDoc){
                    titDoc.exams = Exams.find({$and:[{active:true},{title:titDoc._id}]}).fetch();
                  return titDoc;
                }
              }).fetch();
            return anDoc;
          }
      }).fetch();


    $scope.searchBill = function($event){
      $scope.waiting = true;
      Meteor.call("findPatientByPay", $scope.study.bill, function(err,res) {
              if(err) {
                  notificationService.showError("No se encontro la factura");
                  console.log(err);
                  $scope.waiting = false;
              }else{
                  res.fullName = (res.lastName||"")+ " "+ (res.lastNameMother||"") + " "+res.name;
                  $scope.selectedItem = res;
                  $scope.waiting = false;
                  $scope.$apply();
              }
      });
      $event.stopPropagation();
    }
    $scope.createNewDoctor = function(ev){
      var refreshDoctors = function(){
        $scope.doctors = Doctors.find({},{
        transform: function(doc){
          doc.value = doc.name +" "+ doc.lastName;
          return doc;
        }
        }).fetch();
      }
      ModalService.showModalWithParams('AddDoctorController',  'client/doctors/addDoctor.tmpl.ng.html',ev, {doctor:null}, refreshDoctors);
    }

    $scope.createNewPatient = function(ev){
      ModalService.showModalWithParams('AddPatientController', 'client/patients/addPatient.tmpl.ng.html', ev, {patient:null});
    }

    $scope.changeAttention = function(){
      var attentionJson = $scope.selectedAttention;
      $scope.internData = attentionJson.name==CONDITIONS.INTERN_PATIENT;
      if($scope.internData) {
        $scope.study.internData = {};
      }else{
        delete $scope.study.internData;
      }
    }

    $scope.save = function() {      
        $scope.study.analisys = [];
        var attentionJson = JSON.parse($scope.selectedAttention);
        $scope.study.attention = attentionJson._id;
        var serviceJson = JSON.parse($scope.selectedService);
        $scope.study.service = serviceJson._id;
        angular.forEach($scope.analisysList, function(analisys)  {
            var component = {};
            component.titles = [];
            var anaShow = false;
            var anaBand = false;
            anaBand = analisys.selectable && (analisys.selected||false);
            
            angular.forEach(analisys.titles, function(title){
                var titleComponent = {};
                titleComponent.exams = [];
                var titleShow = false;
                var titleBand = title.selectable && (title.selected||false);
                angular.forEach(title.exams, function(exam){
                  var examComponent = {};
                  var examBand = exam.selectable && (exam.selected||false);
                  examComponent.exam = exam._id;
                  examComponent.results = [];
                  angular.forEach(exam.exams, function(e){
                    var result = {};
                    result.historial = [];
                    examComponent.results.push(result);
                  });
                  if(anaBand){
                    anaShow = true;
                    titleShow = true;
                    titleComponent.exams.push(examComponent);
                  }else{
                    if(titleBand){
                      anaShow = true;
                      titleShow = true;
                      titleComponent.exams.push(examComponent);
                    }else{
                      if(examBand){
                        anaShow = true;
                        titleShow = true;
                        titleComponent.exams.push(examComponent);
                      }
                    }
                  }
                });
                if(titleShow) {
                    titleComponent.title = title._id;
                    component.titles.push(titleComponent);
                    anaShow = true;
                }
            });
            if(anaShow){
                component.analisys = analisys._id;
                $scope.study.analisys.push(component);
                $scope.incrementAcordingToLab(analisys.lab);
            }
        });
        if(localStorage.getItem("rol") == "Doctor"){
            $scope.study.doctorUser = localStorage.getItem("user");
        }
        $scope.study.doctor = $scope.selectedDoctor._id;

        $scope.study.creatorId = localStorage.getItem("user");
        if($scope.patient) {
            $scope.study.patient = $scope.patient._id;
        }else {
            $scope.study.patient = $scope.selectedItem._id;
        }

        $scope.study.labsCounter = $scope.labsCounter;
        $scope.study.creationDate = $scope.creationDate;
        $scope.studies.save($scope.study).then(function(number) {
            notificationService.showSuccess("Se ha registrado correctamente el estudio");
        }, function(error){
            notificationService.showError("Error en el registro del estudio");
            console.log(error);
        });
        $state.go("studies");
    }

    $scope.incrementAcordingToLab = function(lab){
      var result = _.findWhere($scope.labsCounter, {lab: lab});
      if(result){
        var counter = result.counter+1;
        result.counter = counter;
      }
    }

    $scope.selectedItemChange = function(patient){
      $scope.selectedItem = patient;
    }
    $scope.selectedDoctorChange = function(doctor){
      $scope.selectedDoctor = doctor;
    }
    $scope.cancel = function() {
        $state.go("studies");
    }

    $scope.saveNewDoctor = function(){
        $scope.doctors.save($scope.newDoctor).then(function(number) {

        }, function(error){
            notificationService.showError("Error en el registro del rol");
            console.log(error);
        });
        $scope.newDoctor = '';
        $scope.createNewDoctor = false;
    }

    /**AUTOCOMPLETE**/
    $scope.isDisabled    = false;

    $scope.querySearch = function (query) {
        return query ? $scope.patients.filter( createFilterFor(query) ) : [];
    }

    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(item) {
            return (item.fullName.toLowerCase().indexOf(lowercaseQuery) >= 0);
        };
    }

    $scope.queryDoctors = function(query) {
        return query ? $scope.doctors.filter( createFilterForDoctor(query) ) : [];
    }

    function createFilterForDoctor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(item) {
            return (item.name.toLowerCase().indexOf(lowercaseQuery) >= 0);
        };
    }
}

angular.module("sam-1").directive('dailyStudy',function() {
  return {
    require : 'ngModel',
    link : function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        if(!value || value.length == 0) return;
        var studyDate = new Date(attrs.date);
        var month = studyDate.getMonth();
        var year = studyDate.getFullYear();
        var day = studyDate.getDate();
        var date = new Date(year,month, day);
        var endDate = new Date(year,month, day,23,59,59);
        var queryDate = {"creationDate": {"$gte": date}};
        var queryLess = {"creationDate": {"$lte": endDate}};

        var studies = Studies.find({$and:[{dailyCode: value},queryDate,queryLess]});
        if(studies.count()>0){
          ngModel.$setValidity('duplicated', false);
        }else {
          ngModel.$setValidity('duplicated', true);
        }
        return value;
      })
    }
  }
});
