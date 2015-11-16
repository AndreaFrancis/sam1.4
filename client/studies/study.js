function verifyText(textToVerify){
  var text = "";
  if(!!textToVerify){
    text = textToVerify;
  }
  return text;
}
/**
 * Created by Andrea on 30/07/2015.
 */
/**
 * Created by Andrea on 28/07/2015.
 */
angular.module("sam-1").controller("StudyCtrl", ['$scope', '$stateParams','$meteor','ModalService','$state','RangeEvaluator','TextEvaluatorService','notificationService',
    function($scope, $stateParams, $meteor, ModalService, $state, RangeEvaluator, TextEvaluatorService,notificationService){
        $scope.myLab = localStorage.getItem("lab");
        var userRol = localStorage.getItem("rolName");
        $scope.isBioquimic = userRol=="Bioquimico";
        $scope.isDoctor = userRol=="Doctor";
        var refreshStudy = function(){
          $scope.study.patientObj = {};
          if($scope.study.patient) {
                          var patientObj = $meteor.object(Patients, $scope.study.patient);
                          if(patientObj) {
                            $scope.study.patientObj = patientObj;
                          }
          }

          $scope.study.doctorObj = {};
                      if(!!$scope.study.doctor){
                        var doctorObj = $meteor.object(Doctors, $scope.study.doctor);
                        if(doctorObj) {
                          $scope.study.doctorObj = doctorObj;
                        }
                      }

                      $scope.study.creatorName = {};
                      if($scope.study.creatorId) {
                          var creatorName = $meteor.object(Users, $scope.study.creatorId);
                          if(creatorName) {
                              $scope.study.creatorName = creatorName.profile.name + " "+ creatorName.profile.lastName;
                          }
                      }
                      $scope.study.serviceName = {};
                      if($scope.study.service) {
                          var service = $meteor.object(Services, $scope.study.service);
                          if(service) {
                              $scope.study.serviceName = service.name;
                          }
                      }
                      $scope.study.attentionName = {};
                      if($scope.study.attention) {
                          var attention = $meteor.object(Attentions, $scope.study.attention);
                          if(attention) {
                              $scope.study.attentionName = attention.name;
                          }
                      }
        }
        if($stateParams.studyId){
          $scope.isExistingStudy = true;
          $scope.study = $scope.$meteorObject(Studies, $stateParams.studyId, false);
          refreshStudy();          
          $scope.selectedAttention = $meteor.object(Attentions, $scope.study.attention);
          $scope.selectedService = $meteor.object(Services, $scope.study.service);
          $scope.analisysList = $scope.study.analisys;
          //Fill analisis, titles, exams
          //angular.forEach($scope.study.analisys, function(analisys){
          angular.forEach($scope.analisysList, function(analisys){
            var analisysName = $meteor.object(Analisys, analisys.analisys);
            analisys.lab = function(){
              return analisysName.lab;
            }
            analisys.name = function(){
              return analisysName.name;
            }
            angular.forEach(analisys.titles, function(title){
                var titleName = $meteor.object(Titles, title.title);
                title.name = function(){
                  return titleName.name;
                };
                angular.forEach(title.exams, function(exam){
                    var examTitle = $meteor.object(Exams, exam.exam);
                    exam.name = function(){
                      return examTitle.name;
                    }

                    if(!!exam.historial){
                      var lastModifier = exam.historial.length-1;
                      if(lastModifier>=0){
                        var userId = exam.historial[lastModifier].user;
                        var responsible = $meteor.object(Users, userId);
                        exam.responsible =   responsible.username;
                      }
                    }

                    if(examTitle.measure){
                      var measure = $meteor.object(Measures,examTitle.measure);
                      exam.symbol = function(){
                        return measure.symbol;
                      }
                    }
                    if(examTitle.ranges){
                      angular.forEach(examTitle.ranges, function(range){
                        range.typeName = function(){
                            return $meteor.object(TypeEvaluation, range.type,false).name;
                        }
                      });

                      exam.ranges = function(){
                        return examTitle.ranges;
                      }

                    }
                });
            });
        });

        }
        
        //$scope.bioquimic = {};

        //$scope.bioquimics = Users.find({"profile.mainRol": "Bioquimico"}).fetch();

        $scope.saveStudy = function(event){
          delete $scope.study.patientObj;
          delete $scope.study.doctorObj;
          delete $scope.study.creatorName;
          delete $scope.study.serviceName;
          delete $scope.study.attentionName;
          delete $scope.study._serverBackup;
          $scope.study.save()
          .then(function(number) {
          refreshStudy();
          notificationService.showSuccess("Se ha guardado correctamente el estudio");
          },function(error){
            notificationService.showError("Error en el registro del estudio");
            console.log(error);
          });
        }
        $scope.showHistorial = function(exam, ev){
          ModalService.showModalWithParams(HistorialController,  'client/studies/historial.tmpl.ng.html',ev, {exam:exam,study:$scope.study});
        }

        $scope.goStudies = function(){
            $state.go('studies');
        }

        $scope.save = function(exam,examIndex,titleIndex, analisysIndex) {

          delete $scope.study.patientObj;
          delete $scope.study.doctorObj;
          delete $scope.study.creatorName;
          delete $scope.study.serviceName;
          delete $scope.study.attentionName;
          delete $scope.study._serverBackup;

          var examFromAnalisys = $scope.study.analisys[analisysIndex].titles[titleIndex].exams[examIndex];
          examFromAnalisys.result = exam.result;
          var detail = "";
          var ranges = exam.ranges();

          angular.forEach(ranges,function(range){
              var typeEvaluation = $meteor.object(TypeEvaluation, range.type, false);
              var keyEvaluation = typeEvaluation.name;
              var evaluator = RangeEvaluator.evaluatorsMap[keyEvaluation];
              if(evaluator){
                var detail = evaluator(exam.result, range);
                exam.detail = detail.result;
                examFromAnalisys.detail = detail.result;
                exam.state = detail.correct;
                examFromAnalisys.state = detail.correct;
              }
          });
          //Historial
          var userAsigned = localStorage.getItem("user"); //Change if is a secretary
          var partialRecord = {};
          partialRecord.value = exam.result;
          partialRecord.user = userAsigned;
          partialRecord.date = new Date();
          //exam.historial.push(partialRecord);
          examFromAnalisys.historial.push(partialRecord);
          $scope.study.save()
          .then(function(number) {
          refreshStudy();
          notificationService.showSuccess("Se ha guardado correctamente el resultado");
          },function(error){
            notificationService.showError("Error en el registro el resultado");
            console.log(error);
          });
        }



        $scope.printContainer = function(){
          var newWin= window.open("");
          var style = "<style type='text/css'>table {width:100%} table, th, td {border: 1px solid black;}"+
                      "body {font-family: 'Verdana', Geneva, sans-serif;font-size:8pt}"+
                      "li {content: '»';}"+
                      "header nav, footer {display: none;}"+
                      "h2 {text-align: right;}"+
                      "@page {size: auto;margin: 0mm;}"+
                      " body { margin: 1.6cm; }"+
                      "</style>";
          newWin.document.write("<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>"+style+"</head><body>");
          newWin.document.write("<h2>Instituto de Gastroenterología Boliviano Japonés</h2>");
          newWin.document.write("<b>Doctor (a): </b>"+$scope.study.doctorObj.lastName+" "+$scope.study.doctorObj.name+"<br>");
          newWin.document.write("<b>Paciente: </b>"+$scope.study.patientObj.lastName+" "+
          $scope.study.patientObj.lastNameMother+" "+$scope.study.patientObj.name+"<br>");
          newWin.document.write("<b>Tipo de paciente: </b>"+$scope.selectedAttention.name+"<br>");
          newWin.document.write("<b>Servicio de procedencia: </b>"+$scope.selectedService.name+"<br>");
          newWin.document.write(new Date().toLocaleString());
          newWin.document.write("</body></html>");
          newWin.print();
          newWin.close();
        }

        $scope.printOrder = function(){
          var newWin= window.open("");
          var style = "<style type='text/css'>table {width:100%} table, th, td {border: 1px solid black;}"+
                      "body {font-family: 'Verdana', Geneva, sans-serif;font-size:8pt}"+
                      "li {content: '»';}"+
                      "header nav, footer {display: none;}"+
                      "h1 {text-align: center;}"+
                      "@page {size: auto;margin: 0mm;}"+
                      " body { margin: 1.6cm; }"+
                      "</style>";
          newWin.document.write("<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>"+style+"</head><body>");
          newWin.document.write("<h1>Orden de analisis</h1>");
          newWin.document.write("<hr>");
          newWin.document.write("<b>Paciente: </b>"+$scope.study.patientObj.lastName+" "+
          $scope.study.patientObj.lastNameMother+" "+$scope.study.patientObj.name+"<br>");
          newWin.document.write("<b>Doctor: </b>"+$scope.study.doctorObj.lastName+" "+$scope.study.doctorObj.name+"<br>");
          var gender = $scope.study.patientObj.gender == "F"? "Femenino": "Masculino";
          newWin.document.write("<b>Sexo: </b>"+gender+"<br>");
          newWin.document.write("<b>Fecha: </b>"+$scope.study.creationDate.toLocaleString()+"<br>");
          if(!!$scope.study.patientObj.birthdate){
            newWin.document.write("<b>Edad: </b>"+$scope.calculateAge($scope.study.patientObj.birthdate)+"<br>");
          }
          newWin.document.write("<hr>");
          angular.forEach($scope.study.analisys, function(analisys){
              newWin.document.write("<h3>"+analisys.name()+"</h3>");
              angular.forEach(analisys.titles, function(title){
                newWin.document.write("<b>"+title.name()+"</b></br>");
                newWin.document.write("<ul>");
                  angular.forEach(title.exams, function(exam){
                    newWin.document.write("<li>"+exam.name()+"</li>");
                  });
                newWin.document.write("</ul>");
              });
              newWin.document.write("<hr>");
          });
          newWin.document.write("</body></html>");
          newWin.print();
          newWin.close();
        }

        $scope.printStudy = function(ev){
          ModalService.showModalWithParams(PrintResultController,  'client/studies/printStudy.ng.html',ev, {study:$scope.study,analisysList:$scope.analisysList});
         }
    }]);


function HistorialController($scope,$mdDialog, exam,study, $meteor, DateService, PrintService) {
        if(exam) {
          $scope.exam = exam;
          $scope.study = study;
        }
        $scope.dateService = DateService;
        angular.forEach($scope.exam.historial, function(modification){
          var user = $meteor.object(Users, modification.user);
          modification.userName = user.profile.name||"" + " "+ user.profile.lastName||"";
        });

        $scope.cancel = function() {
            $mdDialog.cancel();
        }
        $scope.print = function(){
            PrintService.printHistorialOfExam($scope.exam, $scope.study);
        }
}

function PrintResultController($scope,$mdDialog, study,analisysList, $meteor, PrintService, TextEvaluatorService) {
        $scope.study = study;
        $scope.analisysList = analisysList;

        $scope.selectAnalisys = function(analisys) {
          angular.forEach(analisys.titles, function(title) {
            $scope.selectTitle(title);
            title.selected = !analisys.selected;
          });
        };

        $scope.selectTitle = function(title, analisys) {
          angular.forEach(title.exams, function(exam) {
            exam.selected = !title.selected;
          });
          analisys.selected = true;
        }

        $scope.selectExam = function(exam, title, analisys){
          title.selected = true;
          analisys.selected = true; 
        }

        $scope.cancel = function() {
            $mdDialog.cancel();
        }
        $scope.print = function(){
          var newWin= window.open("");
          var width = localStorage.getItem("width");
          var heigth = localStorage.getItem("heigth");
          var style = "<style type='text/css'>table {width:100%} table, th, td {border: 1px solid black;}"+
                      "body {font-family: 'Verdana', Geneva, sans-serif;font-size:4pt}"+
                      "header nav, footer {display: none;}"+
                      "table {font-size:4pt; border-collapse:collapse}"+
                      "h1 {text-align: center}"+
                      ".header {text-align: right;}"+
                      "@page {size:"+width+"cm "+heigth+"cm;margin: 3mm;}"+
                      " .break { page-break-after: always; }"+
                      " body {  }"+
                      " tr {page-break-inside: avoid !important;} "+
                      "</style>";
                      //"@page {size: auto;margin: 1.6cm 1.6cm 10cm 1.6cm;}"+
          newWin.document.write("<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>"+style+"</head><body>")
          newWin.document.write("<table>");
          newWin.document.write("<tr>");
          newWin.document.write("<td>");
          newWin.document.write("<b class='header'>COMPLEJO HOSPITALARIO VIEDMA</b><br/>");
          newWin.document.write("<b class='header'>Instituto de Gastroenterología Boliviano Japonés</b><br/>");
          newWin.document.write("<b class='header'>Cochabamba - Bolivia</b><br/>");
          newWin.document.write("</td>");
          newWin.document.write("<td>");
          newWin.document.write("<h1>"+verifyText($scope.study.dailyCode)+"</h1>");
          newWin.document.write("</td>");
          newWin.document.write("</tr>");
          newWin.document.write("</table>");
          newWin.document.write("<h1>Resultado de estudio</h1>");
          newWin.document.write("<hr>");
          newWin.document.write("<b>Paciente: </b>"+$scope.study.patientObj.lastName+" "+
          $scope.study.patientObj.lastNameMother+" "+$scope.study.patientObj.name+"<br>");
          newWin.document.write("<b>Doctor: </b>"+$scope.study.doctorObj.lastName+" "+$scope.study.doctorObj.name+"<br>");
          var gender = $scope.study.patientObj.gender == "F"? "Femenino": "Masculino";
          newWin.document.write("<b>Sexo: </b>"+gender+"<br>");
          if(!!$scope.study.patientObj.birthdate){
            newWin.document.write("<b>Edad: </b>"+$scope.calculateAge($scope.study.patientObj.birthdate)+"<br>");
          }
          if(!!$scope.study.medHis){
            newWin.document.write("<b>H.C: </b>"+$scope.study.medHis||""+"<br>");
          }
          newWin.document.write("<b>C.I: </b>"+$scope.study.patientObj.ci+"<br>");
          newWin.document.write("<b>Fecha de creación: </b>"+$scope.study.creationDate.toLocaleString()+"<br>");
          newWin.document.write("<b>Muestras: </b>"+verifyText($scope.study.shows)+"<br>");
          if(!!$scope.study.bill){
            newWin.document.write("<b>Numero de recibo: </b>"+$scope.study.bill||""+"<br>");
          }
          newWin.document.write("<hr>");
          angular.forEach($scope.analisysList, function(analisys){
              if(analisys.selected){
                  newWin.document.write("<h3>"+analisys.name()+"</h3>");
                  angular.forEach(analisys.titles, function(title){
                    if(title.selected){
                        newWin.document.write("<b>"+title.name()+"<b><br/>");
                        newWin.document.write("<table>");
                        newWin.document.write("<tr><th>Examen</th><th>Resultado</th><th>U. Med</th><th>Referencia</th><th>Detalle</th></tr>");
                        angular.forEach(title.exams, function(exam){
                          if(exam.selected){
                              newWin.document.write("<tr>");
                              newWin.document.write("<td>"+exam.name()+"</td>");
                            newWin.document.write("<td>"+TextEvaluatorService.getTextEvenIfNullOrUndef(exam.result)+"</td>");
                            if(exam.symbol){
                              newWin.document.write("<td>"+exam.symbol()+"</td>");
                            }else{
                              newWin.document.write("<td></td>");
                            }
                            if(exam.ranges()){
                              newWin.document.write("<td>");
                              angular.forEach(exam.ranges(), function(range){
                              var rangeText = range.name+" - "+range.typeName()+" ";
                              angular.forEach(range.fields, function(field){
                                rangeText+= field.name+": "+field.value+" ";
                              });
                              newWin.document.write("<p>"+rangeText+"</p>");
                              });
                              newWin.document.write("</td>");
                            }                    
                            newWin.document.write("<td>"+TextEvaluatorService.getTextEvenIfNullOrUndef(exam.detail)+"</td>");
                            newWin.document.write("</tr>");
                          }
                        });
                        newWin.document.write("</table>");
                        newWin.document.write("<br class=”break”/>");
                    }
                  });
              }
          });
          newWin.document.write("</body></html>");
          newWin.print();
          newWin.close();          
        }
}
