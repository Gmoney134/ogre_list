import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes';
import User from './models/user';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    // Create the users table if it doesn't exist
    await User.createTable();
});