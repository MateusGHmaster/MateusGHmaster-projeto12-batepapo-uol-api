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

function filterUsersMessages (message, participant) {

    if (message.to === 'Todos' || message.from === participant || message.to === participant) {

        return message;

    }

}

app.post('/participants', async (req, res) => {

    const participant = req.body;

    try {

        const isValidParticipant = participantSchema.validate(participant);
        const mongoClient = new MongoClient(process.env.MONGO_URI);
        const participantsCollection = mongoClient.db('bate-papo-uol-chat').collection('participants');
        const messagesCollection = mongoClient.db('bate-papo-uol').collection('messages');

        await mongoClient.connect();
        
        const participantNameInUse = await participantsCollection.findOne({ name: participant.name });

        if (isValidParticipant.error !== null) {

            return res.sendStatus(422);

        }

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
            time: dayjs().format('HH:mm:ss')

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

        const participantsCollection = mongoClient.db('bate-papo-uol-chat').collection('participants');
        const participants = await participantsCollection.find({}).toArray();

        await mongoClient.close();
        res.send(participants);
        console.log('Participants GET => OK!');

    } catch (e) {

        res.sendStatus(500, e);
        ('Participants GET => Não tô me sentindo muito bem, Sr. Stark...');

    }

});

app.post('/messages', async (req, res) => {

    const isValidMessage = messageSchema.validate(message);
    const message = req.body;
    const from = req.headers;

    if (isValidMessage.error) {

        return res.sendStatus(422);

    }

    try {

        const mongoClient = new MongoClient(process.env.MONGO_URI);
        await mongoClient.connect();
        const participantsCollection = mongoClient.db('bate-papo-uol-chat').collection('participants');
        const messagesCollection = mongoClient.db('bate-papo-uol-chat').collection('messages');

        const participantNameInUse = await participantsCollection.findOne({ name: from });

        if (!participantNameInUse) {

            return res.sendStatus(422);

        }

        await messagesCollection.insertOne({

            ...message,
            from,
            time: dayjs().format('HH:mm:ss')

        });

        await mongoClient.close();
        res.sendStatus(201);

    } catch (e) {

        res.sendStatus(500);
        
    }

});

app.get('/messages', async (req, res) => {

    const messagesCap = (req.query.limit);
    const participant = req.headers.user;

    try {

        const mongoClient = new MongoClient(process.env.MONGO_URI);
        await mongoClient.connect();
        
        const messagesCollection = mongoClient.db('bate-papo-uol-chat').collection('messages');
        const messages = await messagesCollection.find({}).toArray(); 

        const usersMessages = messages.filter((message) => {

            filterUsersMessages(message, participant);

        });

        await mongoClient.close();

        if (messagesCap !== null) {
            
            return res.send(usersMessages).slice(-messagesCap);

        }

        res.send(usersMessages);
    
    } catch (e) {

        console.log(e);
        res.sendStatus(500);

    }

});

app.post('/status', async (req, res) => {

    const participant = req.headers.user;

    try {

        const mongoClient = new MongoClient(process.env.MONGO_URI);
        await mongoClient.connect();

        const participantsCollection = mongoClient.db('bate-papo-uol-chat').collection('participants');
        const participantNameInUse = await participantsCollection.findOne({ name: participant });

        if (!participantNameInUse) {

            return res.sendStatus(404);

        }
        
        /* await participantsCollection.updateOne({
    
            _id: participantNameInUse._id
            
        }); */

        await mongoClient.close();
        res.sendStatus(200);

    } catch (e) {

        res.sendStatus(500);

    }

});


app.listen(5000, () => {
    console.log('API running!');
});