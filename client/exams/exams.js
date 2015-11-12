/**
 * Created by Andrea on 26/07/2015.
 */
angular.module("sam-1").controller("ExamsListCtrl",['$scope','$meteor','ModalService','PrintService',
    function($scope, $meteor, ModalService,PrintService) {
        $scope.headers = ["Nombre","Medida","Titulo", "Rangos", "Acciones"];
        $scope.titles = $meteor.collection(Exams, false);

        $scope.exams = $meteor.collection(function() {
            return Exams.find({active:true}, {
                transform: function(doc) {
                    doc.measureSymbol = '';
                    if(doc.measure) {
                        var measureSymbol = $meteor.object(Measures,doc.measure);
                        if(measureSymbol){
                          doc.measureSymbol = measureSymbol.symbol;
                        }
                    }
                    if(doc.title) {
                        var title = $meteor.object(Titles,doc.title);
                        if(title){
                          doc.titleName = title.name;
                        }
                    }
                    return doc;
                }
            });
        }, false);

        $scope.print = function(){
          PrintService.printExams($scope.exams);
        }
        $scope.showAddNew = function(ev) {
            ModalService.showModalWithParams(AddExamCtrl, 'client/exams/addExam.tmpl.ng.html', ev,{exam:null});
        }

        $scope.delete = function(exam) {
          Exams.update(exam._id, {
            $set: {active: false}
          });
        }
        $scope.show = function(selectedExam, ev) {
            ModalService.showModalWithParams(AddExamCtrl, 'client/exams/addExam.tmpl.ng.html', ev,{exam:selectedExam});
        }

        $scope.search = function(){
          $scope.exams = $meteor.collection(function() {
            return Exams.find({$and:[{active:true}, {name : { $regex : '.*' + $scope.searchText || '' + '.*', '$options' : 'i' }}]}, {
                transform: function(doc) {
                    doc.measureSymbol = '';
                    if(doc.measure) {
                        var measureSymbol = $meteor.object(Measures,doc.measure);
                        if(measureSymbol){
                          doc.measureSymbol = measureSymbol.symbol;
                        }
                    }
                    if(doc.title) {
                        var title = $meteor.object(Titles,doc.title);
                        if(title){
                          doc.titleName = title.name;
                        }
                    }
                    return doc;
                }
            });
        }, false);
        }
    }]);

function AddExamCtrl($scope, $meteor, notificationService, exam,$mdDialog) {
    if(exam){
      $scope.exam = exam;
    }else{
      $scope.exam = {};
      $scope.exam.ranges = [];
    }


    $scope.exams = $meteor.collection(Exams, false);
    $scope.ranges = $meteor.collection(Ranges, false);
    $scope.typeEvaluations = $meteor.collection(TypeEvaluation,false);
    $scope.measures = $meteor.collection(Measures,false);
    $scope.titles = $meteor.collection(function(){
      return Titles.find({},{
        transform: function(doc){
            if(doc.analisys){
              var analisys = $meteor.object(Analisys, doc.analisys);
              doc.value = doc.name;
              if(analisys.name){
                doc.value+= "-"+analisys.name;
              }
            }
          return doc;
        }
      });
    },false);
    $scope.fields = [];

    $scope.querySearch  = function(query) {
      var results = query ? $scope.titles.filter( createFilterFor(query) ) : [];
      return results;
    }

    function createFilterFor(query) {
     var lowercaseQuery = angular.lowercase(query);
     return function filterFn(title) {
       var nameToLoweCase = angular.lowercase(title.name);
       return (nameToLoweCase.indexOf(lowercaseQuery) >= 0);
     };
   }


    $scope.saveRange = function() {
        var range = {
            name: $scope.newRange.name,
            type : $scope.selectedType._id,
            fields : [],
            typeName : $scope.selectedType.name
        }
        for(var i= 0; i<$scope.selectedType.fields.length; i++) {
            var fieldName = $scope.selectedType.fields[i];
            var fieldValue = $scope.fields[i];
            var field = {name: fieldName, value: fieldValue};
            range.fields.push(field);
        }
        $scope.exam.ranges.push(range);
        $scope.newRange = {};
        $scope.fields = [];
    }

    $scope.deleteRange = function(index){
      $scope.exam.ranges.splice(index,1);
    }

    $scope.save = function() {
      //Cleaning data from transform
        delete $scope.exam.measureSymbol;
        delete $scope.exam.titleName;

        if($scope.selectedTitle){
          $scope.exam.title = $scope.selectedTitle._id;
        }
        $scope.exam.active = true;
        $scope.exams.save($scope.exam).then(
            function(number){
                notificationService.showSuccess("Se ha registrado correctamente el examen");
            }, function(error){
                notificationService.showError("Error en el registro de examen");
                console.log(error);
            }
        );
        $scope.exam = '';
        $mdDialog.hide();
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    }
}
