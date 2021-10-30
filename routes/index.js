//--files need -----------
var express = require('express');                   // for all express funtions
const empModel = require('../modules/employee')   //db schema n defination export
const multer=require('multer');                   // for file uploding
var path=require('path');                         // for file complete name 
const uploadModel = require('../modules/upload');   //db schema n defination export
const jwt=require('jsonwebtoken') // for token

var router = express.Router();                      // taking all funtions in router variable
//--- variable of schema from db quering-------
var employee = empModel.find({});
var imgdb = uploadModel.find({});

//--informing router to use static files from public folder----
router.use(express.static(__dirname+"./public/"));

//----node-localStorage initilization to store tocken------
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

//----middleware funtion for token varification for login------
function checklogin(req,res,next){
var myToken=localStorage.getItem('myToken')
try{
jwt.verify(myToken,'loginToken')
}
catch(err){
res.send('You are not Authorized !!!.')
}
next()
} 

////upload image we'll require a temp. storage and a funtion to store on disk here multer comes into play
var Storage= multer.diskStorage({
  destination:"./public/uploads/",
  filename:(req,file,cb)=>{
    cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname)); //field name means element name
  }
});
///--part of above multer to work as middleware
var upload = multer({
  storage:Storage
}).single('file'); //element name in input file

//--------------____________router_____________---------------

//---------router to see uplode image/file-------
router.get('/upload',checklogin,function(req,res,next) {
  imgdb.exec(function(err,data){
    if(err)throw err
  var success="";
  res.render('uploadf',{title:'Uploaded File',records:data,success:success});
  })
})

//---------- router to uplode file from form post------

router.post('/upload',upload,function(req,res,next) {
  var imagefile=req.file.filename;               //storing name of file 
  var t=req.body.t;
  t=t.toLowerCase()
  var img=new uploadModel({                      // variable of insert into db using schemaModel in mongoose
    imagedetail:imagefile,                      // variable to store as json format
    t:t
  });
  img.save(function(err,res2){                    //save data to insert successfully
    if(err)throw err                               // if insertion unsuccess full trow err
    imgdb.exec(function(err,data){                  // show after insertion all as said in imgdb
      if(err)throw err
    var success=req.file.filename+" uploaded successfully";           // var for success message
    res.render('uploadf',{title:'Upload File',records:data, success:success});    //ejs render variables n data for uplodef.html
    })
    
  })
 
})

//------------------------router to root-----------

router.get('/',checklogin,function (req, res, next) {
  employee.exec(function (err, data) {
    if (err) throw err;
    res.render('index', { title: 'Employee Records', records: data, success: ""});
  });
});

//------------------------router post to root to save from data-------------

router.post('/', function (req, res, next) {
  var empdata = new empModel({
    name: req.body.ename,
    email: req.body.email,
    etype: req.body.etype,
    hourlyrate: req.body.hourlyrate,
    totalhours: req.body.totalhours,
    total: req.body.totalhours * req.body.hourlyrate,
  });
  empdata.save(function (err, res1) {
    employee.exec(function (err, data) {
      if (err) throw err;
      res.render('index', { title: 'Employee Records', records: data, success: 'Record Inserted Successfully' });
    });
  });
}) //post

//------------router to search post data------------
router.post('/search/', function (req, res, next) {
  var fname = req.body.ename;
  var femail = req.body.email;
  var fetype = req.body.etype;

  if (fname != "" && femail != "" && fetype != "") {
    var filterParameter = { $and: [{ name: fname }, { $and: [{ email: femail }, { etype: fetype }] }] }
  }
  else if (fname == "" && femail != "" && fetype != "") {
    var filterParameter = { $and: [{ email: femail }, { etype: fetype }] }
  }
  else if (fname != "" && femail == "" && fetype != "") {
    var filterParameter = { $and: [{ name: fname }, { etype: fetype }] }
  }

  else if (fname == "" && femail == "" && fetype != "") {
    var filterParameter = { etype: fetype }
  }

  else { var filterParameter = {} }

  console.log(fname + " : " + femail + " : " + fetype)
  var employeefilter = empModel.find(filterParameter);
  employeefilter.exec(function (err, data) {
    if (err) throw err;
    res.render("index", { title: 'Employee Records', records: data, success: "" })
  })
})

//---------roter to delete with parameter---------------
router.get('/deli/:id', function (req, res, next) {
  var id = req.params.id
  var del = empModel.findByIdAndDelete(id)

  del.exec(function (err) {
    if (err) throw err;
    employee.exec(function (err, data) {
      if (err) throw err;
      res.render('index', { title: 'Employee Records', records: data, success: 'Record Deleted Successfully' });
    });
  })
})


//---------roter to Update form with parameter---------------
router.get('/edi/:id', function (req, res, next) {
  var id = req.params.id
  var del = empModel.findById(id)

  del.exec(function (err, data) {
    if (err) throw err;
    res.render('edit', { records: data })
  })
})


//---------roter to Update and insert data to db---------------
router.post('/update/', function (req, res, next) {
  var id = req.body.id
  var empUpdate = empModel.findByIdAndUpdate(id, {
    name: req.body.ename,
    email: req.body.email,
    etype: req.body.etype,
    hourlyrate: req.body.hourlyrate,
    totalhours: req.body.totalhours,
    total: req.body.totalhours * req.body.hourlyrate,
  });
  console.log(empUpdate)
  empUpdate.exec(function (err, data) {
    if (err) throw err;
    employee.exec(function (err, data) {
      if (err) throw err;
      res.render('index', { title: 'Employee Records', records: data, success: 'Record Updated Successfully' });
    });
  });
});


router.get('/login',function(req,res){
 var token=jwt.sign({id:'demoidabc'},'loginToken')
 localStorage.setItem('myToken',token)
 res.redirect('/')

})


router.get('/logout',function(req,res){
  if(localStorage.getItem('myToken'))
  {
  localStorage.removeItem('myToken')
  res.send('Logout Successfully')}
  else{res.send('You were not login .. Unauthorized Request')}
})

module.exports = router;