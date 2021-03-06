Areas = new Mongo.Collection("Areas");
Analisys = new Mongo.Collection("Analisys");
Answers = new Mongo.Collection("Answers");
Attentions = new Mongo.Collection("Attentions");
Doctors = new Mongo.Collection("Doctors");
Exams = new Mongo.Collection("Exams");
Ranges = new Mongo.Collection("Ranges");
Labpersonal = new Mongo.Collection("Labpersonal");
Labs = new Mongo.Collection("Labs");
Measures = new Mongo.Collection("Measures");
Modules =  new Mongo.Collection("Modules");
Patients = new Mongo.Collection("Patients");
RolesData = Meteor.roles;
Services = new Mongo.Collection("Services");
Studies = new Mongo.Collection("Studies");
Reasons = new Mongo.Collection("Reasons");
Titles = new Mongo.Collection("Titles");
TypeEvaluation = new Mongo.Collection("TypeEvaluation");
Users = Meteor.users;
var imageStore = new FS.Store.GridFS("images");
Images = new FS.Collection("images", {
    stores: [imageStore]
});


if(Meteor.isServer){
    Future = Npm.require('fibers/future');

    Meteor.publish("counters",function(){
      Counts.publish(this,"roles",RolesData.find());
      Counts.publish(this,"modules",Modules.find());
      Counts.publish(this,"labs",Labs.find());
      Counts.publish(this,"users",Users.find());
      Counts.publish(this,"measures",Measures.find());
      Counts.publish(this,"labpers",Labpersonal.find());
      Counts.publish(this,"services",Services.find());
      Counts.publish(this,"attentions",Attentions.find());
      Counts.publish(this,"doctors",Doctors.find());
      Counts.publish(this,"analisys",Analisys.find({active:true}));
      Counts.publish(this,"titles",Titles.find({active:true}));
      Counts.publish(this,"exams",Exams.find({active:true}));
      Counts.publish(this,"patients",Patients.find());
      Counts.publish(this,"studies",Studies.find({$or:
          [
            { "dailyCode": { $exists: false } },
            { "dailyCode": null }
          ]}));
      Counts.publish(this,"results",Studies.find({$and:
          [
            { "dailyCode": { $exists: true } },
            { "dailyCode": {$ne:null} }
          ]}));
    });

    Meteor.methods({
        saveUser: function(user){
          Meteor.users.update({_id:user._id}, 
            { $set:{"profile.name":user.profile.name,
            "profile.lastName":user.profile.lastName,
            "profile.lastNameMother":user.profile.lastNameMother,
            "profile.mainrol":user.profile.mainrol}} );
        },
        createNewUser: function(user){
            if (!user.username){
              throw new Meteor.Error(422, 'Please include a username.');
            }
            if (!user.password){
              throw new Meteor.Error(422, 'Please include a password.');
            }
            Accounts.createUser(user);
        },
        deleteUser : function(id){
            return Meteor.users.remove(id);
        },
        createDiscriminatedReport :function(){
          var fut = new Future();

          var keys = {};
          var attentions = Attentions.find().fetch();
          var services = Services.find().fetch();
          attentions.forEach(function(attention){
            var detail = {};
            services.forEach(function(service){
              detail[service._id] = 0;
            });
            keys[attention._id] = detail;
          });

          var template = {};
          var analisysList = Analisys.find().fetch();
          analisysList.forEach(function(analisys){
            var titles = {};
            var titlesP = Titles.find({analisys:analisys._id}).fetch();
            titlesP.forEach(function(title){
              var exams = {};
              var examsP = Exams.find({title:title._id}).fetch();
              examsP.forEach(function(exam){
                exams[exam._id] = {name:exam.name, result: JSON.parse(JSON.stringify(keys))}
              });
              titles[title._id] = {name: title.name, exams:exams};
            });
            template[analisys._id] = {name: analisys.name, titles:titles, result: JSON.parse(JSON.stringify(keys))};
          });

        keys.forEach(function(servicesArray,attentionKey){
          angular.forEach(servicesArray, function(values,serviceKey){
            var resultsByAttentionAndSer = $meteor.collection(function(){
              return Studies.find(
                {$and:[
                       {"creationDate": {"$gte": pInitialDate, "$lt": pEndDate}}
                  ,
                   {"attention":attentionKey}
                  ,
                  {"service": serviceKey}
              ]});
            },false);

            angular.forEach(resultsByAttentionAndSer, function(studyRes){
              angular.forEach(studyRes.analisys, function(analisys){
                var analisysCode = analisys.analisys;
                angular.forEach(analisys.titles, function(title){
                  var titleCode = title.title;
                  angular.forEach(title.exams, function(exam){
                    var examCode = exam.exam;
                    $scope.template[analisysCode].result[attentionKey][serviceKey]+=1;
                    $scope.template[analisysCode].titles[titleCode].exams[examCode].result[attentionKey][serviceKey]+=1;
                  });
                });
              });
            });
          });
        });
          fut['return'](template);
          return fut.wait();
        },
        findPatientByPay : function(bill){
          var fut = new Future();
          var opts = {
            sp : "obtenerPacientePorRecibo",
            inputs : [ {
              name  : "factura",
              type  : Sql.driver.Int,
              value : bill
            }
            ]
          }

          Sql.sp(opts, function(err, res){
            if(err){
                        console.log("ERRROR:"+ err);
                        fut['return'](err);
             }else{
                        res.forEach(function(r){
                              console.log("Es:"+r[0]['HCL_SEXO']+" "+r[0]['HCL_CODIGO']+" "+r[0]['HCL_APMAT']+" "+r[0]['HCL_NOMBRE']);
                              var ci = r[0]['HCL_NUMCI'];
                              var patient = Patients.findOne({ci:ci});
                              if(patient == undefined || patient == null){
                                console.log("No existe paciente con este ci, sera creado");
                                var newPatient = 
                                {
                                  name:r[0]['HCL_NOMBRE'],
                                  lastName : r[0]['HCL_APPAT'],
                                  lastNameMother:r[0]['HCL_APMAT'],
                                  medHis:r[0]['HCL_CODIGO'],
                                  ci:r[0]['HCL_NUMCI'],
                                  address:r[0]['HCL_DIRECC'],
                                  phone:r[0]['HCL_TELDOM']
                                }
                                Patients.insert(newPatient);
                                newPatient = Patients.findOne({ci:ci});
                                fut['return'](newPatient);
                              }else{
                                console.log("Paciente: "+patient.name);
                                fut['return'](patient);
                              }
                        });
                        console.log("SAM-INFO-Tamanio : "+res.length);
            }
          });
          return fut.wait();
        }
    });
  
    if(RolesData.find().count() == 0){
      JSON.parse(Assets.getText("defaults.json")).roles.forEach(function (doc) {
        var rol = {name:doc};
        RolesData.insert(rol);
      });
      console.log("Se registraron los roles por defecto");
    }

    if(Modules.find().count() == 0){
      JSON.parse(Assets.getText("defaults.json")).modules.forEach(function (doc) {
        var rolesId = [];
        RolesData.find().forEach(function(doc){
          rolesId.push(doc._id);
        });
        doc.roles = rolesId;
        Modules.insert(doc);
      });
      console.log("Se registraron los modulos por defecto");
    }

    if (Users.find().count() === 0) {
      var user = JSON.parse(Assets.getText("defaults.json")).admin;
      var mainrol = JSON.parse(Assets.getText("defaults.json")).mainrol;
      var rol = RolesData.findOne({name:mainrol});
      user.profile.mainRol = rol._id;
      Meteor.call("createNewUser",user, function(err){
        if(err){
          console.log("No se pudo registrar al administrador por defecto");
        }else{
          console.log("La primera vez se creara el usuario administrador por defecto");
        }
      });
    }
    //Meteor.call("findPatientByPay",418818);
}
