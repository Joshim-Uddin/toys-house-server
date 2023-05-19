const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json())

app.get('/',(req, res)=>{
    res.send('Server is running')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.x5isz8r.mongodb.net/?retryWrites=true&w=majority`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const toysCollections = client.db('toysData').collection('toys');

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    app.get('/alltoys', async (req, res) => {
        const result = await toysCollections.find().limit(20).toArray();
        res.send(result);
        
    })
    app.get('/alltoys/:text', async (req, res) => {
       const text = req.params.text;
       if(text == 'Regular Car' || text == 'Sports Car' || text == 'Truck'){
        const result = await toysCollections.find({subCategory:text}).toArray();
        res.send(result);
       }else{
        const result = await toysCollections.find().toArray();
        res.send(result);
       }
        
    })

    const result = await toysCollections.createIndex({name: 1})

    app.get('/allname/:text', async (req, res) => {
      const searchText = req.params.text;
        const result = await toysCollections.find({name:{$regex: searchText, $options:'i'}}).toArray();
          res.send(result);
    })
    app.get('/allname/', async (req, res) => {
        const result = await toysCollections.find().toArray();
          res.send(result);
    })

    app.get('/alltoy', async (req, res) => {
      const queryData = req.query.email;
      const query = {email: queryData}
      const result = await toysCollections.find(query).toArray()
      res.send(result)
    })
    
    app.get('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toysCollections.findOne(query)
      res.send(result)
    })
    app.get('/update/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toysCollections.findOne(query)
      res.send(result)
    })

    app.post('/addtoy', async (req, res) => {
        const body = req.body;
        const result = await toysCollections.insertOne(body)
        res.send(result);
    })

    app.put('/update', async (req, res) => {
      const toy = req.body;
      const {price, description, availableQuantity} = toy
      const id = toy.id;
      const filter = { _id: new ObjectId(id) };
      const updateToy = {
        $set: {
          price: price, description: description, availableQuantity: availableQuantity
        },
      };
      const options = {upsert:true}
      const result = await toysCollections.updateOne(filter, updateToy, options);
      res.send(result);
    })

    app.delete('/toy/:id', async(req, res)=>{
      const id = req.params.id;
      const result = await toysCollections.deleteOne({_id: new ObjectId(id)})
      res.send(result);
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


app.listen(port, ()=>{
    console.log(`Server listening on ${port}`)
})