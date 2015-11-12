/**
 * Created by Andrea on 07/06/2015.
 */
angular.module("sam-1").controller("AnalisysListCtrl",['$scope','$meteor','ModalService','PrintService',
    function($scope, $meteor, ModalService, PrintService) {
        var userRol = localStorage.getItem("rolName");
        $scope.isAdmin = userRol=="Admin";

        $scope.analisysList = $meteor.collection(function(){
          return Analisys.find({active:true},{
            transform: function(doc){
                doc.titles = $meteor.collection(function(){
                  return Titles.find({analisys:doc._id});
                },false);

                var obj = $meteor.object(Labs,doc.lab);
                if(obj){
                  doc.labObj = obj.name;
                }
              return doc;
            }
          });
        }, false);

        $scope.headers = ['Lab','Nombre','Titulos','Descripcion','Acciones'];

        $scope.showAddNew = function(ev) {
            ModalService.showModalWithParams(AddAnalisysController, 'client/analisys/views/addAnalisys.tmpl.ng.html', ev, {analisys:null});
        }

        $scope.delete = function(analisys) {
          Analisys.update(analisys._id, {
            $set: {active: false}
          });
        }

        $scope.show = function(selectedAnal, ev) {
            ModalService.showModalWithParams(AddAnalisysController, 'client/analisys/views/addAnalisys.tmpl.ng.html', ev, {analisys:selectedAnal});
        }


        $scope.search = function(){
          $scope.analisysList = $meteor.collection(function(){
          return Analisys.find(
            {$and:[{
                      "name" : { $regex : '.*' + $scope.searchText || '' + '.*', '$options' : 'i' }
            }, {active:true}]},{
            transform: function(doc){
                doc.titles = $meteor.collection(function(){
                  return Titles.find({analisys:doc._id});
                },false);
              return doc;
            }
          }
          )
          ;
          },false);
        }

        $scope.catalog = $meteor.collection(function(){
          return Analisys.find({},{
          transform: function(doc){
              doc.titles = $meteor.collection(function(){
                return Titles.find({analisys:doc._id},{
                  transform: function(tit){
                    tit.exams = $meteor.collection(function(){
                      return Exams.find({title:tit._id},{
                        transform: function(exam){
                          if(exam.measure){
                            var measure = $meteor.object(Measures,exam.measure);
                            exam.symbol = function(){
                              return measure.symbol;
                            }
                          }
                          if(exam.ranges){
                            angular.forEach(exam.ranges, function(range){
                              range.typeName = function(){
                                  return $meteor.object(TypeEvaluation, range.type,false).name;
                              }
                            });
                          }
                          return exam;
                        }
                      });
                    })
                    return tit;
                  }
                });
              },false);
            return doc;
          }
        });
        },false);

        $scope.printCatalog = function(){
          PrintService.printCatalog($scope.catalog);
        }

        $scope.print = function(){
          PrintService.printAnalisys($scope.analisysList);
        }

    }]);

function AddAnalisysController($scope, $meteor, notificationService, analisys,$mdDialog) {
    if(analisys){
      $scope.analisys = analisys;
    }

    $scope.analisysList = $meteor.collection(Analisys, false);
    $scope.labs = $meteor.collection(Labs, false);
    $scope.querySearch  = function(query) {
      var results = query ? $scope.labs.filter( createFilterFor(query) ) : [];
      return results;
    }

    function createFilterFor(query) {
     var lowercaseQuery = angular.lowercase(query);
     return function filterFn(labEl) {
       var nameToLoweCase = angular.lowercase(labEl.name);
       return (nameToLoweCase.indexOf(lowercaseQuery) >= 0);
     };
    }


    $scope.save = function() {
        //Cleaning data from transform
        delete $scope.analisys.titles;

        if($scope.selectedLab){
          $scope.analisys.lab = $scope.selectedLab._id;
        }
        $scope.analisys.active = true;
        $scope.analisysList.save($scope.analisys).then(function(number) {
            notificationService.showSuccess("Se ha registrado correctamente el Analisis clinico");
        }, function(error){
            notificationService.showError("Error en el registro del analisis");
            console.log(error);
        });
        $scope.analisys = '';
        $mdDialog.hide();
    }

    $scope.cancel = function() {
        $mdDialog.cancel();
    }
}

angular.module("sam-1").directive('analisys',function() {
  return {
    require : 'ngModel',
    link : function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        if(!value || value.length == 0) return;
        if(Analisys.find({name: value}).count()>0){
          ngModel.$setValidity('duplicated', false);
        }else {
          ngModel.$setValidity('duplicated', true);
        }
        return value;
      })
    }
  }
});
