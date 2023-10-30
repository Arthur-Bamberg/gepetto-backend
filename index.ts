import express from 'express';
import ngrok from 'ngrok';
import dotenv from 'dotenv';
import { AuthenticatorRoute } from './routes/Authenticator.route';
import { UserRoute } from './routes/User.route';
import { SectionRoute } from './routes/Section.route';
import { MessageRoute } from './routes/Message.route';
import { EmailSenderRoute } from './routes/EmailSender.route';
import cluster from 'cluster';
import { cpus } from 'os';

const numCPUs = cpus().length;

if(cluster.isPrimary) {
    for(let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
        cluster.fork();
    });

    (async ()=> {
        const url = await ngrok.connect({
            hostname: process.env.NGROK_DOMAIN,
            authtoken: process.env.NGROK_AUTH_TOKEN
        });
        console.log(`Ngrok tunnel is active at ${url}`);
    })();

} else {
    dotenv.config();

    const app = express();
    const port = 80;
    
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    app.use('/auth', AuthenticatorRoute);
    app.use('/users', UserRoute);
    app.use('/sections', SectionRoute);
    app.use('/messages', MessageRoute);
    app.use('/send-email', EmailSenderRoute);

    app.use('/change-password/:changePasswordId', express.static(__dirname + '/change-password'));

    app.use('/', express.static(__dirname + '/privacy-policy'));
    
    app.listen(port, () => {
        console.log(`Server it's running on http://localhost:${port} with ${process.pid} process id`);
    });
}
