/**
 * Created by Andrea on 22/07/2015.
 */

angular.module("sam-1").controller("ReportsCtrl",['$scope','$meteor','notificationService','ModalService',
    function($scope, $meteor,notificationService, ModalService) {
      $scope.initialDate = new Date();
      $scope.endDate = new Date();

      $scope.analisys = $meteor.collection(Analisys, false);
      $scope.services = $meteor.collection(Services, false);
      $scope.attentions = $meteor.collection(Attentions, false);
      $scope.results = [];

      $scope.createDateReport = function(initialDate, endDate){
        $scope.results = $meteor.collection(function(){
          return Studies.find(
            {
              "creationDate": {"$gte": initialDate, "$lt": endDate}
            }
            ,{
            transform:function(doc){
              if(doc.patient){
                var patient = $meteor.object(Patients, doc.patient);
                doc.patientName = patient.lastName+" "+patient.lastNameMother+" "+patient.name;
                doc.age = $scope.calculateAge(patient.birthdate);
              }
              if(doc.doctor){
                var doctor = $meteor.object(Doctors,doc.doctor);
                doc.doctorName = doctor.lastName + " " + doctor.name;
              }
              return doc;
            }
          });
        },false);
      }
      $scope.createGenderReport = function(initialDate, endDate, gender){
        var genderPatients = $meteor.collection(function(){
            return Patients.find({"gender":gender});
        },false);
        var patientIds = [];
        angular.forEach(genderPatients, function(patient){
            patientIds.push(patient._id);
        });

        $scope.results = $meteor.collection(function(){
            return Studies.find(
            {$and:[
              {"creationDate": {"$gte": initialDate, "$lt": endDate}},
              {"patient":{$in:patientIds}}
            ]}
              ,{
                transform:function(doc){
                  if(doc.patient){
                    var patient = $meteor.object(Patients, doc.patient);
                    doc.patientName = patient.lastName+" "+patient.lastNameMother+" "+patient.name;
                    doc.age = $scope.calculateAge(patient.birthdate);
                    doc.gender = patient.gender;
                  }
                  if(doc.doctor){
                    var doctor = $meteor.object(Doctors,doc.doctor);
                    doc.doctorName = doctor.lastName + " " + doctor.name;
                  }
                  return doc;
                }
              });
            },false);

      }
      $scope.createAnalisysReport = function(initialDate, endDate, selectedAnalisys){
        $scope.results = $meteor.collection(function(){
          return Studies.find(
            {$and:[
                   {"creationDate": {"$gte": initialDate, "$lt": endDate}}
                   ,
                  {"analisys":{
                       $elemMatch:{"analisys":selectedAnalisys  }
                      }
                }
            ]}
            ,{
            transform:function(doc){
              if(doc.patient){
                var patient = $meteor.object(Patients, doc.patient);
                doc.patientName = patient.lastName+" "+patient.lastNameMother+" "+patient.name;
                doc.age = $scope.calculateAge(patient.birthdate);
              }
              if(doc.doctor){
                var doctor = $meteor.object(Doctors,doc.doctor);
                doc.doctorName = doctor.lastName + " " + doctor.name;
              }
              return doc;
            }
          });
        },false);
      }


      $scope.createProcedenceReport = function(initialDate, endDate, attention, service){
          $scope.results = $meteor.collection(function(){
            return Studies.find(
              {$and:[
                     {"creationDate": {"$gte": initialDate, "$lt": endDate}}
                ,
                 {"attention":attention}
                ,
                {"service": service}
              ]}
              ,{
              transform:function(doc){
                if(doc.patient){
                  var patient = $meteor.object(Patients, doc.patient);
                  doc.patientName = patient.lastName+" "+patient.lastNameMother+" "+patient.name;
                  doc.age = $scope.calculateAge(patient.birthdate);
                }
                if(doc.doctor){
                  var doctor = $meteor.object(Doctors,doc.doctor);
                  doc.doctorName = doctor.lastName + " " + doctor.name;
                }
                return doc;
              }
            });
          },false);
      }

      $scope.printDiv = function (divName)
      {
        var divToPrint=document.getElementById(divName);
        newWin= window.open("");
        newWin.document.write(divToPrint.outerHTML);
        newWin.print();
        newWin.close();
      }

      $scope.calculateAge = function getAge(date) {
        var dateString = date.toString();
        var birthdate = new Date(dateString).getTime();
        var now = new Date().getTime();
        var n = (now - birthdate)/1000;
        if (n < 604800) { // less than a week
          var day_n = Math.floor(n/86400);
          return day_n + ' dia' + (day_n > 1 ? 's' : '');
        } else if (n < 2629743) {  // less than a month
          var week_n = Math.floor(n/604800);
          return week_n + ' semana' + (week_n > 1 ? 's' : '');
        } else if (n < 63113852) { // less than 24 months
          var month_n = Math.floor(n/2629743);
          return month_n + ' mes' + (month_n > 1 ? 'es' : '');
        } else {
          var year_n = Math.floor(n/31556926);
          return year_n + ' año' + (year_n > 1 ? 's' : '');
        }
      }

}]);
