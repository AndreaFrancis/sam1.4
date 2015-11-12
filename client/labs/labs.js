angular.module("sam-1").controller("LabsListCtrl",['$scope','$meteor','ModalService','notificationService','PrintService',
    function($scope, $meteor,ModalService,notificationService,PrintService) {

        $scope.labs = $meteor.collection(Labs, false);
        $scope.headers = ['Nombre', 'Descripcion','Acciones'];

        $scope.showTextSearch = true;
        $scope.showAddNew = function(ev) {
            ModalService.showModalWithParams(AddLabController,  'client/labs/addLab.tmpl.ng.html',ev, {lab:null});
        }
        $scope.toggleSearch = function() {
            $scope.showTextSearch = !$scope.showTextSearch;
        }

        $scope.print = function(){
          PrintService.printLabs($scope.labs);
        }

        $scope.delete = function(lab) {
          $scope.labs.remove(lab).then(function(number) {
              notificationService.showSuccess("Se ha eliminado correctamente el laboratorio");
          }, function(error){
              notificationService.showError("Error en la eliminacino del laboratorio");
              console.log(error);
          });
        }

        $scope.show = function(selectedLab, ev) {
          ModalService.showModalWithParams(AddLabController,  'client/labs/addLab.tmpl.ng.html',ev, {lab:selectedLab});
        }

        $scope.search = function(){
          $scope.labs = $meteor.collection(function(){
          return Labs.find({
                      "name" : { $regex : '.*' + $scope.searchText || '' + '.*', '$options' : 'i' }
                  });
          }, false);
        }

    }]);

function AddLabController($scope,$mdDialog, $meteor, lab ,notificationService) {
    if(lab) {
      $scope.lab = lab;
    }
    $scope.labs = $meteor.collection(Labs, false);
    $scope.save = function() {
      var width = parseInt($scope.lab.width);
      $scope.lab.width = width;
      var heigth = parseInt($scope.lab.heigth);
      $scope.lab.heigth = heigth;

        $scope.labs.save($scope.lab).then(function(number) {
            notificationService.showSuccess("Se ha registrado correctamente el laboratorio");
        }, function(error){
            notificationService.showError("Error en el registro del laboratorio");
            console.log(error);
        });
        $scope.lab = '';
        $mdDialog.hide();
    }

    $scope.cancel = function() {
        $mdDialog.cancel();
    }
}

angular.module("sam-1").directive('lab',function() {
  return {
    require : 'ngModel',
    link : function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        if(!value || value.length == 0) return;
        if(Labs.find({symbol: value}).count()>0){
          ngModel.$setValidity('duplicated', false);
        }else {
          ngModel.$setValidity('duplicated', true);
        }
        return value;
      })
    }
  }
});