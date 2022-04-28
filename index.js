import express, { json } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { MongoCLient } from 'mongodb';

const app = express ();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const mongoCLient = new MongoCLient('mongodb://localhost:27017');
let db = null;

const promise = mongoCLient.connect();
promise.then(res  => {
    db = mongoCLient.db('uol_chat');
    console.log("Data base is connected!");
});

db.collection('users').insertOne({
    name: 'testName',
    lestStatus: 55555
});




app.listen(5000, () => {
    console.log('API running!');
});