/**
 * Created by Andrea on 07/06/2015.
 */
angular.module("sam-1").controller("TitlesListCtrl",['$scope','$meteor','ModalService','PrintService','notificationService',
    function($scope, $meteor, ModalService, PrintService,notificationService) {
        $scope.page = 1;
        $scope.perPage = 3;
        $scope.sort = {name: 1};
        $scope.headers = ["Nombre", "Analisis", "Examenes", "Acciones"];

        Meteor.subscribe('counters', function() {
          $scope.titlesCount = $meteor.object(Counts ,'titles', false);
        });

        $scope.update = function(){
          $scope.titles = Titles.find({active:true},{
            transform: function(doc){
              if(doc.analisys){
                doc.analisysObj = {};
                var obj = $meteor.object(Analisys,doc.analisys);
                if(obj){
                  doc.analisysObj = obj;
                }
              }
              var exams = Exams.find({$and:[{title:doc._id},{active:true}]}).fetch();
              doc.exams = exams;
              return doc;
            },
            limit: parseInt($scope.perPage),
            skip: parseInt(($scope.page - 1) * $scope.perPage),
            sort: $scope.sort
          }).fetch();
        }

        $scope.print = function(){
          PrintService.printTitles($scope.titles);
        }

        $scope.showAddNew = function(ev) {
            ModalService.showModalWithParams(AddTitleController, 'client/titles/addTitle.tmpl.ng.html', ev, {title: null});
        }

        $scope.delete = function(title, $event) {
          $scope.onRemoveCancel = function() {
              console.log("Se cancelo la eliminacion del servicio");
          }
          $scope.onRemoveConfirm = function() {
            Titles.update(title._id, {
              $set: {active: false}
            });
            notificationService.showSuccess("Se ha eliminado correctamente el servicio");
          }
          ModalService.showConfirmDialog('Eliminar titulo', '¿Estas seguro de eliminar el titulo?', 'Eliminar', 'Cancelar', $event, $scope.onRemoveCancel, $scope.onRemoveConfirm);
          $event.stopPropagation();
        }

        $scope.show = function(selectedTitle, ev) {
            ModalService.showModalWithParams(AddTitleController, 'client/titles/addTitle.tmpl.ng.html', ev, {title: selectedTitle});
        }

        $scope.search = function(){
           $scope.titles = Titles.find({$and:[{
                      "name" : { $regex : '.*' + $scope.searchText || '' + '.*', '$options' : 'i' }
            }, {active:true}]},{
            transform: function(doc){
              if(doc.analisys){
                doc.analisysObj = {};
                var obj = $meteor.object(Analisys,doc.analisys);
                if(obj){
                  doc.analisysObj = obj;
                }
              }
              var exams = Exams.find({$and:[{title:doc._id},{active:true}]}).fetch();
              doc.exams = exams;
              return doc;
            },
            limit: parseInt($scope.perPage),
            skip: parseInt(($scope.page - 1) * $scope.perPage),
            sort: $scope.sort
          }).fetch();
        }

        $scope.showAll = function(){
          $scope.perPage = $scope.titlesCount.count;
        }
        
        $scope.pageChanged = function(newPage) {
          $scope.page = newPage;
          $scope.update();
        };

        $scope.update();
    }]);

function AddTitleController($scope, $meteor, notificationService, title, $mdDialog) {
    $scope.title = {};
    $scope.title.active = true;
    $scope.title.visible = false;
    $scope.title.selectable = false;

    
    if(title){
      $scope.title = title;
      $scope.selectedAnalisys = $meteor.object(Analisys, $scope.title.analisys);
    }

    $scope.titles = $meteor.collection(Titles, false);
    $scope.analisys = $meteor.collection(Analisys, false);
    $scope.querySearch  = function(query) {
      var results = query ? $scope.analisys.filter( createFilterFor(query) ) : [];
      return results;
    }

    function createFilterFor(query) {
     var lowercaseQuery = angular.lowercase(query);
     return function filterFn(analisysEl) {
       var nameToLoweCase = angular.lowercase(analisysEl.name);
       return (nameToLoweCase.indexOf(lowercaseQuery) >= 0);
     };
   }

    $scope.save = function() {
        if($scope.selectedAnalisys){
          $scope.title.analisys = $scope.selectedAnalisys._id;
        }
        //Cleaning data from transform
        delete $scope.title.exams;
        delete $scope.title.analisysObj;
        $scope.titles.save($scope.title).then(function(number) {
            notificationService.showSuccess("Se ha registrado correctamente el titulo");
        }, function(error){
            notificationService.showError("Error en el registro del titulo");
            console.log(error);
        });
        $scope.title = '';
        $mdDialog.hide();
    }

    $scope.cancel = function() {
        $mdDialog.cancel();
    }
}
