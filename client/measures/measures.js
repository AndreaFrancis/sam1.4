angular.module("sam-1").controller("MeasuresListCtrl",['$scope','$meteor','ModalService','notificationService','PrintService',
    function($scope, $meteor,ModalService,notificationService,PrintService) {

        $scope.page = 1;
        $scope.perPage = 3;
        $scope.sort = {symbol: 1};
        $scope.headers = ['Simbolo', 'Nombre','Acciones'];

        Meteor.subscribe('counters', function() {
          $scope.measuresCount = $meteor.object(Counts ,'measures', false);
        });

        $scope.update = function(){
          $scope.measures = $meteor.collection(function(){
            return Measures.find({},{
              limit: parseInt($scope.perPage),
              skip: parseInt(($scope.page - 1) * $scope.perPage),
              sort: $scope.sort
            });
          }, false);
        }

        $scope.showAddNew = function(ev) {
            ModalService.showModalWithParams(AddMeasureController,  'client/measures/addMeasure.tmpl.ng.html',ev, {measure:null});
        }

        $scope.print = function(){
          PrintService.printMeasures($scope.measures);
        }

        $scope.delete = function(measure,$event) {
          $scope.onRemoveCancel = function() {
              console.log("Se cancelo la eliminacion de la u.m");
          }
          $scope.onRemoveConfirm = function() {
            $scope.measures.remove(measure).then(function(number) {
              notificationService.showSuccess("Se ha eliminado correctamente la unidad de medida");
            }, function(error){
              notificationService.showError("Error en la eliminacino de la unidad de medida");
              console.log(error);
            });
          }
          ModalService.showConfirmDialog('Eliminar rol', '¿Estas seguro de eliminar el rol?', 'Eliminar', 'Cancelar', $event, $scope.onRemoveCancel, $scope.onRemoveConfirm);
          $event.stopPropagation();
        }

        $scope.show = function(selectedMeasure, ev) {
          ModalService.showModalWithParams(AddMeasureController,  'client/measures/addMeasure.tmpl.ng.html',ev, {measure:selectedMeasure});
        }

        $scope.search = function(){
          $scope.measures = $meteor.collection(function(){
          return Measures.find(
            {'$or':[
                  {
                      "symbol" : { $regex : '.*' + $scope.searchText || '' + '.*', '$options' : 'i' }
                  },{
                      "name" : { $regex : '.*' + $scope.searchText || '' + '.*', '$options' : 'i' }
                  }
                ]
            }
          );
        }, false);
        }

        $scope.showAll = function(){
          $scope.perPage = $scope.measuresCount.count;
        }
        
        $scope.pageChanged = function(newPage) {
          $scope.page = newPage;
          $scope.update();
        };

        $scope.update();
    }]);

function AddMeasureController($scope,$mdDialog, $meteor, measure ,notificationService) {
    if(measure) {
      $scope.measure = measure;
    }
    $scope.measures = $meteor.collection(Measures, false);
    $scope.save = function() {
        $scope.measures.save($scope.measure).then(function(number) {
            notificationService.showSuccess("Se ha registrado correctamente la unidad de medida");
        }, function(error){
            notificationService.showError("Error en el registro de unidad de medida");
            console.log(error);
        });
        $scope.measure = '';
        $mdDialog.hide();
    }

    $scope.cancel = function() {
        $mdDialog.cancel();
    }
}

angular.module("sam-1").directive('measure',function() {
  return {
    require : 'ngModel',
    link : function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        if(!value || value.length == 0) return;
        if(Measures.find({symbol: value}).count()>0){
          ngModel.$setValidity('duplicated', false);
        }else {
          ngModel.$setValidity('duplicated', true);
        }
        return value;
      })
    }
  }
});
