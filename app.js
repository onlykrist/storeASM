const express = require('express');
const engines = require('consolidate');
const app = express();

const PORT = process.env.PORT || 3000;
var server=app.listen(PORT,function() {});


var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017";
//npm i handlebars consolidate --save
app.engine('hbs',engines.handlebars);
app.set('views','./views');
app.set('view engine','hbs');

app.get('/',(req,res)=>{
    res.render('index');
})
app.get('/products',async function(req,res){
    let client= await MongoClient.connect(url);
    let dbo = client.db("figureshop");
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
    let inputImage = req.body.txtImage;

    //only enter Character, enter number is error
    // for(let i = 0 ;i<10;i++){
    //     if (inputName.includes(""+i)){
    //         res.render('insertProducts',{nameError:"Only character!",priceError:null,amountError:null})
    //         return false;
    //         }
    //     }
    //ki tu dau la chu, ki tu cuoi la so
    if (typeof inputName[0] !== "string" || isNaN(+inputName[inputName.length-1]))
    {
        return res.render('insertProducts',{nameError:"Ki tu dau la chu, ki tu cuoi la so",priceError:null,amountError:null})
    }

    //trong ten phai co abc
    // if(!inputName.includes('abc')){
    //     res.render('insertProducts',{nameError:"Phai co ki tu abc",priceError:null,amountError:null})
    //     return false;
    // }

    //abc o dau
    // if(inputName[0].toString() !== 'a' || inputName[1].toString() !== 'b' || inputName[2].toString() !== 'c' ){
    // res.render('insertProducts',{nameError:"Phai co ki tu abc",priceError:null,amountError:null})
    // return false;
    // }

    //abc o cuoi
    // if(inputName[inputName.trim().length-1].toString() !== 'c' || inputName[inputName.trim().length-2].toString() !== 'b' || inputName[inputName.trim().length-3].toString() !== 'a'){
    // res.render('insertProducts',{nameError:"Phai co ki tu abc",priceError:null,amountError:null})
    // return false;
    // }

    //neu khong nhap gia tri
    if(inputName.trim().length ==0){  
        res.render('insertProducts',{nameError:"You not input Name!",priceError:null,amountError:null});
    }else{
        //khong duoc nhap chu
        if(isNaN(inputPrice,inputAmount)){
            res.render('insertProducts',{nameError:null,priceError:"Chi duoc nhap so",amountError:"Chi duoc nhap so"});
            return false;
        };
        //khong duoc nhap vao so am
    if(inputPrice < 1 || inputAmount < 1){
        res.render('insertProducts',{nameError:null,priceError:"Gia tri phai lon hon 0", amountError:"Gia tri phai lon hon 0"});
        return false;
    }  
        let newProducts = { name : inputName , size : inputSize , price : inputPrice , amount : inputAmount , image : inputImage};
        let client= await MongoClient.connect(url);
        let dbo = client.db("figureshop");
        await dbo.collection("products").insertOne(newProducts);
        res.redirect('/products');}
})

app.get('/delete',async (req,res)=>{
    let inputId = req.query.id;
    let client= await MongoClient.connect(url);
    let dbo = client.db("figureshop");
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(inputId)};
    await dbo.collection("products").deleteOne(condition);
    res.redirect('/products');

})
app.post('/doSearchProducts',async (req,res)=>{
    let inputName = req.body.txtName;
    let client= await MongoClient.connect(url);
    let dbo = client.db("figureshop");
    let results = await dbo.collection("products").find({name: new RegExp(inputName,"i")}).sort({ Name: -1 }).toArray();
    //let results = await dbo.collection("products").find({}).sort({ Name: -1 }).toArray();
    
    res.render('allProducts',{model:results});
})

app.get('/update',async function(req,res){
    let inputId = req.query.id;
    let client= await MongoClient.connect(url);
    let dbo = client.db("figureshop");
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(inputId)};
    let results = await dbo.collection("products").find(condition).toArray();
    res.render('update',{model:results});
})

app.post('/doupdate',async (req,res)=>{
    let inputId = req.body.id;
    let inputName = req.body.txtName;
    let inputSize = req.body.txtSize;
    let inputPrice = req.body.txtPrice;
    let inputAmount = req.body.txtAmount;
    let inputImage = req.body.txtImage;
    let Change = {$set:
        { name : inputName , size : inputSize , price : inputPrice , amount : inputAmount , image : inputImage}};
    if(inputName.trim().length ==0){
        let modelError ={
                nameError:"You have not entered a Name!",
            };
        res.render('insertProducts',{model:modelError});
    }else{
        if(isNaN(inputPrice,inputAmount)){
            let modelError1 =  {priceError:"Only enter numbers",
                                amountError:"Only enter number"
        };
            res.render('insertProducts',{model:modelError1});
        }
        let client= await MongoClient.connect(url);
        var ObjectID = require('mongodb').ObjectID;
        let condition = {"_id" : ObjectID(inputId)};
        let dbo = client.db("figureshop"); 
        await dbo.collection("products").updateOne(condition,Change);
        res.redirect('/products');
    }
})