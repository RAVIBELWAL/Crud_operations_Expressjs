const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/employee',{useNewUrlParser: true,useUnifiedTopology: true  })
var conn=mongoose.connection;

var empSchema=mongoose.Schema({
    name:String,
    email:String,
    etype:String,
    hourlyrate:Number,
    totalhours:Number,
    total:Number,
});

var empModel=mongoose.model('employee',empSchema);
module.exports=empModel;