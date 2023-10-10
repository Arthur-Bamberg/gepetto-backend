import express from 'express';
import ngrok from 'ngrok';
import dotenv from 'dotenv';
import { AuthenticatorRoute } from './routes/Authenticator.route';
import { UserRoute } from './routes/User.route';
import { SectionRoute } from './routes/Section.route';
import { MessageRoute } from './routes/Message.route';

dotenv.config();

const app = express();
const port = 80;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', AuthenticatorRoute);
app.use('/users', UserRoute);
app.use('/sections', SectionRoute);
app.use('/messages', MessageRoute);

app.listen(port, async () => {
    console.log(`Server it's running on http://localhost:${port}`);

    const url = await ngrok.connect({
        hostname: process.env.NGROK_DOMAIN,
        authtoken: process.env.NGROK_AUTH_TOKEN 
    });
    console.log(`Ngrok tunnel is active at ${url}`);
});
