/**
 * Created by Andrea on 07/06/2015.
 */
angular.module("sam-1").controller("UsersListCtrl",['$scope','$meteor','notificationService','$mdDialog','ModalService','PrintService',
    function($scope, $meteor,notificationService,$mdDialog, ModalService,PrintService) {
        $scope.users = $meteor.collection(function(){
          return Users.find({},{
            transform: function(doc){
              if(doc.profile.mainRol){
                var rol = $meteor.object(RolesData,doc.profile.mainRol);
                if(rol){
                  doc.rol = rol.name;
                }
              }
              return doc;
            }
          });
        }, false);

        $scope.print = function(){
          PrintService.printUsers($scope.users);
        }

        $scope.delete = function(user) {
          Meteor.call("deleteUser", user._id, function(err) {
              if(err) {
                  notificationService.showError("No se pudo eliminar el usuario");
                  console.log(err);
              }else{
                  notificationService.showSuccess("Se ha eliminado correctamente al usuario");
              }
          });
        }

        $scope.show = function(selectedUser, ev) {
            ModalService.showModalWithParams(AddUserController, 'client/users/views/addUser.tmpl.ng.html', ev, {user:selectedUser});
        }

        $scope.showAddNew = function(ev) {
            ModalService.showModalWithParams(AddUserController, 'client/users/views/addUser.tmpl.ng.html', ev, {user:null});
        }

        $scope.toggleSearch = function() {
            $scope.showTextSearch = !$scope.showTextSearch;
        }

        $scope.search = function(){
          $scope.users = $meteor.collection(function(){
          return Users.find(
            {'$or':[
                  {
                      "profile.name" : { $regex : '.*' + $scope.searchText || '' + '.*', '$options' : 'i' }
                  },{
                      "profile.lastName" : { $regex : '.*' + $scope.searchText || '' + '.*', '$options' : 'i' }
                  },{
                      "profile.lastNameMother" : { $regex : '.*' + $scope.searchText || '' + '.*', '$options' : 'i' }
                  },{
                      "username" : { $regex : '.*' + $scope.searchText || '' + '.*', '$options' : 'i' }
                  }
                ]
            }
            ,{
            transform: function(doc){
              if(doc.profile.mainRol){
                var rol = $meteor.object(RolesData,doc.profile.mainRol);
                if(rol){
                  doc.rol = rol.name;
                }
              }
              return doc;
            }
          });
        }, false);
        }

        $scope.headers = ['Img', 'Nombre de usuario','Nombre', 'Apellido', 'Rol', 'Acciones'];
}]);

function AddUserController($rootScope, $scope,$mdDialog, $meteor, user ,notificationService, ROLES) {
    var imageUrl  = "../descarga.png";
    if(user) {
      $scope.user = user;
      var imageUrl  = $scope.user.profile.image;
      $scope.imageStyle =     {'background': 'url("'+imageUrl+'"),background-repeat'};
    }else {
      $scope.user = {};
      $scope.user.profile = {};
    }

    $scope.roles = $meteor.collection(RolesData, false);

    $scope.selectedRol = {};
    $scope.cancel = function() {
        $mdDialog.cancel();
    }

    $scope.uploadFile = function(evemt) {
        $scope.selectedFile = event.target.files[0];
        $scope.image = URL.createObjectURL($scope.selectedFile);
        $scope.imageStyle =     {'background': 'url('+$scope.image+')','background-repeat':'no-repeat'};
        $scope.$apply();

    }

    $scope.save = function(user) {
      //Cleaning data from transform
        delete $scope.user.rol;

        if($scope.selectedFile) {
          Images.insert($scope.selectedFile, function (err, fileObj) {
              if (err){
                  notificationService.showError("Error al subir la imagen");
                  console.log(err);
              } else {
                  user.profile.mainRol  = $scope.selectedRol._id;
                  user.profile.image = "/cfs/files/images/" + fileObj._id;
                  Meteor.call("createNewUser", user, function(err) {
                      if(err) {
                          notificationService.showError("Error en el registro del usuario");
                          console.log(err);
                      }else{
                          notificationService.showSuccess("Se ha registrado correctamente al usuario");
                      }
                  });
              }
          });
        }else{
          user.profile.mainRol  = $scope.selectedRol._id;
          Meteor.call("createNewUser", user, function(err) {
              if(err) {
                  notificationService.showError("Error en el registro del usuario");
                  console.log(err);
              }else{
                  notificationService.showSuccess("Se ha registrado correctamente al usuario"+ user._id);
              }
          });
        }

        $scope.user = '';
        $mdDialog.hide();
    }
}

angular.module("sam-1").directive('user',function() {
  return {
    require : 'ngModel',
    link : function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        if(!value || value.length == 0) return;
        if(Users.find({username: value}).count()>0){
          ngModel.$setValidity('duplicated', false);
        }else {
          ngModel.$setValidity('duplicated', true);
        }
        return value;
      })
    }
  }
});
