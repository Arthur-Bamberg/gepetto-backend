import express from 'express';
import { AuthenticatorRoute } from './routes/Authenticator.route';
import { UserRoute } from './routes/User.route';
import { SectionRoute } from './routes/Section.route';
import { MessageRoute } from './routes/Message.route';

const app = express();
const port = 80;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', AuthenticatorRoute);
app.use('/users', UserRoute);
app.use('/sections', SectionRoute);
app.use('/messages', MessageRoute);

app.listen(port, () => {
    console.log(`Server it's running on http://localhost:${port}`);
});
