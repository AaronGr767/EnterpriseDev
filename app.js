const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://aargro:0vNj3412my8EeJz6@enterprisedev.nirrvbi.mongodb.net/lab4_db?retryWrites=true&w=majority";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const express = require('express');
const cookieParser = require('cookie-parser')
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cookieParser())
const PORT = 8080;

let placeHolder;

const productsArray = require("./products.json");

const productSchema = new Schema({
  id: Number,
  title: String,
  description: String,
  price: Number,
  discountPercentage: Number,
  rating: Number,
  stock: Number,
  brand: String,
  category: String,
  thumbnail: String,
  images: [String]
});

const Product = mongoose.model('Product', productSchema);

app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'public', 'styles')));

app.use(express.json());

async function run() {
  await mongoose.connect(uri);

  const productsCount = await Product.countDocuments();

  console.log()

  let lastDoc = await Product.findOne().sort({ id: -1 })

  placeHolder = lastDoc.id

  console.log(lastDoc)

  placeHolder = lastDoc.id

  if (productsCount == 0) {
    console.log(productsArray.products.length)

    for (i = 0; i < productsArray.products.length; i++) {

      let newProduct = new Product({
        id: productsArray.products[i].id,
        title: productsArray.products[i].title,
        description: productsArray.products[i].description,
        price: productsArray.products[i].price,
        discountPercentage: productsArray.products[i].discountPercentage,
        rating: productsArray.products[i].rating,
        stock: productsArray.products[i].stock,
        brand: productsArray.products[i].brand,
        category: productsArray.products[i].category,
        thumbnail: productsArray.products[i].thumbnail,
        images: [productsArray.products[i].images[0], productsArray.products[i].images[1]]
      })

      await newProduct.save();
    }
  }

}
run().catch(console.dir);


//Home page
app.get('/home/:path?/:path?', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//Allow for use of css files
app.get('*.css', (req, res) => {
  res.set('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, 'public', 'styles', req.path));
});

//Allow for use of js files
app.get('*.js', (req, res) => {
  res.set('Content-Type', 'text/javascript');
  res.sendFile(path.join(__dirname, 'public', 'scripts', req.path));
});

//Retrieve all products
app.get('/products', async (req, res) => {

  let productsCollection = await Product.find()

  res.json(productsCollection);
});

// //Retrieve selected colour
app.get('/products/:id', async (req, res) => {

  let selectedProduct = await Product.findOne({ id: req.params.id });

  res.json(selectedProduct)

});


//Delete selected colour
app.delete('/products/:id', async (req, res) => {

  let delProduct = await Product.findOneAndDelete({ id: req.params.id });

  res.json(delProduct)

});

//Update selected colour
app.put('/products/:id', async (req, res) => {

  console.log(req.body)

  let delProduct = await Product.findOneAndUpdate({ id: req.params.id },
    { title: req.body.name, price: req.body.price, brand: req.body.brand, category: req.body.category });

  res.json(delProduct)

});

//Create new colour
app.post('/products', async (req, res) => {

  let tempProd = req.body

  placeHolder++

  tempProd.id = placeHolder

  let newProduct = new Product(tempProd)

  await newProduct.save();

  res.json(newProduct)

});


//Redirect user to correct page
app.get('*', function (req, res) {
  res.status(404).send('Incorrect page! Please follow this <a href="http://localhost:8080/home">link</a>!');
});

process.on('SIGINT', async () => {
  await mongoose.disconnect();
  process.exit(0);
});

app.listen(PORT, (error) => {
  if (!error)
    console.log("Server is Successfully Running, and App is listening on port " + PORT)
  else
    console.log("Error occurred, server can't start", error);
}
)