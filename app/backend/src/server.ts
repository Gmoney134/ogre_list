import express from 'express';
import cors from 'cors';
import router from './routes/index.js';//updated
import User from './models/user.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', router);//updated

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