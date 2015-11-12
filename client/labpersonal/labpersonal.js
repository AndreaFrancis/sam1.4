angular.module("sam-1").controller("LabPersonalListCtrl",['$scope','$meteor','ModalService','notificationService','PrintService',
    function($scope, $meteor,ModalService,notificationService,PrintService) {

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

            }
          });
        }, false);


        $scope.headers = ['Usuario', 'Laboratorio','Cargo','Acciones'];

        $scope.print = function(){
          PrintService.printPersonal($scope.personal);
        }

        $scope.showAddNew = function(ev) {
            ModalService.showModalWithParams(AddLabpersonalController,  'client/labpersonal/addLabpersonal.tmpl.ng.html',ev, {pers:null});
        }
        $scope.toggleSearch = function() {
            $scope.showTextSearch = !$scope.showTextSearch;
        }


        $scope.delete = function(pers) {
          $scope.personal.remove(pers).then(function(number) {
              notificationService.showSuccess("Se ha eliminado correctamente el personal de laboratorio");
          }, function(error){
              notificationService.showError("Error en la eliminacino del personal de laboratorio");
              console.log(error);
          });
        }

        $scope.show = function(selectedPers, ev) {
          ModalService.showModalWithParams(AddLabpersonalController,  'client/labpersonal/addLabpersonal.tmpl.ng.html',ev, {pers:selectedPers});
        }

        $scope.search = function(){
          $scope.personal = $meteor.collection(function(){
          return Labpersonal.find(
                  {
                      "job" : { $regex : '.*' + $scope.searchText || '' + '.*', '$options' : 'i' }
                  }
          );
          }, false);
        }

    }]);

angular.module("sam-1").controller('AddLabpersonalController',AddLabpersonalController);

function AddLabpersonalController($scope,$mdDialog, $meteor, pers ,notificationService) {
    if(pers) {
      $scope.pers = pers;
    }

    $scope.users = $meteor.collection(Users, false);
    $scope.labs = $meteor.collection(Labs, false);


    $scope.personal = $meteor.collection(Labpersonal,false);
    $scope.selectedUser = {};
    $scope.selectedLab = {};
    $scope.save = function() {
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
