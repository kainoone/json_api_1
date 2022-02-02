const { MongoClient } = require('mongodb');
// import { MongoClient } from 'mongodb'

// Connection URL
const url = 'mongodb+srv://root:mongodb@cluster0.8ozyy.mongodb.net/';
const db_name = 'kaitestdb';
const collection_name = 'publications_test';
const client = new MongoClient(url);

var db = null;

//Connect to database server method
async function connectDb() {
    try {
        await client.connect();
        console.log('Connected successfully to server');
        db = client.db(db_name).collection(collection_name);
    }catch(err){
        console.log(`Error connecting to database: ${err}`);
        throw 'Database error';
    }
}

//The function to get a link to the database
function getDb(){
    return db;
}

//Export modules
module.exports.connect = connectDb;
module.exports.getDb = getDb;