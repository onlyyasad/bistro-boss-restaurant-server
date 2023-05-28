const express = require('express');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

const cors = require('cors');

// middleware :
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER, process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pf543tb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const menuCollection = client.db("bistroBossDB").collection("menu");
    const reviewCollection = client.db("bistroBossDB").collection("reviews");
    const cartsCollection = client.db("bistroBossDB").collection("carts");

    app.get('/menu', async(req, res) => {
        const result = await menuCollection.find().toArray();
        res.send(result)
    })
    app.get('/popular', async(req, res) => {
        const query = {category : "popular"};
        const result = await menuCollection.find(query).toArray();
        res.send(result)
    })

    // Cart API :

    // app.get('/carts', async(req, res) =>{
    //   const result = await cartsCollection.find().toArray();
    //   res.send(result)
    // })

    app.get('/carts', async(req, res) =>{
      const email = req.query.email;
      if(!email){
        res.send([]);
      }
      const query = { email: email};
      const result = await cartsCollection.find(query).toArray();
      res.send(result)
    })

    app.post('/carts', async(req, res) =>{
      const item = req.body;
      console.log(item);
      const result = await cartsCollection.insertOne(item);
      res.send(result)
    })

    // Review API :

    app.get('/reviews', async(req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result)
  })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Bistro Boss Server is Running")
})

app.listen(port, () =>{
    console.log(`This server is running in port: ${port}`)
})