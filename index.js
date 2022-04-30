import express, { json } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';

const app = express ();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const participantSchema = joi.object({
    name: joi.string().required()
});
const messageSchema = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().valid('message', 'private_message')
});

app.post('/participants', async (req, res) => {

    const participant = req.body;

    try {

        const mongoClient = new MongoClient(process.env.MONGO_URI);
        const participantsCollection = mongoClient.db('bate-papo-uol').collection('participants');
        const messagesCollection = mongoClient.db('bate-papo-uol').collection('messages');

        await mongoClient.connect();
        
        const participantNameInUse = await participantsCollection.findOne({ name: participant.name });

        if (participantNameInUse !== null) {

            return res.sendStatus(409);
        
        }

        participantsCollection.insertOne({

            ...participant,
            lastStatus: Date.now 

        });

        messagesCollection.insertOne({

            from: participant.name,
            to: 'Todos',
            text: 'Entra na sala...',
            type: 'status',
            time: dayjs()

        }); 

        mongoClient.close();
        res.sendStatus(201);
        console.log('Participants POST => OK!');

    } catch (e) {

        res.sendStatus(500);
        console.log('Participants POST => Não tô me sentindo muito bem, Sr. Stark...');

    }

});

app.get('/participants', async (req, res) => {

    try {

        const mongoClient = new MongoClient(process.env.MONGO_URI);
        await mongoClient.connect();

        const participantsCollection = mongoClient.db('bate-papo-uol').collection('participants');
        const participants = await participantsCollection.find({}).toArray();

        await mongoClient.close();
        res.send(participants);
        console.log('Participants GET => OK!');

    } catch (e) {

        res.sendStatus(500, e);
        ('Participants GET => Não tô me sentindo muito bem, Sr. Stark...');

    }

});



app.listen(5000, () => {
    console.log('API running!');
});