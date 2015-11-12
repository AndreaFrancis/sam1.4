/**
 * Created by Andrea on 26/07/2015.
 */
angular.module("sam-1").controller("PatientsListCtrl",['$scope','notificationService','ModalService','$rootScope','$state','$meteor','PrintService',
    function($scope,notificationService, ModalService, $rootScope, $state, $meteor,PrintService) {


        $scope.patients = $meteor.collection(Patients, false);
        $scope.headers = ['Apellidos', 'Nombre','Ci', 'Acciones'];
        $scope.searchText = '';
        var userRol = localStorage.getItem("rolName");
        $scope.isBioquimic = userRol=="Bioquimico";

        $scope.print = function(){
          PrintService.printPatients($scope.patients);
        }

        $scope.showAddNew = function(ev) {
            ModalService.showModalWithParams(AddPatientController, 'client/patients/addPatient.tmpl.ng.html', ev, {patient:null});
        }

        $scope.goStudies = function(patient) {
            $state.go('patient',{patientId:patient._id});
        }

        $scope.show = function(selectedPatient, ev){
          ModalService.showModalWithParams(AddPatientController, 'client/patients/addPatient.tmpl.ng.html', ev, {patient:selectedPatient});
        }

        $scope.search = function(){
              /*
              $scope.patients = $meteor.collection(function(){
                return Patients.find({'$or':[
                  {
                      name : { $regex : '.*' + $scope.searchText || '' + '.*', '$options' : 'i' }
                  },{
                      lastName : { $regex : '.*' + $scope.searchText || '' + '.*', '$options' : 'i' }
                  },{
                      lastNameMother : { $regex : '.*' + $scope.searchText || '' + '.*', '$options' : 'i' }
                  },{
                      ci : { $regex : '.*' + $scope.searchText || '' + '.*', '$options' : 'i' }
                  }
                ]});
              }, false);*/

              Meteor.call("findPatient", $scope.searchText, function(err, result) {
                  if(err) {
                      notificationService.showError("No se pudo conectar al servidor SQL");
                      console.log(err);
                  }else{
                      alert(result);
                  }
              });
        }
    }]);


AddPatientController = function ($scope, notificationService, $mdDialog, patient,$meteor,AgeCalculatorService) {

    $scope.inType  = AgeCalculatorService.inTypes;
    if(patient){
      $scope.patient = patient;
    }
    $scope.patients = $meteor.collection(Patients, false);

    $scope.save = function() {
        $scope.patients.save($scope.patient).then(function(number) {
            notificationService.showSuccess("Se ha registrado correctamente el paciente");
        }, function(error){
            notificationService.showError("Error en el registro del paciente");
            console.log(error);
        });
        $scope.patient = '';
        $mdDialog.hide();
    }

    $scope.cancel = function() {
        $mdDialog.cancel();
    }
}



angular.module("sam-1").directive('patientCi',function() {
  return {
    require : 'ngModel',
    link : function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        if(!value || value.length == 0) return;
        if(Patients.find({ci: value}).count()>0){
          ngModel.$setValidity('duplicated', false);
        }else {
          ngModel.$setValidity('duplicated', true);
        }
        return value;
      })
    }
  }
});
angular.module("sam-1").directive('patientHc',function() {
  return {
    require : 'ngModel',
    link : function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        if(!value || value.length == 0) return;
        if(Patients.find({medHis: value}).count()>0){
          ngModel.$setValidity('duplicated', false);
        }else {
          ngModel.$setValidity('duplicated', true);
        }
        return value;
      })
    }
  }
});

angular.module("sam-1").controller("AddPatientController", AddPatientController);
