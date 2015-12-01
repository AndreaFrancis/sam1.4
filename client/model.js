Analisys = new Mongo.Collection("Analisys");
//Ground.Collection(Analisys,'analisys');

Answers = new Mongo.Collection("Answers");
//Ground.Collection(Answers,'answers');

Attentions = new Mongo.Collection("Attentions");
//Ground.Collection(Attentions,'attentions');

Doctors = new Mongo.Collection("Doctors");
//Ground.Collection(Doctors,'doctors');

Exams = new Mongo.Collection("Exams");
//Ground.Collection(Exams,'exams');

Ranges = new Mongo.Collection("Ranges");
//Ground.Collection(Ranges, 'ranges');

Labpersonal = new Mongo.Collection("Labpersonal");
//Ground.Collection(Labpersonal,'labpersonal');

Labs = new Mongo.Collection("Labs");
//Ground.Collection(Labs,'labs');

Measures = new Mongo.Collection("Measures");
//Ground.Collection(Measures,'measure');

Modules =  new Mongo.Collection("Modules");
//Ground.Collection(Modules,' modules');

Patients = new Mongo.Collection("Patients");
//Ground.Collection(Patients,'patients');

RolesData = Meteor.roles;
//Ground.Collection(RolesData,'roles');

Services = new Mongo.Collection("Services");
//Ground.Collection(Services,'services');

Studies = new Mongo.Collection("Studies");
//Ground.Collection(Studies,'studies');

Reasons = new Mongo.Collection("Reasons");
//Ground.Collection(Reasons,'reasons');

Titles = new Mongo.Collection("Titles");
//Ground.Collection(Titles,'titles');

TypeEvaluation = new Mongo.Collection("TypeEvaluation");
//Ground.Collection(TypeEvaluation,'typeEvaluation');

Users = Meteor.users;
//Ground.Collection(Users,'users');


var imageStore = new FS.Store.GridFS("images");

Images = new FS.Collection("images", {
    stores: [imageStore]
});
