import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import { MongoClient } from 'mongodb';
import Joi from 'joi';

dotenv.config();

const app = express ();
app.use(cors());
app.use(json());

const participantSchema = Joi.object({

    name: Joi.string().required()

});

const messageSchema = Joi.object({

    to: Joi.string().required(),
    text: Joi.string().required(),
    type: Joi.string().valid('message', 'private_message')

});

function filterUsersMessages (message, participant) {

    if ((message.to === 'Todos') || (message.from === participant) || (message.to === participant)) {
        return true;
    } else {
        return false;
    }

}

app.post('/participants', async (req, res) => {

    const participant = req.body;
    const isValidParticipant = participantSchema.validate(participant);
    
    if (isValidParticipant.error) {

        return res.sendStatus(422);
        
    }

    try {

        const mongoClient = new MongoClient(process.env.MONGO_URI);
        await mongoClient.connect();

        const participantsCollection = mongoClient.db('bate-papo-uol-chat').collection('participants');
        const messagesCollection = mongoClient.db('bate-papo-uol-chat').collection('messages');

        
        const participantNameInUse = await participantsCollection.findOne({ name: participant.name });


        if (participantNameInUse) {

            return res.sendStatus(409);
        
        }

        await participantsCollection.insertOne({

            ...participant,
            lastStatus: Date.now()

        });

        await messagesCollection.insertOne({

            from: participant.name,
            to: 'Todos',
            text: 'Entra na sala...',
            type: 'status',
            time: dayjs().format('HH:mm:ss')

        }); 

        await mongoClient.close();
        res.sendStatus(201);
        console.log('Participants POST => OK!');

    } catch (e) {

        console.log('Participants POST => Não tô me sentindo muito bem, Sr. Stark...');
        res.sendStatus(500);

    }

});

app.get('/participants', async (req, res) => {

    try {

        const mongoClient = new MongoClient(process.env.MONGO_URI);
        await mongoClient.connect();

        const participantsCollection = mongoClient.db('bate-papo-uol-chat').collection('participants');
        const participants = await participantsCollection.find({}).toArray();

        await mongoClient.close();
        console.log('Participants GET => OK!');
        res.send(participants);

    } catch (e) {

        console.log('Participants GET => Não tô me sentindo muito bem, Sr. Stark...');
        res.sendStatus(500, e);

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
        
        await participantsCollection.updateOne({
            
            _id: participantNameInUse._id
        }, {
            $set: {
                lastStatus: Date.now()
            }

        });

        console.log('Status POST => OK!')
        await mongoClient.close();
        res.sendStatus(200);

    } catch (e) {

        console.log('Status POST => Não tô me sentindo muito bem, Sr. Stark...');
        res.sendStatus(500);

    }

});

setInterval(async () => {
    
    try {

        const mongoClient = new MongoClient(processs.env.MONGO_URI);
        await mongoClient.connect();

        const participantsCollection = mongoClient.db('bate-papo-uol-chat').collection('participants');
        const messagesCollection = mongoClient.db('bate-papo-uol-chat').collection('messages');
        const participants = await participantsCollection.find().toArray(); 

        const connectionTimeOut = Date.now() - 10000; 
        
        const AFKusers = participants.filter( async (participant) => {

            if ((AFKusers.length === 0) && (lastStatus < connectionTimeOut)) {

                await mongoClient.close(); 
                console.log('No AFK users!');
                return;

            }
            
        }); 

        await messagesCollection.insertMany(AFKmessage);
        await participantsCollection.deleteMany({ lastStatus: { $lte: connectionTimeOut } });

        const AFKmessage = AFKusers.map(() => {

            return {
                
                from: user.name,
                to: 'Todos',
                text: 'sai da sala...',
                type: 'status',
                time: dayjs().format('HH:mm:ss')

            }

        });

        await mongoClient.close();
        console.log('AFK => OK!');

    } catch (e) {

        console.log('AFK => Não tô me sentindo muito bem, Sr. Stark...');
        return;

    } 

}, 15000);




app.listen(5000, () => {

    console.log('API running!');

});