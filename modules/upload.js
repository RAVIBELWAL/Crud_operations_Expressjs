const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/employee',{useNewUrlParser: true,useUnifiedTopology: true  })
var conn=mongoose.connection;

var uploadSchema=mongoose.Schema({
    imagedetail:String,
    t:String
});

var uploadModel=mongoose.model('uploadimg',uploadSchema); //uploadimg is name of the table
module.exports=uploadModel;