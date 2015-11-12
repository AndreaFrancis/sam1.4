angular.module('sam-1').constant("CONDITIONS", {
        "INTERN_PATIENT": "Internado"
});

angular.module('sam-1').constant("ROLES", {
        0: "Administrador",
        1: "Doctor",
        2: "Biquimico",
        3: "Secretario"
});

angular.module('sam-1').constant("RANGE_EVALUATOR", {
        "ENTRE": function(exam, result){

        },
        "HASTA": function(exam, result){

        }
});
