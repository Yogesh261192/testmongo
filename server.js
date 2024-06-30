const express= require('express');
let app= express();
const PORT= process.env.PORT || 3000;
var bodyParser = require('body-parser')
const path= require('path')
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');

const { v4: uuidv4 } = require('uuid');  
const { MongoClient, ServerApiVersion } = require('mongodb');

const credentials = 'mongo-2.pem'
app.use(bodyParser.urlencoded({ extended: true }))

const client = new MongoClient('mongodb+srv://cluster0.xww2tze.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&appName=Cluster0', {
  tlsCertificateKeyFile: credentials,
  serverApi: ServerApiVersion.v1
});
const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage: storage });

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
    await client.connect();
    let curDb= client.db('sample_mflix').collection('movies');

    const documents2 = await curDb.find({ title: 'Traffic in Souls' }).toArray();
    console.log(`Documents where 'tittel' matches '${documents2}':`);
    const keyword = term;

    // Create a regular expression to match titles containing the keyword
    const regex = new RegExp(keyword, 'i'); // '\\b' for word boundary, 'i' flag for case-insensitive matching
    console.log(regex)
    
    // Find documents where the 'title' field matches the regex
    const documents = await curDb.find( { 'title' : regex }  ).limit(20).sort({year:-1}).toArray();
    console.log(documents, '')
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
app.post('/updateMovies', upload.single('csvFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error: true, message: 'No file uploaded' });
  }

  try {
    await client.connect(); // Ensure the client is connected
    const curDb = client.db('sample_mflix').collection('movies');

    const results = [];
    req.file.buffer.toString().split('\n').forEach(line => {
      const [id, plot, genres, runtime, cast, num_mflix_comments, poster, title, fullplot, languages, released, directors, writers, awards_wins, awards_nominations, awards_text, lastupdated, year, imdb_rating, imdb_votes, imdb_id, countries, type] = line.split(',');
console.log(line, 'addd')
      results.push({
        _id: uuidv4(),
        plot: plot,
        genres: genres.split('|'),
        runtime: parseInt(runtime, 10),
        cast: cast.split('|'),
        num_mflix_comments: parseInt(num_mflix_comments, 10),
        poster: poster,
        title: title,
        fullplot: fullplot,
        languages: languages.split('|'),
        released: parseInt(released, 10),
        directors: directors.split('|'),
        writers: writers.split('|'),
        awards: {
          wins: parseInt(awards_wins, 10),
          nominations: parseInt(awards_nominations, 10),
          text: awards_text
        },
        lastupdated: lastupdated,
        year: parseInt(year, 10),
        imdb: {
          rating: parseFloat(imdb_rating),
          votes: parseInt(imdb_votes, 10),
          id: parseInt(imdb_id, 10)
        },
        countries: countries.split('|'),
        type: type
      });
    });
    console.log(results, 'results')
    // Update MongoDB with the CSV data
    const updatePromises = results.map((row, i) =>{
    if(i>0){
      curDb.updateOne(
        { _id: row._id },
        { $set: row },
        { upsert: true } // Update existing documents or insert new ones
      )
    }
  }
    );
    await Promise.all(updatePromises);

    res.send({ error: false, message: 'CSV data uploaded and database updated' });
  } catch (error) {
    console.error('Error occurred while processing the CSV file:', error);
    res.status(500).send({ error: true, message: 'Error processing the CSV file', details: error.message });
  } finally {
    // await client.close(); // Ensure the client will close
  }
});
app.get('/getallmovies', async (req,res)=>{
    let key= req.query;
    console.log(key)
    try {
        let a= await run(key.name);
    res.send({error:false, data:{result:a}})
    } catch (error) {
      console.log(error)
        res.send({error:true, message:'req time out'})
    }
    // console.log(req)
    
})
app.get('/update', async(req,res)=>{
 
  res.sendFile(path.join(__dirname, 'update.html'))

})



app.listen(PORT,()=>{
    console.log('running ' + PORT)
})
