const express = require('express')
const myqsl = require('mysql')
const Sequelize = require('sequelize')
const bodyParser = require("body-parser");
const {google} = require('googleapis');
const base64 = require('js-base64')
const googleAuth = require('google-auth-library');
const axios = require('axios')
const fetch = require('node-fetch')
const cors = require('cors')
require('dotenv').config()

var mysql = require('mysql');
var AWS = require('aws-sdk');
const { AlexaForBusiness } = require('aws-sdk');
const app = express()
app.use(bodyParser.json());
app.use(cors())

//Global vars

let client_id = '343482466427-3v1031oc2291bhnhv30je80u3j0bnia2.apps.googleusercontent.com'
let client_secret = 'wi93xdtW3B1yZ5ltS4gk67iB'
let redirect_uri = 'http://localhost'
let refresh_token = '1//09qp34kY2SHPLCgYIARAAGAkSNwF-L9IrrHXjCQRxPSmS8b8iPGKkaKEfwgFoZdOnEYfCkEmGAAC_1gnpnd1JMgAM8Qhfeq8oCsM'
let access_token = ''
let category = ''

//Email sending 
async function SendEmail(){
  //Email body
  const str = [
    'Content-Type: text/plain; charset="UTF-8"\n',
    'to: turcuiuliana17@gmail.com', '\n',
    'from: turcuiuliana17@gmail.com', '\n',
    'subject: =?utf-8?B?', base64.encode('New ingredient has been added to the list.', true),'?=\n\n',
    "List has been updated"
  ].join('')

  //Encode the email
  const encodedeEmail = base64.encode(str, true);

  //Auth Solution
  
  const oauth2Client  = new googleAuth.OAuth2Client(
    client_id, 
    client_secret,
    redirect_uri
  )
  
 
 //Get new access token
 async function getAccessToken(){
  try{
    let access_token = await axios({
      url:"/token",
      baseURL: "https://oauth2.googleapis.com", 
      method: 'post', 
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: "client_id="+ client_id+ "&client_secret="+client_secret+"&refresh_token=" + refresh_token + "&grant_type=refresh_token"
  })
    
    return access_token.data.access_token
  }catch(e){
    console.warn(e)
  }
 }

 //Authorize the client to send email

 access_token = getAccessToken()

 let credentials = {}
 credentials['refresh_token']=refresh_token
 credentials['access_token']=access_token

 

  oauth2Client.setCredentials(credentials)

  const gmail = google.gmail({version:'v1',auth:oauth2Client})
  const result = await gmail.users.messages.send({
    resource: {
      raw: encodedeEmail
    },
    userId: 'turcuiuliana17@gmail.com'
  })

  return result;
}


async function getIngredientInfo(ingredient){
  try{
    
    let response = await axios.get('https://www.thecocktaildb.com/api/json/v1/1/search.php', {params: {i: ingredient}})
    let description = response.data.ingredients[0].strDescription.substring(0,response.data.ingredients[0].strDescription.indexOf('\r'))
    console.log(description)
    return description

  }catch(e){
    console.warn(e)
  }
}



//connect to db
const sequelize = new Sequelize('products','admin', 'password',{
  host: 'database-2.ckhof527xjwu.us-east-2.rds.amazonaws.com',
  port: 3306,
  dialect: 'mysql',
  define: {
    timestamps: false
  }
})

sequelize.authenticate().then(() => {
  console.log("Connected to database")
}).catch((e) => {
  console.log(e)
  console.log("Unable to connect to database")
})

//create the model for db

const Product = sequelize.define('products',{
  name:{
    type: Sequelize.STRING,
    allowNUll: false,
    require: true
  },
  quantity:{
    type: Sequelize.INTEGER,
    allowNull: false,
    require: true

  },
  price:{
    type: Sequelize.FLOAT,
    allowNull: false,
    require: true

  },
  description:{
    type: Sequelize.STRING,
    allowNUll: false,
    require: true
  }
})

//Make sure schema is created

app.get('/createdb', (request, response) => {
  sequelize.sync({force:true}).then(() => {
      response.status(200).send('tables created')
  }).catch((e) => {
      console.log(e)
      response.status(200).send('could not create tables')
  })
})

//Get accesstoken

app.get("/accesstoken", async (req,res)=>{
  try{
    let access_token = await axios({
      url:"/token",
      baseURL: "https://oauth2.googleapis.com", 
      method: 'post', 
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: "client_id="+ client_id+ "&client_secret="+client_secret+"&refresh_token=" + refresh_token + "&grant_type=refresh_token"
  })
    console.log(access_token.data.access_token)
    return access_token.data.access_token
  }catch(e){
    console.warn(e);
    res.status(500).json({ message: "Could not send email" });
  }
})
//Email

app.get('/email', (req, res)=>{
  try{
    SendEmail()
    res.status(200).json({message: 'Email has been sent'})
  }catch(e){
    console.warn(e);
    res.status(500).json({ message: "Could not send email" });
  }
  
})



//Web API Call
app.post('/cocktail', async (req,res)=>{
  try{
    
    console.log(req.body.name)
    let description = await getIngredientInfo(req.body.name)
    
    res.status(200).json(description)
  }catch(e){
    console.warn(e);
    res.status(500).json({ message: "Could not retrieve data" });
  }
})



//CRUD
app.get('/products', async(req, res)=>{
  try{
    let products = await Product.findAll();
    res.status(200).json(products)
  }catch(e){
    console.warn(e);
    res.status(500).json({ message: "Could not retrieve data" });

  }
})

app.post('/products', async(req,res)=>{
  try{
    let description = await getIngredientInfo(req.body.name)
    
    const product = {
      name: req.body.name,
      quantity: req.body.quantity,
      price: req.body.price,
      description: description
    }
    
    await Product.create(product)
    SendEmail()
    res.status(201).json({ message: "Product " + product.name + " was created" });
  }catch(e){
    console.warn(e);
    res.status(500).json({ message: "Could not create new product" });

  } 
})

app.put('/products/:name', async(req, res)=>{
  try{
    let product = await Product.findOne({where: {name: req.params.name}})
    if(product){
      await product.update(req.body);
      res.status(202).json({ message: "Product " + req.params.name + " was updated" });
    }
  }catch(e){
    console.warn(e);
    res.status(500).json({ message: "Could not update product" });

  }
})


app.delete('/products/:name', async (req,res)=>{
  try {
    let product = await Product.findOne({where: {name: req.params.name}});
    if (product) {
      await product.destroy();
      email_params.Message.Body.Html.Data = "Product " + req.params.name + " was deleted"
  
      
      res.status(200).json({ message: "Product " + req.params.name + " was deleted" });
    } else {
      res.status(200).json({ message: "Product " + req.params.name + " was not found" });
    }
  } catch (e) {
    console.warn(e);
    res.status(500).json({ message: "Could not delete product record" });
  }

})

//app.use("/", express.static("../frontend"))








app.listen(8080, ()=>{
    console.log("Server started at 8080")
})