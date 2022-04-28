import express, { json } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import * as chalk from 'chalk';

const app = express ();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const mongoClient = new MongoClient("mongodb://localhost:2707");
let database = null;

mongoClient.connect().then(() => {
    database = mongoClient.db('uol_chat');
    console.log("Database is connected!");
}).catch(() => {
    console.log('Database connection error!');
});



app.listen(5000, () => {
    console.log('API running!');
});