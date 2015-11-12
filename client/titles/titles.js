/**
 * Created by Andrea on 07/06/2015.
 */
angular.module("sam-1").controller("TitlesListCtrl",['$scope','$meteor','ModalService','PrintService',
    function($scope, $meteor, ModalService, PrintService) {
        $scope.headers = ["Nombre", "Analisis", "Examenes", "Acciones"];

        $scope.titles = $meteor.collection(function(){
          return Titles.find({active:true},{
            transform: function(doc){
              if(doc.analisys){
                doc.analisysObj = {};
                var obj = $meteor.object(Analisys,doc.analisys);
                if(obj){
                  doc.analisysObj = obj.name;
                }
              }

              var exams = $meteor.collection(function(){
                return Exams.find({$and:[{title:doc._id},{active:true}]});
              },false);
              doc.exams = exams;

              return doc;
            }
          });
        }, false);

        $scope.print = function(){
          PrintService.printTitles($scope.titles);
        }

        $scope.showAddNew = function(ev) {
            ModalService.showModalWithParams(AddTitleController, 'client/titles/addTitle.tmpl.ng.html', ev, {title: null});
        }

        $scope.delete = function(title) {
          Titles.update(title._id, {
            $set: {active: false}
          });
        }

        $scope.show = function(selectedTitle, ev) {
            ModalService.showModalWithParams(AddTitleController, 'client/titles/addTitle.tmpl.ng.html', ev, {title: selectedTitle});
        }

        $scope.search = function(){
          $scope.titles = $meteor.collection(function(){
          return Titles.find(
            {$and:[{
                      "name" : { $regex : '.*' + $scope.searchText || '' + '.*', '$options' : 'i' }
            }, {active:true}]},{
            transform: function(doc){
              if(doc.analisys){
                doc.analisysObj = {};
                var obj = $meteor.object(Analisys,doc.analisys);
                if(obj){
                  doc.analisysObj = obj.name;
                }
              }

              var exams = $meteor.collection(function(){
                return Exams.find({$and:[{title:doc._id},{active:true}]});
              },false);
              doc.exams = exams;

              return doc;
            }
          }
          )
          ;
          },false);
        }

    }]);

function AddTitleController($scope, $meteor, notificationService, title, $mdDialog) {
    $scope.selectedAnalisys = {};
    if(title){
      $scope.title = title;
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

        $scope.title.active = true;
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
