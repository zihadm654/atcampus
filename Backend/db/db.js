require('dotenv').config();

const mongodb=require("mongodb")

const MongoClient=mongodb.MongoClient;


const url=process.env.URL_DATABASE;

let _db;
// initail data base 

const initDb=callback=>{
    if(_db){
        console.log("DataBase is  already initialized");
        return callback(null,_db)
    }
   MongoClient.connect(url).then(client=>{
    _db=client;
    callback(null,_db)
   })
}

const getDb=()=>{
    if(!_db){
        throw Error('Database not initialzed')
    }
    return _db
}

module.exports={initDb,getDb}