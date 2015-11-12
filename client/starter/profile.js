angular.module("sam-1").controller("ProfileCtrl",['$scope','$meteor','ModalService','notificationService','$rootScope',
    function($scope, $meteor,ModalService,notificationService,$rootScope) {
      $scope.user = $rootScope.currentUser;
      $scope.username= $scope.user.username;
      $scope.userRol = localStorage.getItem("rolName");
      $scope.isBioquimic = $scope.userRol=="Bioquimico";
      $scope.isDoctor = $scope.userRol=="Doctor";
      $scope.isAdmin = $scope.userRol=="Admin";

      var ifIsPersonalLab = $meteor.collection(function(){
          return Labpersonal.find({user: {"$in": [$scope.user._id]}});
      });
      if(ifIsPersonalLab.length>0){
        $scope.personal = ifIsPersonalLab[0];
        $scope.lab = $meteor.object(Labs, $scope.personal.lab);
      }
      var doctors = $meteor.collection(function(){
        return Doctors.find({userId:$scope.user._id});
      },false);
      if(doctors.length>0){
        $scope.doctor = doctors[0];
      }

}]);
