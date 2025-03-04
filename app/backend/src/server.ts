import express from 'express';
import cors from 'cors';
import router from './routes/index.js';//added .js
import User from './models/user.js';//added .js

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', router);

const startServer = async () => {
    try {
        await User.createTable();
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
};

startServer();