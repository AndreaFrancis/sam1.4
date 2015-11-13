angular.module("sam-1").config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
    function($urlRouterProvider, $stateProvider, $locationProvider){
        $locationProvider.html5Mode(true);

        $stateProvider
            .state('profile', {
              url: '/profile',
              templateUrl: 'client/starter/profile.ng.html',
              controller: 'ProfileCtrl',
              data: {
                requireLogin: true
              }
            })
            .state('config', {
              url: '/config',
              templateUrl: 'client/starter/config.ng.html',
              controller: 'ConfigCtrl',
              data: {
                requireLogin: true
              }
            })
            .state('services', {
                url: '/services',
                templateUrl: 'client/services/services.ng.html',
                controller: 'ServicesListCtrl',
                data: {
                  requireLogin: true
                }
            })
            .state('labs', {
                url: '/labs',
                templateUrl: 'client/labs/labs.ng.html',
                controller: 'LabsListCtrl',
                data: {
                  requireLogin: true
                }
            })
            .state('users', {
                url: '/users',
                templateUrl: 'client/users/views/users-list.ng.html',
                controller: 'UsersListCtrl',
                data: {
                  requireLogin: true
                }
            })
            .state('start', {
                url: '/',
                templateUrl: 'client/starter/start.ng.html',
                controller: 'DashboardCtrl',
                data: {
                  requireLogin: true
                }
            })
            .state('measures', {
                url: '/measures',
                templateUrl: 'client/measures/measures.ng.html',
                controller: 'MeasuresListCtrl',
                data: {
                  requireLogin: true
                }
            })
            .state('analisys', {
                url: '/analisys',
                templateUrl: 'client/analisys/views/analisys.ng.html',
                controller: 'AnalisysListCtrl',
                data: {
                  requireLogin: true
                }
            })
            .state('attentions', {
                url: '/attentions',
                templateUrl: 'client/attentions/attentions.ng.html',
                controller: 'AttentionsListCtrl',
                data: {
                  requireLogin: true
                }
            })
            .state('titles', {
                url: '/titles',
                templateUrl: 'client/titles/titles.ng.html',
                controller: 'TitlesListCtrl',
                data: {
                  requireLogin: true
                }
            })
            .state('exams', {
                url: '/exams',
                templateUrl: 'client/exams/exams.ng.html',
                controller: 'ExamsListCtrl',
                data: {
                  requireLogin: true
                }
            })
            .state('roles', {
                url: '/roles',
                templateUrl: 'client/roles/roles.ng.html',
                controller: 'RolesListCtrl',
                data: {
                  requireLogin: true
                }
            })
            .state('modules', {
                url: '/modules',
                templateUrl: 'client/modules/modules.ng.html',
                controller: 'ModulesListCtrl',
                data: {
                  requireLogin: true
                }
            })
            .state('patients', {
                url: '/patients',
                templateUrl: 'client/patients/patients.ng.html',
                controller: 'PatientsListCtrl',
                data: {
                  requireLogin: true
                }
            })
            .state('patient', {
                url: '/patient/:patientId',
                templateUrl: 'client/patients/patient-details.ng.html',
                controller: 'PatientCtrl',
                data: {
                  requireLogin: true
                }
            })
            .state('studies', {
                url: '/studies',
                templateUrl: 'client/studies/studies.ng.html',
                controller: 'StudiesListCtrl',
                data: {
                  requireLogin: true
                }
            })
            .state('results', {
                url: '/results',
                templateUrl: 'client/results/results.ng.html',
                controller: 'ResultsListCtrl',
                data: {
                  requireLogin: true
                }
            })
            .state('study', {
                url: '/study/:studyId',
                templateUrl: 'client/studies/study-details.ng.html',
                controller: 'StudyCtrl',
                data: {
                  requireLogin: true
                }
            })
            .state('newstudy', {
                url: '/newstudy/:patientId',
                templateUrl: 'client/studies/addStudy.tmpl.ng.html',
                controller: 'AddStudyController',
                data: {
                  requireLogin: true
                }
            })
            .state('doctors', {
                url: '/doctors',
                templateUrl: 'client/doctors/doctors.ng.html',
                controller: 'DoctorsListCtrl',
                data: {
                  requireLogin: true
                }
            })
            .state('labpersonal', {
                url: '/labpersonal',
                templateUrl: 'client/labpersonal/labpersonal.ng.html',
                controller: 'LabPersonalListCtrl',
                data: {
                  requireLogin: true
                }
            })
            .state('login',{
              url: '/login',
              templateUrl: 'client/starter/login.ng.html',
              controller: 'AppCtrl',
              data: {
                requireLogin: true
              }
            })
            .state('reports',{
              url: '/reports',
              templateUrl: 'client/reports/reports.ng.html',
              controller: 'ReportsCtrl',
              data: {
                requireLogin: true
              }
            });
        $urlRouterProvider.otherwise('/');
    }]);



$(document).ready(function() {
    var table = $('#table');

    // Table bordered
    $('#table-bordered').change(function() {
        var value = $( this ).val();
        table.removeClass('table-bordered').addClass(value);
    });

    // Table striped
    $('#table-striped').change(function() {
        var value = $( this ).val();
        table.removeClass('table-striped').addClass(value);
    });

    // Table hover
    $('#table-hover').change(function() {
        var value = $( this ).val();
        table.removeClass('table-hover').addClass(value);
    });

    // Table color
    $('#table-color').change(function() {
        var value = $(this).val();
        table.removeClass(/^table-mc-/).addClass(value);
    });
});

// jQuery�s hasClass and removeClass on steroids
// by Nikita Vasilyev
// https://github.com/NV/jquery-regexp-classes
(function(removeClass) {

    jQuery.fn.removeClass = function( value ) {
        if ( value && typeof value.test === "function" ) {
            for ( var i = 0, l = this.length; i < l; i++ ) {
                var elem = this[i];
                if ( elem.nodeType === 1 && elem.className ) {
                    var classNames = elem.className.split( /\s+/ );

                    for ( var n = classNames.length; n--; ) {
                        if ( value.test(classNames[n]) ) {
                            classNames.splice(n, 1);
                        }
                    }
                    elem.className = jQuery.trim( classNames.join(" ") );
                }
            }
        } else {
            removeClass.call(this, value);
        }
        return this;
    }

})(jQuery.fn.removeClass);
