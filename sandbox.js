/* eslint-disable no-console, no-process-exit */
const imdb = require('./src/imdb');
const DENZEL_IMDB_ID = 'nm0000243';
const jsonfile=require('jsonfile');
const fs=require('fs');
const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

const CONNECTION_URL = "mongodb+srv://MaxenceCLZ:ERqdOOysDKMcjpcF@maxenceclz-jk1fy.mongodb.net/test?retryWrites=true";
const DATABASE_NAME="MaxenceCLZ";
const COLLECTION_NAME="movie";
var database, collection;

var app = Express();
// CONNECT TO MONGO DATABASE
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("COLLECTION_NAME");
        console.log("Connected to `" + DATABASE_NAME + "`!");
        sandbox(DENZEL_IMDB_ID,collection,client);
         });

//GET QUERIES

app.get('/movies/:id', (request, response)=>{
    collection.findOne({'id': request.params.id},(err, result)=>{
      if(err) return response.sendStatus(500).send(err);      
      response.send(result);
    });
  })

  app.get("/movies/search", (request, response) => {
    req=request.query;
    var metascore=parseInt(req.metascore)
    var limit=parseInt(req.limit)
    console.log(req.limit);
    collection.find({"metascore":{$gte:metascore}}).limit(limit).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});

app.get("/movies", (request, response) => {

    collection.aggregate([
            { $match: { metascore: { $gte: 70 } } },
            { $sample: { size: 1 } }
        ]).toArray((err, result) => {
            if (err)return response.status(500).send(err);
            response.send(result);
        });
});

app.post('/movies/:id', (request, response)=>{
  collection.updateOne({'id': request.params.id}, {$set:{date : request.body.date, review : request.body.review}}, (err, result)=>{
    if(err) return response.sendStatus(500).send(err);
    response.send(result);
  });
})
async function sandbox (actor) {
  try {

    console.log(`📽️  fetching filmography of ${actor}...`);
    const movies = await imdb(actor);
    //const awesome = movies.filter(movie => movie.metascore >= 70);

   // console.log(`🍿 ${movies.length} movies found.`);
    //console.log(JSON.stringify(movies, null, 2));
    //fs.writeFileSync('movies.txt', JSON.stringify(movies,null,2));
    //console.log(`🥇 ${awesome.length} awesome movies found.`);
    //console.log(JSON.stringify(awesome, null, 2));
    //fs.writeFileSync('awesome_movies.txt', JSON.stringify(movies,null,2));
    collection.insertMany(movies, function (err, doc) {
      if (err) throw err;
      else console.log("Movies imported");
    });
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
   
}
app.listen(9292);

//fs.writeFileSync('movies.txt', JSON.stringify())