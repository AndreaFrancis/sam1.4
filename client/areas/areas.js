angular.module("sam-1").controller("AreasListCtrl",['$scope','$meteor','ModalService','notificationService','PrintService',
    function($scope, $meteor,ModalService,notificationService,PrintService) {

        $scope.page = 1;
        $scope.perPage = 3;
        $scope.sort = {name: 1};
        $scope.headers = ['Nombre', 'Descripcion','Acciones'];

        Meteor.subscribe('counters', function() {
          $scope.areasCount = $meteor.object(Counts ,'areas', false);
         });

        $scope.update = function(){
          $scope.areas = $meteor.collection(function(){
          return Areas.find({}, {limit: parseInt($scope.perPage),
                                    skip: parseInt(($scope.page - 1) * $scope.perPage),
                                    sort: $scope.sort});
          }, false);
        }

        $scope.showAddNew = function(ev) {
            ModalService.showModalWithParams(AddAreaController,  'client/areas/addArea.tmpl.ng.html',ev, {area:null});
        }

        $scope.print = function(){
          PrintService.printAreas($scope.areas);
        }

        $scope.delete = function(area,$event) {
          $scope.onRemoveCancel = function() {
              console.log("Se cancelo la eliminacion del Area");
          }
          $scope.onRemoveConfirm = function() {
            $scope.areas.remove(area).then(function(number) {
              notificationService.showSuccess("Se ha eliminado correctamente el area");
            }, function(error){
              notificationService.showError("Error en la eliminacino del area");
              console.log(error);
            });
          }
          ModalService.showConfirmDialog('Eliminar area', '¿Estas seguro de eliminar el area?', 'Eliminar', 'Cancelar', $event, $scope.onRemoveCancel, $scope.onRemoveConfirm);
          $event.stopPropagation();
        }

        $scope.show = function(selectedArea, ev) {
          ModalService.showModalWithParams(AddAreaController,  'client/areas/addArea.tmpl.ng.html',ev, {area:selectedArea});
        }

        $scope.search = function(){
          $scope.areas = $meteor.collection(function(){
          return Areas.find({
                      "name" : { $regex : '.*' + $scope.searchText || '' + '.*', '$options' : 'i' }
                  });
          }, false);
        }

        $scope.showAll = function(){
          $scope.perPage = $scope.areasCount.count;
        }
        
        $scope.pageChanged = function(newPage) {
          $scope.page = newPage;
          $scope.update();
        };

        $scope.update();
    }]);

function AddAreaController($scope,$mdDialog, $meteor, area ,notificationService) {
    if(area) {
      $scope.area = area;
    }
    $scope.areas = $meteor.collection(Areas, false);
    $scope.save = function() {
        $scope.areas.save($scope.area).then(function(number) {
            notificationService.showSuccess("Se ha registrado correctamente el area");
        }, function(error){
            notificationService.showError("Error en el registro del area");
            console.log(error);
        });
        $scope.area = '';
        $mdDialog.hide();
    }

    $scope.cancel = function() {
        $mdDialog.cancel();
    }
}

angular.module("sam-1").directive('area',function() {
  return {
    require : 'ngModel',
    link : function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        if(!value || value.length == 0) return;
        if(Areas.find({name: value}).count()>0){
          ngModel.$setValidity('duplicated', false);
        }else {
          ngModel.$setValidity('duplicated', true);
        }
        return value;
      })
    }
  }
});
