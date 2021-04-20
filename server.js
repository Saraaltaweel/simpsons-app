'use strict'
// Application Dependencies
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');
const cors = require('cors');
// const  static  = require('express');

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 4000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({extend:true}))
// Specify a directory for static resources
app.use(express.static('./public'))
// define our method-override reference
app.use(methodOverride('method-override'))
// Set the view engine for server-side templating
app.set('view engine', 'ejs')
// Use app cors


// Database Setup
const DATABASE_URL=process.env.DATABASE_URL;
const client = new pg.Client(process.env.DATABASE_URL);
// app routes here
// -- WRITE YOUR ROUTES HERE --
app.get('/',renderHome)
app.post('/addFav',favButton)
app.get('/addFav',favPage)
app.get('/favorite-quotes/:quote_id', detailPage)
app.delete('/delete/:quote_id',deletQoute)
app.put('/update/:quote_id', updateQoute)

// callback functions
// -- WRITE YOUR CALLBACK FUNCTIONS FOR THE ROUTES HERE --
function renderHome(req,res){
    const url='https://thesimpsonsquoteapi.glitch.me/quotes?count=10';
    superagent.get(url).set('User-Agent', '1.0').then(result=>{
        res.render('pages/index',{results:result.body})
    })

}

function favButton(req,res){
    const {quote , character, image, characterDirection}=req.body;
    const sql='INSERT INTO qoutes(quote , character, image, characterDirection) VALUES($1,$2,$3,$4);';
    const values=[quote , character, image, characterDirection]
    client.query(sql,values).then(()=>{
        res.redirect('/addFav')
    })
}

function favPage(req,res){
    const sql='SELECT * FROM qoutes;';
    client.query(sql).then(result=>{
        res.redirect('pages/fav',{results:result.rows})
    })
}

function detailPage(req,res){
    const quote_id=req.params.quote_id;
    const sql= 'INSERT INTO qoutes (quote , character, image, characterDirection) VALUES($1,$2,$3,$4);';
    const value=[quote_id];
    client.query(sql,value).then(result=>{
        res.redirect('pages/detail',{results:result.rows})
    })
}

function deletQoute(req,res){
    const quote_id=req.params.quote_id;
    const sql= 'DELETE FROM qoutes WHERE id=$1;';
    const value=[quote_id];
    client.query(sql,value).then(()=>{
        res.redirect('/addFav')
    })
}

function updateQoute(req,res){
    const quote_id=req.params.quote_id;
    const {quote , character, image, characterDirection}=req.body;
    const sql= 'UPDATE qoutes SET quote=$1 , character=$2, image=$3, characterDirection=$4 WHERE id=$5';
    const value=[quote , character, image, characterDirection,quote_id];
    client.query(sql,value).then(()=>{
        res.redirect(`/update/${quote_id}`)
    })
}

// helper functions

// app start point
client.connect().then(() =>
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
);
