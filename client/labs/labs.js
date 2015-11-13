angular.module("sam-1").controller("LabsListCtrl",['$scope','$meteor','ModalService','notificationService','PrintService',
    function($scope, $meteor,ModalService,notificationService,PrintService) {

        $scope.page = 1;
        $scope.perPage = 3;
        $scope.sort = {name: 1};
        $scope.headers = ['Nombre', 'Descripcion','Acciones'];

        Meteor.subscribe('counters', function() {
          $scope.labsCount = $meteor.object(Counts ,'labs', false);
         });

        $scope.update = function(){
          $scope.labs = $meteor.collection(function(){
          return Labs.find({}, {limit: parseInt($scope.perPage),
                                    skip: parseInt(($scope.page - 1) * $scope.perPage),
                                    sort: $scope.sort});
          }, false);
        }

        $scope.showAddNew = function(ev) {
            ModalService.showModalWithParams(AddLabController,  'client/labs/addLab.tmpl.ng.html',ev, {lab:null});
        }

        $scope.print = function(){
          PrintService.printLabs($scope.labs);
        }

        $scope.delete = function(lab,$event) {
          $scope.onRemoveCancel = function() {
              console.log("Se cancelo la eliminacion del laboratorio");
          }
          $scope.onRemoveConfirm = function() {
            $scope.labs.remove(lab).then(function(number) {
              notificationService.showSuccess("Se ha eliminado correctamente el laboratorio");
            }, function(error){
              notificationService.showError("Error en la eliminacino del laboratorio");
              console.log(error);
            });
          }
          ModalService.showConfirmDialog('Eliminar laboratorio', '¿Estas seguro de eliminar el laboratorio?', 'Eliminar', 'Cancelar', $event, $scope.onRemoveCancel, $scope.onRemoveConfirm);
          $event.stopPropagation();
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

        $scope.showAll = function(){
          $scope.perPage = $scope.labsCount.count;
        }
        
        $scope.pageChanged = function(newPage) {
          $scope.page = newPage;
          $scope.update();
        };

        $scope.update();
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
