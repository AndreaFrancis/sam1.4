/**
 * Created by Andrea on 28/07/2015.
 */
angular.module("sam-1").controller("PatientCtrl", ['$scope', '$stateParams','$meteor','ModalService','$state','PrintService',
    function($scope, $stateParams, $meteor, ModalService, $state, PrintService){
        $scope.patient = $meteor.object(Patients, $stateParams.patientId);

        $scope.showAll = function(){
          $scope.studies = Studies.find({patient:  $scope.patient._id}, {
                  transform: function(doc){
                      doc.creatorName = {};
                      if(doc.creatorId) {
                          var creatorName = $meteor.object(Users,doc.creatorId);
                          if(creatorName) {
                              doc.creatorName = creatorName.profile.name + " "+ creatorName.profile.lastName;
                          }
                      }
                      return doc;
                  }
              }).fetch();
        }

        $scope.showDate = function(pInitialDate, pEndDate){
          $scope.studies = Studies.find({
                $and:[
                  {patient:  $scope.patient._id},
                  {"creationDate": {"$gte": pInitialDate, "$lt": pEndDate}}
                ]
              }, {
                  transform: function(doc){
                      doc.creatorName = {};
                      if(doc.creatorId) {
                          var creatorName = $meteor.object(Users, doc.creatorId);
                          if(creatorName) {
                              doc.creatorName = creatorName.profile.name + " "+ creatorName.profile.lastName;
                          }
                      }
                      return doc;
                  }
              }).fetch();
        }

        $scope.goPatients = function(){
            $state.go('patients');
        }

        $scope.addStudy = function($event) {
            $state.go('newstudy',{patientId:$scope.patient._id});
        }

        $scope.show = function(study){
          $state.go('study',{studyId:study._id});
        }

        $scope.showPatient = function(patient, ev){
          ModalService.showModalWithParams(AddPatientController, 'client/patients/addPatient.tmpl.ng.html', ev, {patient:$scope.patient});
        }

        $scope.delete = function(event) {
            var onRemoveCancel = function (){
              console.log("Se cancelo la eliminacion del pacientes");
            }
            var onRemoveSuccess = function() {
                var  studies = Studies.find({patient:$scope.patient._id}).fetch();
                $meteor.collection(Studies,false).remove(studies);
               Patients.remove($scope.patient._id);
               $state.go('patients');
            }
            ModalService.showConfirmDialog('Eliminar paciente', '¿Estas seguro de eliminar los datos del paciente?, Se eliminaran los estudios vinculados al mismo', 'Eliminar', 'Cancelar', event, onRemoveCancel, onRemoveSuccess);
        }

        $scope.print = function(){
            PrintService.printPatientHistorial($scope.patient, $scope.studies);
        }

        $scope.showAll();
    }]);

function AddStudyController($scope, $meteor, notificationService, $stateParams, ModalService,$state, CONDITIONS) {
    var patientId =  $stateParams.patientId;
    var userRol = localStorage.getItem("rolName");
    $scope.study = {};
    $scope.conditions = CONDITIONS;
    $scope.isBioquimic = userRol=="Bioquimico";
    $scope.isDoctor = userRol=="Doctor";
    $scope.newDoctor = {};
    $scope.study.creationDate = new Date();
    $scope.labs = $meteor.collection(Labs,false);
    $scope.labsCounter = [];
    angular.forEach($scope.labs, function(lab){
      $scope.labsCounter.push({lab:lab._id, counter:0});
    });
    
    if($scope.isDoctor){
      var doctor = Doctors.findOne({userId: localStorage.getItem("user")});
      if(doctor){
        $scope.selectedDoctor = doctor;
      }
    }
    if(patientId){
        $scope.patient = $meteor.object(Patients, patientId);
        $scope.existingPatient = true;

    }else{
        $scope.study = {};
        $scope.study.internData = {};
        $scope.patients = Patients.find({}, {
                transform: function(doc) {
                    doc.value = (doc.lastName||"")+ " "+ (doc.lastNameMother||"") + " "+doc.name;
                    return doc;
                }
            }).fetch();
    }

    $scope.attentions = $meteor.collection(Attentions, false);
    $scope.services = $meteor.collection(Services, false);
    $scope.doctors = Doctors.find({},{
        transform: function(doc){
          doc.value = doc.name +" "+ doc.lastName;
          return doc;
        }
      }).fetch();

    $scope.studies = $meteor.collection(Studies, false);
    $scope.analisysList = Analisys.find({active:true},{
          transform: function(anDoc){
            anDoc.titles = Titles.find({$and:[{active:true},{analisys:anDoc._id}]},{
                transform: function(titDoc){
                    titDoc.exams = Exams.find({$and:[{active:true},{title:titDoc._id}]}).fetch();
                  return titDoc;
                }
              }).fetch();
            return anDoc;
          }
      }).fetch();

    $scope.createNewDoctor = function(ev){
      ModalService.showModalWithParams('AddDoctorController',  'client/doctors/addDoctor.tmpl.ng.html',ev, {doctor:null});
    }

    $scope.createNewPatient = function(ev){
      ModalService.showModalWithParams('AddPatientController', 'client/patients/addPatient.tmpl.ng.html', ev, {patient:null});
    }

    $scope.changeAttention = function(){
      var attentionJson = $scope.selectedAttention;
      $scope.internData = attentionJson.name==CONDITIONS.INTERN_PATIENT;
      if($scope.internData) {
        $scope.study.internData = {};
      }else{
        delete $scope.study.internData;
      }
    }

    $scope.selectAnalisys = function(analisys) {
        angular.forEach(analisys.titles, function(title) {
            $scope.selectTitle(title);
            title.selected = !analisys.selected;
        });
    };

    $scope.selectTitle = function(title) {
        angular.forEach(title.exams, function(exam) {
            exam.selected = !title.selected;
        });
    }

    $scope.save = function() {

        $scope.study.analisys = [];
        var attentionJson = JSON.parse($scope.selectedAttention);
        $scope.study.attention = attentionJson._id;
        var serviceJson = JSON.parse($scope.selectedService);
        $scope.study.service = serviceJson._id;
        angular.forEach($scope.analisysList, function(analisys)  {
            var component = {};
            component.titles = [];
            angular.forEach(analisys.titles, function(title){
                var titleComponent = {};
                titleComponent.exams = [];
                if(title.selected && !analisys.selected){
                    analisys.selected = true;
                };
                angular.forEach(title.exams, function(exam){
                  var examComponent = {};
                  if(exam.selected) {
                    examComponent.exam = exam._id;
                    examComponent.historial = [];
                    titleComponent.exams.push(examComponent);
                      if(!title.selected){
                          title.selected = true;
                          if(!analisys.selected) {
                              analisys.selected = true;
                          }
                      };
                  }
                });

                if(title.selected) {
                    titleComponent.title = title._id;
                    component.titles.push(titleComponent);
                }
            });
            if(analisys.selected){
                component.analisys = analisys._id;
                $scope.study.analisys.push(component);
                $scope.incrementAcordingToLab(analisys.lab);
            }
        });
        if(localStorage.getItem("rol") == "Doctor"){
            $scope.study.doctorUser = localStorage.getItem("user");
        }
        $scope.study.doctor = $scope.selectedDoctor._id;

        $scope.study.creatorId = localStorage.getItem("user");
        if($scope.patient) {
            $scope.study.patient = $scope.patient._id;
        }else {
            $scope.study.patient = $scope.selectedItem._id;
        }

        $scope.study.labsCounter = $scope.labsCounter;

        $scope.studies.save($scope.study).then(function(number) {
            notificationService.showSuccess("Se ha registrado correctamente el estudio");
        }, function(error){
            notificationService.showError("Error en el registro del estudio");
            console.log(error);
        });
        $state.go("studies");
    }

    $scope.incrementAcordingToLab = function(lab){
      var result = _.findWhere($scope.labsCounter, {lab: lab});
      if(result){
        var counter = result.counter+1;
        result.counter = counter;
      }
    }

    $scope.selectedItemChange = function(patient){
      $scope.selectedItem = patient;
    }
    $scope.selectedDoctorChange = function(doctor){
      $scope.selectedDoctor = doctor;
    }
    $scope.cancel = function() {
        $state.go("studies");
    }

    $scope.saveNewDoctor = function(){
        $scope.doctors.save($scope.newDoctor).then(function(number) {

        }, function(error){
            notificationService.showError("Error en el registro del rol");
            console.log(error);
        });
        $scope.newDoctor = '';
        $scope.createNewDoctor = false;
    }

    /**AUTOCOMPLETE**/
    $scope.isDisabled    = false;

    $scope.querySearch = function (query) {
        return query ? $scope.patients.filter( createFilterFor(query) ) : [];
    }

    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(item) {
            return (item.value.toLowerCase().indexOf(lowercaseQuery) >= 0);
        };
    }

    $scope.queryDoctors = function(query) {
        return query ? $scope.doctors.filter( createFilterForDoctor(query) ) : [];
    }

    function createFilterForDoctor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(item) {
            return (item.name.toLowerCase().indexOf(lowercaseQuery) >= 0);
        };
    }
}

/*function AddStudyController($scope, $mdDialog, $meteor, notificationService, patient) {
    $scope.isDoctor = localStorage.getItem("rol") == "Doctor";
    $scope.existingStudy = false;
    if(patient){
        $scope.patient = patient;
        $scope.existingStudy = true;
    }
    $scope.studies = $meteor.collection(Studies, false);
    $scope.analisysList = $meteor.collection(function() {
        return Analisys.find({}, {
            transform: function(doc) {
                doc.examsObj = [];
                if(doc.exams) {
                    doc.examsObj = $meteor.collection(function(){
                        return Exams.find({
                                _id: {$in: doc.exams}
                            },{
                                transform: function(doc) {
                                    doc.testsObj = [];
                                    if(doc.tests) {
                                        doc.testsObj = $meteor.collection(function(){
                                            return Tests.find({
                                                _id: {$in: doc.tests}
                                            }) ;
                                        }, false);
                                    }
                                    return doc;
                                }
                            }
                        );
                    }, false) ;
                }

                doc.testsObj = [];
                if(doc.tests) {
                    doc.testsObj = $meteor.collection(function(){
                        return Tests.find({
                            _id: {$in: doc.tests}
                        });
                    }, false) ;
                }


                return doc;
            }
        });
    }, false);

    $scope.selectAnalisys = function(analisys) {
        angular.forEach(analisys.testsObj, function(test) {
            test.selected = !analisys.selected;
        });
        angular.forEach(analisys.examsObj, function(exam) {
            $scope.selectExam(exam);
            exam.selected = !analisys.selected;
        });
    };

    $scope.selectExam = function(exam) {
        angular.forEach(exam.testsObj, function(test) {
            test.selected = !exam.selected;
        });
    }

    $scope.save = function() {
        var study = {};
        study.analisys = [];
        angular.forEach($scope.analisysList, function(analisys)  {
            var isAnalisysSelected = false;
            var component = {};
            component.tests = [];
            component.exams = [];
            console.log(analisys.name+":"+analisys.selected);
            angular.forEach(analisys.testsObj, function(test){
                if(test.selected && !isAnalisysSelected){
                    isAnalisysSelected = true;
                    component.analisys = analisys._id;
                };
                if(test.selected) {
                    component.tests.push({test:test._id});
                }
            });
            angular.forEach(analisys.examsObj, function(exam){
                var isExamSelected = false;
                if(exam.selected && !isAnalisysSelected){
                    isAnalisysSelected = true;
                    component.analisys = analisys._id;
                };

                var examComponent = {};
                angular.forEach(exam.testsObj, function(testEx){
                    if(testEx.selected && !isExamSelected){
                        isExamSelected = true;
                        if(!isAnalisysSelected) {
                            isAnalisysSelected = true;
                            component.analisys = analisys._id;
                        }
                        examComponent.exam = exam._id;
                        examComponent.tests = [];
                    };
                    if(testEx.selected) {
                        examComponent.tests.push({test:testEx._id});
                    }
                });

                if(isExamSelected) {
                    examComponent.exam = exam._id;
                    component.exams.push(examComponent);
                }
            });
            if(isAnalisysSelected){
                study.analisys.push(component);
            }
        });
        if(localStorage.getItem("rol") == "Doctor"){
            study.doctorUser = localStorage.getItem("user");
        }

        study.creatorId = localStorage.getItem("user");
        study.creationDate = new Date();
        study.patient = $scope.patient._id;
        $scope.studies.save(study).then(function(number) {
            notificationService.showSuccess("Se ha registrado correctamente el estudio");
        }, function(error){
            notificationService.showError("Error en el registro del estudio");
            console.log(error);
        });
        $mdDialog.hide();
    }

    $scope.cancel = function() {
        $mdDialog.cancel();
    }
}*/
