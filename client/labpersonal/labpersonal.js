angular.module("sam-1").controller("LabPersonalListCtrl",['$scope','$meteor','ModalService','notificationService','PrintService',
    function($scope, $meteor,ModalService,notificationService,PrintService) {

        $scope.page = 1;
        $scope.perPage = 3;
        $scope.sort = {job: 1};
        $scope.headers = ['Usuario', 'Laboratorio','Cargo','Acciones'];

        Meteor.subscribe('counters', function() {
          $scope.labperCount = $meteor.object(Counts ,'labpers', false);
        });

        $scope.update = function(){
          $scope.personal = $meteor.collection(function(){
          return Labpersonal.find({},{
            transform: function(doc){
              if(doc.user){
                var user = $meteor.object(Users,doc.user);
                if(user){
                  doc.userObj = user.username;
                }
              }
              if(doc.lab){
                var lab = $meteor.object(Labs,doc.lab);
                if(lab){
                  doc.labObj = lab.name;
                }
              }
              return doc;
            },
            limit: parseInt($scope.perPage),
            skip: parseInt(($scope.page - 1) * $scope.perPage),
            sort: $scope.sort
          });
        }, false);

        }

        $scope.print = function(){
          PrintService.printPersonal($scope.personal);
        }

        $scope.showAddNew = function(ev) {
            ModalService.showModalWithParams(AddLabpersonalController,  'client/labpersonal/addLabpersonal.tmpl.ng.html',ev, {pers:null});
        }

        $scope.delete = function(pers,$event) {
          $scope.onRemoveCancel = function() {
              console.log("Se cancelo la eliminacion del rol");
          }
          $scope.onRemoveConfirm = function() {
            $scope.personal.remove(pers).then(function(number) {
              notificationService.showSuccess("Se ha eliminado correctamente el personal de laboratorio");
            }, function(error){
              notificationService.showError("Error en la eliminacino del personal de laboratorio");
              console.log(error);
            });
          }
          ModalService.showConfirmDialog('Eliminar personal', '¿Estas seguro de eliminar el personal?', 'Eliminar', 'Cancelar', $event, $scope.onRemoveCancel, $scope.onRemoveConfirm);
          $event.stopPropagation();
        }

        $scope.show = function(selectedPers, ev) {
          ModalService.showModalWithParams(AddLabpersonalController,  'client/labpersonal/addLabpersonal.tmpl.ng.html',ev, {pers:selectedPers});
        }

        $scope.search = function(){
          $scope.personal = $meteor.collection(function(){
          return Labpersonal.find({"job" : { $regex : '.*' + $scope.searchText || '' + '.*', '$options' : 'i' }},{
            transform: function(doc){
              if(doc.user){
                var user = $meteor.object(Users,doc.user);
                if(user){
                  doc.userObj = user.username;
                }
              }
              if(doc.lab){
                var lab = $meteor.object(Labs,doc.lab);
                if(lab){
                  doc.labObj = lab.name;
                }
              }
              return doc;
            }
          });
        }, false);
        }

        $scope.showAll = function(){
          $scope.perPage = $scope.labperCount.count;
        }
        
        $scope.pageChanged = function(newPage) {
          $scope.page = newPage;
          $scope.update();
        };

        $scope.update();
    }]);

angular.module("sam-1").controller('AddLabpersonalController',AddLabpersonalController);

function AddLabpersonalController($scope,$mdDialog, $meteor, pers ,notificationService) {
    $scope.users = $meteor.collection(Users, false);
    $scope.labs = $meteor.collection(Labs, false);


    $scope.personal = $meteor.collection(Labpersonal,false);
    $scope.selectedUser = {};
    $scope.selectedLab = {};

    if(pers) {
      $scope.pers = pers;
      $scope.selectedUser = $meteor.object(Users, $scope.pers.user);
      $scope.selectedLab = $meteor.object(Labs, $scope.pers.lab);
    }

    $scope.save = function() {
        delete $scope.pers.userObj;
        delete $scope.pers.labObj;
        if($scope.selectedUser){
          $scope.pers.user  = $scope.selectedUser._id;
        }

        if($scope.selectedLab){
          $scope.pers.lab  = $scope.selectedLab._id;
        }

        $scope.personal.save($scope.pers).then(function(number) {
            notificationService.showSuccess("Se ha guardado correctamente el personal de laboratorio");
        }, function(error){
            notificationService.showError("Error al guardar el personal de laboratorio");
            console.log(error);
        });
        $scope.pers = '';
        $mdDialog.hide();
    }

    $scope.cancel = function() {
        $mdDialog.cancel();
    }
}
