angular.module("sam-1").controller("RolesListCtrl",['$scope','$meteor','notificationService','ModalService','PrintService',
    function($scope, $meteor,notificationService, ModalService,PrintService) {

         $scope.page = 1;
         $scope.perPage = 3;
         $scope.sort = {name: 1};
         $scope.headers = ['Nombre', 'Acciones'];

         Meteor.subscribe('counters', function() {
          $scope.rolesCount = $meteor.object(Counts ,'roles', false);
         });

         $scope.update = function(){
          $scope.roles = $meteor.collection(function(){
          return RolesData.find({}, {limit: parseInt($scope.perPage),
                                    skip: parseInt(($scope.page - 1) * $scope.perPage),
                                    sort: $scope.sort});
          }, false);
        }
      
        $scope.showAll = function(){
          $scope.perPage = $scope.rolesCount.count;
        }

        $scope.print = function(){
          PrintService.printRoles($scope.roles);
        }

        $scope.showAddNew = function(ev) {
            ModalService.showModalWithParams(AddRolController, 'client/roles/addRol.tmpl.ng.html',ev,{rol:null});
        }

        $scope.delete = function(rol,$event, roles) {

          $scope.onRemoveCancel = function() {
              console.log("Se cancelo la eliminacion del rol");
          }
          $scope.onRemoveConfirm = function() {
            if(roles!=undefined){
              $meteor.collection(RolesData).remove(rol).then(function(number) {
                notificationService.showSuccess("Se ha eliminado correctamente el rol");
              }, function(error){
                notificationService.showError("Error en la eliminacino del rol");
                console.log(error);
              });
            }
          }
          ModalService.showConfirmDialog('Eliminar rol', '¿Estas seguro de eliminar el rol?', 'Eliminar', 'Cancelar', $event, $scope.onRemoveCancel, $scope.onRemoveConfirm);
          $event.stopPropagation();
        }

        $scope.show = function(selectedRol, ev) {
            ModalService.showModalWithParams(AddRolController, 'client/roles/addRol.tmpl.ng.html',ev, {rol:selectedRol});
            ev.stopPropagation();
        }

        $scope.search = function(){
              $scope.roles = $meteor.collection(function(){
                return RolesData.find({name : { $regex : '.*' + $scope.searchText || '' + '.*', '$options' : 'i' }});
              }, false);
        }

        $scope.pageChanged = function(newPage) {
          $scope.page = newPage;
          $scope.update();
        };

        $scope.update();
  }]);

function AddRolController($scope, notificationService, $mdDialog,rol, $meteor) {
    if(rol) {
      $scope.rol = rol;
    }
    $scope.roles = $meteor.collection(RolesData, false);
    $scope.save = function() {
        var rolToJson = angular.toJson($scope.rol);
        var rolToArray = JSON.parse(rolToJson);
        $scope.roles.save(rolToArray).then(function(number) {
            notificationService.showSuccess("Se ha registrado correctamente el rol");
        }, function(error){
            notificationService.showError("Error en el registro del rol");
            console.log(error);
        });
        $scope.newRol = '';
        $mdDialog.hide();
    }

    $scope.cancel = function() {
        $mdDialog.cancel();
    }
}


angular.module("sam-1").directive('rol',function() {
  return {
    require : 'ngModel',
    link : function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        if(!value || value.length == 0) return;
        if(RolesData.find({name: value}).count()>0){
          ngModel.$setValidity('duplicated', false);
        }else {
          ngModel.$setValidity('duplicated', true);
        }
        return value;
      })
    }
  }
});
