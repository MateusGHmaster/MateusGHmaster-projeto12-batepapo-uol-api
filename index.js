import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express ();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.listen(5000, () => {
    console.log('API running!');
})