/**
 * Created by Andrea on 26/07/2015.
 */

angular.module("sam-1").controller("ResultsListCtrl",['$scope','$meteor','notificationService','ModalService','$state',
    function($scope, $meteor,notificationService, ModalService, $state) {
        $scope.page = 1;
        $scope.perPage = 3;
        $scope.sort = {dailyCode: 1};

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

        Meteor.subscribe('counters', function() {
          $scope.studiesCount = $meteor.object(Counts ,'results', false);
        });

        $scope.update = function(){
          $scope.studies = Studies.find({$and:[query,conditionNotProgramed]}, {
                  transform: function(doc) {
                      doc.patientObj = {};
                      if(doc.patient) {
                          var patientObj = $meteor.object(Patients, doc.patient);
                          doc.patientObj = patientObj;
                      }

                      if(doc.labsCounter) {
                          var labsObj = [];
                          angular.forEach(doc.labsCounter, function(lab){
                            var labObj = $meteor.object(Labs,lab.lab);
                            labsObj.push({name:labObj.name, counter: lab.counter});
                          });
                          doc.labsObj = labsObj;
                      }

                      doc.doctorObj = {};
                      if(!!doc.doctor){
                        var doctorObj = $meteor.object(Doctors, doc.doctor);
                        doc.doctorObj = doctorObj;
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
                  skip: parseInt(($scope.page - 1) * $scope.perPage),
                  sort: $scope.sort
              }).fetch();
        }


        $scope.search = function(){
            query = {dailyCode : { $regex : '.*' + $scope.searchText || '' + '.*', '$options' : 'i' }}
            $scope.update();
        }


        $scope.show = function(study, ev) {
            $state.go('study',{studyId:study._id});
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
