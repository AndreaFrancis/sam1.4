/**
 * Created by Andrea on 28/07/2015.
 */
angular.module('sam-1').directive('demoDirective', function($compile) {
    return {
        template: '<div>&ensp;{{module.name}}</div>',
        replace: true
    }
});



angular.module('sam-1').directive('indexText', function($compile) {
    return {
        template: '<div>{{username}}</div>',
        replace: true
    }
});

angular.module('sam-1').directive('location', function($compile) {
    return {
        template: '<div>{{currentModule}}</div>',
        replace: true
    }
});

angular.module('sam-1').directive('error', function($compile) {
    return {
        template: '<div>{{error}}</div>',
        replace: true
    }
});

angular.module('sam-1').directive('avatar', function($compile) {
  return {
    template: '<img ng-src=@"{{user.profile.image}}" class="md-avatar" alt="{{user.username}}" />',
    replace: true
  }
});


//template: '<div><a ng-href="{{module.state}}">&ensp;{{module.name}}</a></div>',
angular.module('sam-1').directive('mainTex', function($compile) {
    return {
        template: '<div><i class="{{module.icon}}"> &nbsp;&nbsp;</i>{{module.name}}</div>',
        replace: true
    }
});

angular.module('sam-1').directive('text', function($compile) {
    return {
        template: '<div>Labsis &ensp;<i class="fa fa-angle-right"></i> &ensp;{{currentModule}}</div>',
        replace: true
    }
});


/**Image directive**/
angular.module('sam-1').directive('customOnChange', function() {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChange);
            element.bind('change', onChangeHandler);
        }
    };
});


angular.module('sam-1').directive('inputText', function() {
  return {
    require: 'ngModel',
    link: function(scope, elem, attr, ctrl) {
      var re = new RegExp("^([a-zA-Z ]{0,})$");

      ctrl.$parsers.unshift(function(value) {
          var valid = re.test(value);
          ctrl.$setValidity('inputText', valid);
          return valid? value: undefined;
      });

      ctrl.$formatters.unshift(function(value) {
          var valid = re.test(value);
          ctrl.$setValidity('inputText', valid);
          return value;
      });
    }
  };
});

angular.module('sam-1').directive('inputNumeric', function() {
  return {
    require: 'ngModel',
    link: function(scope, elem, attr, ctrl) {
      var re = new RegExp("^([0-9]{0,})$");

      ctrl.$parsers.unshift(function(value) {
          var valid = re.test(value);
          ctrl.$setValidity('inputNumeric', valid);
          return valid? value: undefined;
      });

      ctrl.$formatters.unshift(function(value) {
          var valid = re.test(value);
          ctrl.$setValidity('inputNumeric', valid);
          return value;
      });
    }
  };
});


angular.module('sam-1').directive('password', function() {
  return {
    require: 'ngModel',
    link: function(scope, elem, attr, ctrl) {
      var re = new RegExp("^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$");

      ctrl.$parsers.unshift(function(value) {
          var valid = re.test(value);
          ctrl.$setValidity('password', valid);
          return valid? value: undefined;
      });
    }
  };
});
