/**
 * Created by Andrea on 28/07/2015.
 */
angular.module('sam-1').service("notificationService", function($mdToast){
    this.showError = function(msg) {
        $mdToast.show({
            template: '<md-toast class="md-toast error">' + msg + '</md-toast>',
            hideDelay: 3000,
            position: 'bottom right'
        });
    }
    this.showSuccess = function(msg) {
        $mdToast.show({
            template: '<md-toast class="md-toast success">' + msg + '</md-toast>',
            hideDelay: 3000,
            position: 'bottom right'
        });
    }
});

angular.module('sam-1').service("ProfileService", function($rootScope) {

    this.getRol = function() {
        return $rootScope.currenUser.roles;
    };
    this.getModules = function() {

    }
});

angular.module('sam-1').service("TextEvaluatorService", function() {

    this.getTextEvenIfNullOrUndef = function(text) {
        if(typeof(text) == 'undefined' || text == null){
          text = "";
        }
        return text;
    };
});

angular.module('sam-1').service("AuthorizationService", function(){
    this.showError = function(msg) {
        $mdToast.show({
            template: '<md-toast class="md-toast error">' + msg + '</md-toast>',
            hideDelay: 6000,
            position: 'up right'
        });
    }
    this.showSuccess = function(msg) {
        $mdToast.show({
            template: '<md-toast class="md-toast success">' + msg + '</md-toast>',
            hideDelay: 6000,
            position: 'up right'
        });
    }
});

angular.module('sam-1').service("ModalService", function($mdDialog){
    this.showModal = function(controller, urlTemplate, event) {
        $mdDialog.show({
            controller: controller,
            templateUrl: urlTemplate,
            targetEvent : event
        });
    }

    this.showConfirmDialog = function(title, content, okTitle, cancelTitle, event, onCancel, onConfirm) {
    var confirm = $mdDialog.confirm()
      .parent(angular.element(document.body))
      .title(title)
      .content(content)
      .ariaLabel(title)
      .ok(okTitle)
      .cancel(cancelTitle)
      .targetEvent(event);
      $mdDialog.show(confirm).then(onConfirm, onCancel);
    }

    this.showModalWithParams = function(controller, urlTemplate, event, params, onOk, onCancel) {
        $mdDialog.show({
            controller: controller,
            templateUrl: urlTemplate,
            targetEvent : event,
            locals: params
        }).then(function(){
          if(!!onOk){
            onOk();
          }
        }, function(){
          if(!!onCancel){
            onCancel();
          }
        });
    }

    this.showConfirmDialog = function(title, content, okTitle, cancelTitle, event, onCancel, onConfirm) {
    var confirm = $mdDialog.confirm()
      .parent(angular.element(document.body))
      .title(title)
      .content(content)
      .ariaLabel(title)
      .ok(okTitle)
      .cancel(cancelTitle)
      .targetEvent(event);
      $mdDialog.show(confirm).then(onConfirm, onCancel);
    }

    this.showAlertDialog = function(title, message, confirm) {
      $mdDialog.show(
      $mdDialog.alert()
        .parent(angular.element(document.querySelector('#popupContainer')))
        .clickOutsideToClose(true)
        .title(title)
        .content(message)
        .ariaLabel('Mensaje de alerta')
        .ok(confirm)
    );
    }

});

angular.module('sam-1').service("DateService", function(){
  var meses = new Array ("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
  var diasSemana = new Array("Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado");
  this.dateAsLiteral = function(date){
    var text = "";
    if(!!date){
      text = diasSemana[date.getDay()] + ", " + date.getDate() + " de " + meses[date.getMonth()] + " de " + date.getFullYear();
    }
    return text;
  }
});

angular.module('sam-1').service("AgeCalculatorService", function(){
  this.inTypes = ["Años", "Meses","Semanas", "Dias"];
  this.calculateAge = function getAge(date) {
    var dateString = date.toString();
    var birthdate = new Date(dateString).getTime();
    var now = new Date().getTime();
    var n = (now - birthdate)/1000;
    if (n < 604800) { // less than a week
      var day_n = Math.floor(n/86400);
      return {value: day_n, inType: this.inTypes[3] };
      //return day_n + ' dia' + (day_n > 1 ? 's' : '');
    } else if (n < 2629743) {  // less than a month
      var week_n = Math.floor(n/604800);
      return {value: week_n, inType: this.inTypes[2] };
      //return week_n + ' semana' + (week_n > 1 ? 's' : '');
    } else if (n < 63113852) { // less than 24 months
      var month_n = Math.floor(n/2629743);
      return {value: month_n, inType: this.inTypes[1] };
      //return month_n + ' mes' + (month_n > 1 ? 'es' : '');
    } else {
      var year_n = Math.floor(n/31556926);
      return {value: year_n, inType: this.inTypes[0] };
      //return year_n + ' año' + (year_n > 1 ? 's' : '');
    }
  }
});

angular.module('sam-1').service("RangeEvaluator", function(RANGE_EVALUATOR, $meteor){
    var equalEval = function(val, range){
      var detail = {result:"Fuera de rango", correct:false};
      var i = 0;
      var found = false;
      while(i<range.fields.length && !found){
        if(range.fields[i].name == "valor"){
          found = true;
          var equalValue = range.fields[i].value;
          if(equalValue == val){
            detail.result = range.name;
            detail.correct = true;
          }
        }
        i++;
      }
      return detail;
    }

    var betweenEval = function(val, range){
      var detail = {result:"Fuera de rango", correct:false};
      var i = 0;
      var initial = 0;
      var final = 0;
      var foundInitial = false;
      var foundFinal = false;
      while(i<range.fields.length && !foundInitial){
        if(range.fields[i].name == "inicial"){
          foundInitial = true;
          initial = range.fields[i].value;
        }
        i++;
      }
      i = 0;
    while(i<range.fields.length && !foundFinal){
        if(range.fields[i].name == "final"){
          foundFinal = true;
          final = range.fields[i].value;
        }
        i++;
    }
    var initial = parseInt(initial);
    var final = parseInt(final);
    if(initial != undefined && final!= undefined){
        if((val<=final) && (val>=initial)){
          detail.result = range.name;
          detail.correct = true;
        }
    }

    return detail;
    }


    this.evaluatorsMap = {};
    this.evaluatorsMap['Igual'] = equalEval;
    this.evaluatorsMap['Entre'] = betweenEval;
});


angular.module('sam-1').service("PrintService", function(TextEvaluatorService,SELECTORS){
    this.printCatalog = function(catalog){
      var newWin= window.open("");
      var style = "<style type='text/css'>table, th, td {border: 1px solid black;}"+
                      "body {font-family: 'Verdana', Geneva, sans-serif;font-size:8pt}"+
                      "header nav, footer {display: none;}"+
                      "table {font-size:8pt; border-collapse:collapse}"+
                      "h1 {text-align: center}"+
                      ".header {text-align: right;}"+
                      "@page {size:auto;margin: 10mm;}"+
                      " .break { page-break-after: always; }"+
                      " body {  }"+
                      " tr {page-break-inside: avoid !important;} "+
                      "</style>";
      newWin.document.write("<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>"+style+"</head><body>")
      newWin.document.write("<b class='header'>COMPLEJO HOSPITALARIO VIEDMA</b><br/>");
      newWin.document.write("<b class='header'>Instituto de Gastroenterología Boliviano Japonés</b><br/>");
      newWin.document.write("<b class='header'>Cochabamba - Bolivia</b><br/>");
      newWin.document.write("<h1>Listado de analisis</h1>");
      newWin.document.write("<hr>");
      angular.forEach(catalog, function(analisys){
        newWin.document.write("<h3>"+analisys.name+"</h3>");
        newWin.document.write("<ul>");
        angular.forEach(analisys.titles, function(title){
          newWin.document.write("<li>"+title.name+"</li>");
          newWin.document.write("<table>");
          var text = "<tr><th>Examen</th><th>Valores referenciales</th></tr>";
          angular.forEach(title.exams, function(exam){
            text+= "<tr>";
            text+= "<td>"+exam.name+"</td>";
            if(!exam.ranges){
              text+= "<td></td>";
            }
            var symbol = "";
            var getType = {};
            if(exam.symbol && getType.toString.call(exam.symbol) === '[object Function]'){
                symbol= exam.symbol();
            }
            text+= "<td>";
            text+= "<ul>";
            angular.forEach(exam.ranges, function(range){
                text+= "<li>";
                text+= range.name+" - "+range.typeName()+" ";
                angular.forEach(range.fields, function(field){
                  text+= field.name+": "+field.value+" "+symbol+" ";
                });
                text+= "</li>";
            });
            text+= "</ul>";
            text+= "</td>";
            text+= "</tr>";
            //newWin.document.write(text);
          });
          newWin.document.write(text);
          newWin.document.write("</table>");
        });
        newWin.document.write("</ul>");
      });

      newWin.document.write("</body></html>");
      newWin.print();
      newWin.close();
    }
    this.printPatientHistorial =  function(patient, studies){
      var newWin= window.open("");
      var style = "<style type='text/css'>table {min-width:50%;  margin-left:auto; margin-right:auto;} table, th, td {border: 1px solid black;}"+
                      "body {font-family: 'Verdana', Geneva, sans-serif;font-size:8pt}"+
                      "header nav, footer {display: none;}"+
                      "table {font-size:8pt; border-collapse:collapse}"+
                      "h1 {text-align: center}"+
                      ".header {text-align: right;}"+
                      "@page {size:auto;margin: 10mm;}"+
                      " .break { page-break-after: always; }"+
                      " body {  }"+
                      " tr {page-break-inside: avoid !important;} "+
                      "</style>";
      newWin.document.write("<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>"+style+"</head><body>")
      newWin.document.write("<b class='header'>COMPLEJO HOSPITALARIO VIEDMA</b><br/>");
      newWin.document.write("<b class='header'>Instituto de Gastroenterología Boliviano Japonés</b><br/>");
      newWin.document.write("<b class='header'>Cochabamba - Bolivia</b><br/>");
      newWin.document.write("<h1>Historial de paciente</h1>");
      newWin.document.write("<hr>");
      var textPersonalData = "";
      textPersonalData+= "<b>Nombre</b>"+patient.lastName+" "+TextEvaluatorService.getTextEvenIfNullOrUndef(patient.lastNameMother)+" "+patient.name+"</br>";
      textPersonalData+= "<b>Direccion</b>"+patient.address+"</br>";
      textPersonalData+= "<b>Telefono</b>"+patient.phone+"</br>";
      textPersonalData+= "<b>Edad</b>"+patient.age.value+" "+patient.age.in+"</br>";
      textPersonalData+= "<b>Genero</b>"+patient.gender+"</br>";
      newWin.document.write(textPersonalData);
      newWin.document.write("<hr>");
      newWin.document.write("<b>Estudios</b>");
      newWin.document.write("<table>");
      var text = "<tr><th>Nro.</th><th>Cod.</th><th>Fecha</th><th>Diagnostico</th></tr>";
      var counter = 1;
      angular.forEach(studies, function(study){
        text+="<tr>";
        text+="<td>"+counter+"</td>";
        text+="<td>"+study.dailyCode+"</td>";
        text+="<td>"+study.creationDate.toLocaleString()+"</td>";
        text+="<td>"+study.diagnostic+"</td>";
        text+="</tr>";
        counter++;
      });

      newWin.document.write(text);
      newWin.document.write("</table>");
      newWin.document.write("</body></html>");
      newWin.print();
      newWin.close();
    }
    this.printRoles = function(roles) {
      var text = "<tr><th>Nro</th><th>Nombre</th></tr>";
      var counter = 1;
      angular.forEach(roles, function(rol){
        text+="<tr>";
        text+="<td>"+counter+"</td>";
        text+="<td>"+rol.name+"</td>";
        text+="</tr>";
        counter++;
      });
      this.printTableWithText("Reporte de roles", text);
    }

    this.printUsers = function(users) {
      var text = "<tr><th>Nro</th><th>Nombre de usuario</th><th>Nombre</th><th>Apellido</th><th>Rol</th></tr>";
      var counter = 1;
      angular.forEach(users, function(user){
        text+="<tr>";
        text+="<td>"+counter+"</td>";
        text+="<td>"+user.username+"</td>";
        text+="<td>"+user.profile.name+"</td>";
        text+="<td>"+user.profile.lastName+"</td>";
        text+="<td>"+user.rol+"</td>";
        text+="</tr>";
        counter++;
      });
      this.printTableWithText("Reporte de usuarios", text);
    }
    this.printModules = function(modules) {
      var text = "<tr><th>Nro</th><th>Nombre</th><th>Roles</th></tr>";
      var counter = 1;
      angular.forEach(modules, function(module){
        text+="<tr>";
        text+="<td>"+counter+"</td>";
        text+="<td>"+module.name+"</td>";
        text+="<td>";
        module.rolesObj.forEach(function(rol){
          text+=rol.name+"<br>";
        })
        text+="</td>";
        text+="</tr>";
        counter++;
      });
      this.printTableWithText("Reporte de modulos", text);
    }

    this.printAttentions = function(attentions) {
      var text = "<tr><th>Nro</th><th>Nombre</th><th>Descripcion</th></tr>";
      var counter = 1;
      angular.forEach(attentions, function(attention){
        text+="<tr>";
        text+="<td>"+counter+"</td>";
        text+="<td>"+attention.name+"</td>";
        text+="<td>"+attention.description+"</td>";
        text+="</tr>";
        counter++;
      });
      this.printTableWithText("Reporte de tipos de atencion", text);
    }

    this.printTitles = function(titles) {
      var text = "<tr><th>Nro</th><th>Nombre</th><th>Analisis</th><th>Examenes</th></tr>";
      var counter = 1;
      angular.forEach(titles, function(title){
        text+="<tr>";
        text+="<td>"+counter+"</td>";
        text+="<td>"+title.name+"</td>";
        text+="<td>"+title.analisysObj+"</td>";
        text+="<td>";
        text+= "<ul>";
        angular.forEach(title.exams, function(ex){
          text+="<li>"+ex.name+"</li>";
        });
        text+= "</ul>";
        text+="</td>";
        text+="</tr>";
        counter++;
      });
      this.printTableWithText("Reporte de tipos de atencion", text);
    }

    this.printServices = function(services) {
      var text = "<tr><th>Nro</th><th>Nombre</th><th>Descripcion</th></tr>";
      var counter = 1;
      angular.forEach(services, function(service){
        text+="<tr>";
        text+="<td>"+counter+"</td>";
        text+="<td>"+service.name+"</td>";
        text+="<td>"+service.description+"</td>";
        text+="</tr>";
        counter++;
      });
      this.printTableWithText("Reporte de servicios", text);
    }

    this.printDoctors = function(doctors) {
      var text = "<tr><th>Nro</th><th>Nombre</th><th>Apellido</th><th>Especialidad</th><th>Matricula</th></tr>";
      var counter = 1;
      angular.forEach(doctors, function(doctor){
        text+="<tr>";
        text+="<td>"+counter+"</td>";
        text+="<td>"+doctor.name+"</td>";
        text+="<td>"+doctor.lastName+"</td>";
        text+="<td>"+doctor.especialism+"</td>";
        text+="<td>"+doctor.enrolment+"</td>";
        text+="</tr>";
        counter++;
      });
      this.printTableWithText("Reporte de doctores", text);
    }

    this.printPatients = function(patients) {
      var text = "<tr><th>Nro</th><th>Apellido</th><th>Nombre</th><th>CI</th></tr>";
      var counter = 1;
      angular.forEach(patients, function(patient){
        text+="<tr>";
        text+="<td>"+counter+"</td>";
        text+="<td>"+patient.lastName+" "+TextEvaluatorService.getTextEvenIfNullOrUndef(patient.lastNameMother)+"</td>";
        text+="<td>"+patient.name+"</td>";
        text+="<td>"+patient.ci+"</td>";
        text+="</tr>";
        counter++;
      });
      this.printTableWithText("Reporte de pacientes", text);
    }

    this.printExams = function(exams) {
      var text = "<tr><th>Nro</th><th>Nombre</th><th>U.M</th></tr>";
      var counter = 1;
      angular.forEach(exams, function(exam){
        text+="<tr>";
        text+="<td>"+counter+"</td>";
        text+="<td>"+exam.name+"</td>";
        text+="<td>"+exam.measureSymbol+"</td>";
        text+="</tr>";
        counter++;
      });
      this.printTableWithText("Reporte de examenes", text);
    }

    this.printLabs = function(labs) {
      var text = "<tr><th>Nro</th><th>Nombre</th><th>Descripcion</th></tr>";
      var counter = 1;
      angular.forEach(labs, function(lab){
        text+="<tr>";
        text+="<td>"+counter+"</td>";
        text+="<td>"+lab.name+"</td>";
        text+="<td>"+lab.description+"</td>";
        text+="</tr>";
        counter++;
      });
      this.printTableWithText("Reporte de laboratorios", text);
    }

    this.printMeasures = function(measures) {
      var text = "<tr><th>Nro</th><th>Nombre</th><th>Simbolo</th></tr>";
      var counter = 1;
      angular.forEach(measures, function(measure){
        text+="<tr>";
        text+="<td>"+counter+"</td>";
        text+="<td>"+measure.name+"</td>";
        text+="<td>"+measure.symbol+"</td>";
        text+="</tr>";
        counter++;
      });
      this.printTableWithText("Reporte de unidades de medida", text);
    }

    this.printPersonal = function(personal) {
      var text = "<tr><th>Nro</th><th>Usuario</th><th>Laboratorio</th><th>Cargo</th></tr>";
      var counter = 1;
      angular.forEach(personal, function(p){
        text+="<tr>";
        text+="<td>"+counter+"</td>";
        text+="<td>"+p.userObj+"</td>";
        text+="<td>"+p.labObj+"</td>";
        text+="<td>"+p.job+"</td>";
        text+="</tr>";
        counter++;
      });
      this.printTableWithText("Reporte de unidades de medida", text);
    }

    this.printAnalisys = function(analisys) {
      var text = "<tr><th>Nro</th><th>Nombre</th><th>Laboratorio</th><th>Descripcion</th></tr>";
      var counter = 1;
      angular.forEach(analisys, function(a){
        text+="<tr>";
        text+="<td>"+counter+"</td>";
        text+="<td>"+a.name+"</td>";
        text+="<td>"+TextEvaluatorService.getTextEvenIfNullOrUndef(a.labObj)+"</td>";
        text+="<td>"+TextEvaluatorService.getTextEvenIfNullOrUndef(a.description)+"</td>";
        text+="</tr>";
        counter++;
      });
      this.printTableWithText("Reporte de analisis", text);
    }

    this.printReport = function(results, header, title){
      var text = "<tr><th>Nro</th><th>Cod.</th><th>Fecha</th><th>Paciente</th><th>Edad</th><th>Doctor</th><th>Atencion</th><th>Servicio</th></tr>";
      var counter = 1;
      angular.forEach(results, function(result){
        text+="<tr>";
        text+="<td>"+counter+"</td>";
        text+="<td>"+TextEvaluatorService.getTextEvenIfNullOrUndef(result.dailyCode)+"</td>";
        text+="<td>"+result.creationDate.toLocaleDateString()+"</td>";
        text+="<td>"+result.patientName+"</td>";
        if(!!result.age){
          text+="<td>"+result.age.value+" "+result.age.in+"</td>";  
        }else{
          text+="<td></td>";
        }
        text+="<td>"+result.doctorName+"</td>";
        text+="<td>"+TextEvaluatorService.getTextEvenIfNullOrUndef(result.attentionName)+"</td>";
        text+="<td>"+TextEvaluatorService.getTextEvenIfNullOrUndef(result.serviceName)+"</td>";
        text+="</tr>";
        counter++;
      });
      this.printTableWithText(title, text, header);
    }
    this.printReportStudies = function(results, initialDate, endDate){
      var header = "<b>Fecha inicial:</b> "+initialDate.toLocaleDateString()+"<br/>";
      header += "<b>Fecha final:</b> "+endDate.toLocaleDateString()+"<br/>";
      header += "<b>Nro. resultados:</b> "+results.length+"<br/>";
      this.printReport(results, header, "Reporte de estudios por fecha");
    }

    this.printReportStudiesByPatient = function(results, initialDate, endDate, gender,pInitialAge,pEndAge,selectedInType, nrPatients){
      var header = "<b>Fecha inicial:</b> "+initialDate.toLocaleDateString()+"<br/>";
      header += "<b>Fecha final:</b> "+endDate.toLocaleDateString()+"<br/>";
      header += "<b>Nro. Pacientes:</b> "+nrPatients+"<br/>";
      header += "<b>Nro. resultados:</b> "+results.length+"<br/>";
      header += "<b>Genero:</b> "+gender+"<br/>";
      header += "<b>Edad:</b> "+pInitialAge+" a "+pEndAge+" "+selectedInType+"<br/>";
      this.printReport(results, header, "Reporte de estudios por paciente");
    }

    this.printReportStudiesByProcedence = function(results, initialDate, endDate,attention, service){
      var header = "<b>Fecha inicial:</b> "+initialDate.toLocaleDateString()+"<br/>";
      header += "<b>Fecha final:</b> "+endDate.toLocaleDateString()+"<br/>";
      header += "<b>Nro. resultados:</b> "+results.length+"<br/>";
      header += "<b>Atencion:</b> "+attention.name+"<br/>";
      header += "<b>Servicio:</b> "+service.name+"<br/>";
      this.printReport(results, header, "Reporte de estudios por procedencia");
    }

    this.printReportStudiesByAnalisys = function(results, initialDate, endDate, analisys){
      var header = "<b>Fecha inicial:</b> "+initialDate.toLocaleDateString()+"<br/>";
      header += "<b>Fecha final:</b> "+endDate.toLocaleDateString()+"<br/>";
      header += "<b>Nro. resultados:</b> "+results.length+"<br/>";
      header += "<b>Análisis:</b> "+analisys.name+"<br/>";
      this.printReport(results, header, "Reporte de estudios por analisis");
    }
  
    this.printHistorialOfExam = function(exam, study){
      var header = "<b>Codigo:</b> "+study.dailyCode+"<br/>";
      header += "<b>Examen:</b> "+exam.name()+"<br/>";
      header += "<b>Paciente:</b> "+(study.patientObj.lastName||"")+" "+(study.patientObj.lastNameMother||"")+" "+(study.patientObj.name||"")+"<br/>";
      header += "<b>Fecha de creación:</b> "+study.creationDate.toLocaleDateString()+"<br/>";
      header += "<b>Recibo:</b> "+(study.bill||"")+"<br/>";
      var text = "<tr><th>Nro</th><th>Usuario</th><th>Fecha</th><th>Valor</th></tr>";
      var counter = 1;
      angular.forEach(exam.historial, function(p){
        text+="<tr>";
        text+="<td>"+counter+"</td>";
        text+="<td>"+p.userName+"</td>";
        text+="<td>"+p.date.toLocaleDateString()+"</td>";
        text+="<td>"+p.value+"</td>";
        text+="</tr>";
        counter++;
      });
      this.printTableWithText("Historial de modificacion",text, header);
    }

    this.printTableWithText = function(title,text,tableHeader){
      var newWin= window.open("");

      var style = "<style type='text/css'>table {min-width:50%;  margin-left:auto; margin-right:auto;} table, th, td {border: 1px solid black;}"+
                      "body {font-family: 'Verdana', Geneva, sans-serif;font-size:8pt}"+
                      "header nav, footer {display: none;}"+
                      "table {font-size:8pt; border-collapse:collapse}"+
                      "h1 {text-align: center}"+
                      ".header {text-align: right;}"+
                      "@page {size:auto;margin: 10mm;}"+
                      " .break { page-break-after: always; }"+
                      " body {  }"+
                      " tr {page-break-inside: avoid !important;} "+
                      "</style>";
      newWin.document.write("<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>"+style+"</head><body>")
      newWin.document.write("<b class='header'>COMPLEJO HOSPITALARIO VIEDMA</b><br/>");
      newWin.document.write("<b class='header'>Instituto de Gastroenterología Boliviano Japonés</b><br/>");
      newWin.document.write("<b class='header'>Cochabamba - Bolivia</b><br/>");
      newWin.document.write("<h1>"+title+"</h1>");
      newWin.document.write("<hr>");
      if(!!tableHeader){
        newWin.document.write(tableHeader);
      }
      newWin.document.write("<hr>");
      newWin.document.write("<table>");
      newWin.document.write(text);
      newWin.document.write("</table>");
      newWin.document.write("</body></html>");
      newWin.print();
      newWin.close();
    }

});
