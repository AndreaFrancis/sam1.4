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
    });
    Meteor.methods({
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
        findPatient: function(parameter){
          var fut = new Future();
          console.log("SAM-INFO: "+parameter);
          Sql.q("select * from SE_HC where HCL_NOMBRE LIKE '%"+parameter+"%'", function(err, res){
              console.log("SAM-INFO: B");
                      if(err){
                        console.log("ERRROR:"+ err);
                      }else{
                        res.forEach(function(r){
                              console.log("i:"+r['HCL_NOMBRE']+" "+r['HCL_SEXO']+" "+r['HCL_APPAT']+" "+r['HCL_APMAT']+" "+r['HCL_NUMCI']+" "+r['HCL_CODIGO']+" "+r['HCL_DIRECC']+" "+r['HCL_TELDOM']);
                        });
                        console.log("SAM-INFO"+res.length);
                        fut['return'](res);
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
      //Users.insert(user);
    }
}
