const express = require('express');
const engines = require('consolidate');
const app = express();

const PORT = process.env.PORT || 5000;
var server=app.listen(PORT,function() {});


var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://tuandz123:3O6AaLvx8mcA0PLL@cluster0.v7dmx.mongodb.net/mystore";
//npm i handlebars consolidate --save
app.engine('hbs',engines.handlebars);
app.set('views','./views');
app.set('view engine','hbs');

app.get('/',(req,res)=>{
    res.render('index');
})
app.get('/products',async function(req,res){
    let client= await MongoClient.connect(url);
    let dbo = client.db("mystore");
    let results = await dbo.collection("products").find({}).toArray();
    res.render('allProducts',{model:results});
})

app.get('/insertProducts',(req,res)=>{
    res.render('insertProducts');
})

app.post('/doInsertProducts',async (req,res)=>{
    let inputName = req.body.txtName;
    let inputSize = req.body.txtSize;
    let inputPrice = req.body.txtPrice;
    let inputAmount = req.body.txtAmount;
    let newProducts = { name : inputName , size : inputSize , price :inputPrice,amount : inputAmount};
    let client= await MongoClient.connect(url);
    let dbo = client.db("mystore");
    await dbo.collection("products").insertOne(newProducts);
    res.redirect('/products');
})

app.get('/delete',async (req,res)=>{
    let inputId = req.query.id;
    let client= await MongoClient.connect(url);
    let dbo = client.db("mystore");
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(inputId)};
    await dbo.collection("products").deleteOne(condition);
    res.redirect('/products');

})
app.post('/doSearchProducts',async (req,res)=>{
    let inputName = req.body.txtName;
    let client= await MongoClient.connect(url);
    let dbo = client.db("mystore");
    let results = await dbo.collection("products").find({name: new RegExp(inputName,'i')}).toArray();
    
    res.render('allProducts',{model:results});

})

app.get('/update',async function(req,res){
    let inputId = req.query.id;
    let client= await MongoClient.connect(url);
    let dbo = client.db("mystore");
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(inputId)};
    let results = await dbo.collection("products").find(condition).toArray();
    res.render('update',{model:results});
})

app.post('/doupdate',async (req,res)=>{
    let inputId = req.body.txtId;
    let inputName = req.body.txtName;
    let inputSize = req.body.txtSize;
    let inputPrice = req.body.txtPrice;
    let inputAmount = req.body.txtAmount;
    let Change = {$set:{name : inputName , size : inputSize , price :inputPrice,amount : inputAmount}};
    let client= await MongoClient.connect(url);
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(inputId)};
    let dbo = client.db("mystore"); 
    await dbo.collection("products").updateMany(condition,Change);
    res.redirect('/products');
})  