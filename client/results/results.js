/**
 * Created by Andrea on 26/07/2015.
 */

angular.module("sam-1").controller("ResultsListCtrl",['$scope','$meteor','notificationService','ModalService','$state',
    function($scope, $meteor,notificationService, ModalService, $state) {
        var query = {};
        var conditionNotProgramed = {$and:
          [
            { "dailyCode": { $exists: true } },
            { "dailyCode": {$ne:null} }
          ]};
        $scope.headers = ["Labs","Codigo", "Paciente", "Fecha", "Acciones"];

        if(localStorage.getItem("rol") == "Bioquimico"){
            query = {bioquimic: localStorage.getItem("user")};
        }

        if(localStorage.getItem("rol") == "Doctor"){
            query = {creatorId: localStorage.getItem("user")};
        }

        $scope.getAllStudies = function(){
          $scope.studies = $meteor.collection(function() {
              return Studies.find({$and:[query,conditionNotProgramed]}, {
                  transform: function(doc) {
                      doc.patientObj = {};
                      if(doc.patient) {
                          var patientObj = $meteor.collection(function(){
                              return Patients.find({_id: {"$in": [doc.patient]}});
                          });
                          doc.patientObj = patientObj[0];
                      }

                      if(doc.labsCounter) {
                          var labsObj = [];
                          angular.forEach(doc.labsCounter, function(lab){
                            var labObj = $meteor.object(Labs,lab.lab);
                            var style = "{border-radius: 50%;width: 36px;height: 36px;padding: 8px;background: #fff;border: 2px solid #666;color: #666;text-align: center;font: 20px Arial, sans-serif;}";

                            labsObj.push({name:labObj.name, style:style, counter: lab.counter});
                          });
                          doc.labsObj = labsObj;
                      }

                      doc.doctorObj = {};
                      if(!!doc.doctor){
                        var doctorObj = $meteor.collection(function(){
                            return Doctors.find({_id: {"$in": [doc.doctor]}});
                        });
                        doc.doctorObj = doctorObj[0];
                      }

                      doc.creatorName = {};
                      if(doc.creatorId) {
                          var creatorName = $meteor.collection(function(){
                              return Users.find({_id: {"$in": [doc.creatorId]}});
                          });
                          if(creatorName[0]) {
                              doc.creatorName = creatorName[0].profile.name + " "+ creatorName[0].profile.lastName;
                          }
                      }

                      return doc;
                  }
              });
          }, false);
        }


        $scope.search = function(){
            query = {dailyCode : { $regex : '.*' + $scope.searchText || '' + '.*', '$options' : 'i' }}
            $scope.getAllStudies();
        }


        $scope.show = function(study, ev) {
            $state.go('study',{studyId:study._id});
        }

        $scope.delete = function(study, event){
          event.stopPropagation();
          ModalService.showModalWithParams('AddReasonController',  'client/studies/addReason.tmpl.ng.html',event, {study:study});
        }
        $scope.getAllStudies();
    }]);
