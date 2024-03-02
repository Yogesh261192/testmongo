const express= require('express');
let app= express();
const PORT= process.env.PORT || 3000;
var bodyParser = require('body-parser')

const { MongoClient, ServerApiVersion } = require('mongodb');

const credentials = 'mongo.pem'
app.use(bodyParser.urlencoded({ extended: true }))

const client = new MongoClient('mongodb+srv://cluster0.xww2tze.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&appName=Cluster0', {
  tlsCertificateKeyFile: credentials,
  serverApi: ServerApiVersion.v1
});

async function run(term) {
    let arr= []

  try {
    // const adminDb = client.db().admin();
    // const databases = await adminDb.listDatabases();
    // console.log(databases.databases)
    // const curDb = client.db('sample_mflix');
    // const collections = await curDb.listCollections().toArray();
    // console.log("Collections in sample_mflix database:");
    // collections.forEach(collection => {
    //   console.log(collection.name);
    // });
    // console.log(client.db().collection().find({title:'the'}))
    let curDb= client.db('sample_mflix').collection('movies');

    // const documents = await curDb.find({ title: 'Traffic in Souls' }).toArray();
    // console.log(`Documents where 'tittel' matches '${keyword}':`);
    const keyword = term;

    // Create a regular expression to match titles containing the keyword
    const regex = new RegExp(`\\b${keyword}\\b`, 'i'); // '\\b' for word boundary, 'i' flag for case-insensitive matching
    console.log(regex)
    // Find documents where the 'title' field matches the regex
    const documents = await curDb.find({ title: regex }).limit(20).sort({year:-1}).toArray();
    for(x of documents){
        arr.push(x)
    }

    console.log(arr);

    // await client.close();

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
  return arr
}
// run('night')

app.get('/getallmovies', async (req,res)=>{
    let key= req.query;
    console.log(key)
    try {
        let a= await run(key.name);
    res.send({error:false, data:{result:a}})
    } catch (error) {
        res.send({error:true, message:'req time out'})
    }
    // console.log(req)
    
})

app.listen(PORT,()=>{
    console.log('running ' + PORT)
})