//Connecting external modules
const express = require("express")
const app = express()
const bodyParser = require('body-parser')
const ObjectID = require('mongodb').ObjectId;

//Connecting application modules
const db_module = require("./db.js")
const post_validation = require("./validation.js")

//Service variables init
const PORT = 3001;
let db = null;
const db_filter = {projection:{_id:0,title:1, main_photo:1, price:1}}

//bobyParser connect and settings
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

/* Simple parser error handler
* In case of invalid json in request body */
app.use(function(err, req, res, next) {
    console.error(`Error! Status: ${err.status}`)
    res.status(400).send('An error has occurred. Possibly invalid request body')
})

/* Start server and get database */
function serverStart(){
    app.listen(PORT, async () => {
        console.log(`Server app listening on port ${PORT}...`)
            
        db = db_module.getDb()
        //Getting a link to the database
    })
}
/* Method returning the total number of posts and pages in the DB */
async function getBaseInfo(){
    let count = await db.find({}).count();
    return {
        "total posts count": count,
        "total pages count": Math.ceil(count/10)
    }
}
/* Сonnect to the database. If successful, start the server. Otherwise, display an error */
db_module.connect().then(serverStart).catch((err) => console.log(`Server start error: ${err}`))

/* ------------------------------------------------------------------------ */
/* Implementation method for obtaining basic information about publications */
/* ------------------------------------------------------------------------ */
app.get('/api/info', async (req, res) => {
    res.status(200).json({
        "info": await getBaseInfo()
    });
});

/* -------------------------------------------------------------------- */
/* Implementation method for getting a page with a list of publications */
/* -------------------------------------------------------------------- */
app.get('/api/page/:page', async (req, res) => {
    
    let info = await getBaseInfo();
    let page = Number(req.params.page);
    
    //Checking if the page value is correct
    if (!(isNaN(page)) && Number.isInteger(page) && page > 0){
        
        //Does the value go beyond the total number of pages
        if(page > info["total pages count"]){
            res.status(404).json({
                "status": "error!",
                "message": `Page ${page} is no found! Base has ${info["total pages count"]} pages`,
                "info": info
            });
        }
        else {
            //Checking for query parameters
            if (Object.keys(req.query).length == 0){
                let data = await db.find({},db_filter).limit(10).skip((page*10-10)).toArray()
                res.status(200).json({
                    "response": "give page",
                    "posts count": data.length,
                    "page": page,
                    "data": data,
                    "info": info
                });
            }
            else {
                //Checking for the Existence of Required Parameters
                if("sort" in req.query && "direction" in req.query){
                    
                    //Validation of parameters values
                    if((req.query.sort == "price" || req.query.sort == "date")
                    && (req.query.direction == "up" || req.query.direction == "down")){
                        
                        const {sort, direction} = req.query;
                        let sort_key = {};
                        
                        //Generating a sort key for a database
                        direction == "up" ? sort_key[sort] = 1 : sort_key[sort] = -1;
                        
                        let data = await db.find({}, db_filter).limit(10).skip((page*10-10)).sort(sort_key).toArray();
                        res.status(200).json({
                            "status": "give sort page",
                            "posts count": data.length,
                            "sort": `${sort} ${direction}`,
                            "page": page,
                            "data": data,
                            "info": info
                        })
                    }
                    //Validation of parameters values ELSE
                    else {
                        res.status(400).json({
                            "status": "invalid request",
                            "message": "invalid query parameters values"
                        })
                    }
                }
                //Checking for the Existence of Required Parameters ELSE
                else { 
                    console.log('dont valid query');
                    res.status(400).json({
                        "status": "Bad request",
                        "message": `Invalid query parameters`
                    })
                }
            }
        }
    }
    //Checking if the page value is correct ELSE
    else {
        res.status(400).send(`"${req.params.page}" dont valid "page" value`);
    }
})

/* ------------------------------------------------------- */
/* Implementation method of request Create new publication */
/* ------------------------------------------------------- */
app.post('/api/create', async (req, res) => {
    let obj = req.body
    
    //Request body validation with an module "./validation.js"
    let status = post_validation(obj)
    console.log(status)
    
    //Check validation status
    if(status.status === true){
        
        //Adding service fields to publication
        obj.date = new Date();
        obj.main_photo = obj.photo_links[0];
        
        //Adding a post to the database
        await db.insertOne(obj, (err, inserted) => {
            if(err){
                console.log(err);
                res.status(500).json({
                    "status": "Error",
                    "message": "Database insert erroor"
                })
            }
            else {
                console.log(`Add new post. id: ${inserted.insertedId}`);
                res.status(200).json({
                    "status": "Publication created successfully",
                    "id": inserted.insertedId 
                })
            }
        })
    }
    //If validation status false
    else {
        res.status(400).json({
            "status": "reject",
            "message": status.message
        })
    }
})     

/* ---------------------------------------------------------------------------- */
/* Implementation of processing a request to receive a single publication by id */
/* ---------------------------------------------------------------------------- */
app.get('/api/one/:id', async (req, res) => {
    
    let filter = {};
    let id;
    
    //Validation id value
    try {
        id = ObjectID(req.params.id);
    } catch(err){
        return res.status(400).send(`Invalid ObjectId`);
    }
    
    //If fields exist and are not empty
    if("fields" in req.query && req.query.fields != ""){
        
        let fields = req.query.fields;
        
        //Forming a field filter
        if(Array.isArray(fields)){
            filter.projection = giveFieldsFromArray(fields);
        }
        else {
            filter.projection = giveFields(fields);
        }
        //
        //Find publication
        await db.findOne({_id: id}, filter, (err, data) => {
            if(err){
                console.log(err)
                res.status(500).send(`Database error ${err}`)
            }
            else {
                //Send post if it exists
                if(data != null){
                    res.status(200).send(data);
                }
                else { //Or send error
                    res.status(404).send(`Nothing found since id: ${id}`)
                }
            }
        });
    }
    //If fields no exits or incorrect
    else {
        //Find publication
        await db.findOne({_id: id}, db_filter,(err, data) => {
            if(err){
                console.log(err);
                res.status(500).send(`Database error ${err}`);
            }
            else {
                //Send post if it exists
                if(data != null){
                    res.status(200).send(data);
                }                
                else { //Or send error
                    res.status(404).send(`Nothing found since id: ${id}`);
                }
            }
        });
        
    }
})

/* Functions for generating additional fields in a publication request */
function giveFieldsFromArray(fields){
    let projection = {_id:0,title:1, main_photo:1, price:1};
    
    if(fields.indexOf("description") != -1) projection.description = 1;
    if(fields.indexOf("photo_links") != -1) projection.photo_links = 1;
   
    return projection;
}

function giveFields(field){
    let projection = {_id:0,title:1, main_photo:1, price:1};
    
    if(field == "description") projection.description = 1;
    if(field == "photo_links") projection.photo_links = 1;
    
    return projection;
}
