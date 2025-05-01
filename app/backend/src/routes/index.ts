import express from 'express';
import authRouter from './auth.js';
import profileRouter from './profile.js';
import dashboardRouter from './dashboard.js';
import houseRouter from './house.js';
import roomRouter from './room.js';
import applianceRouter from './appliance.js';
import partRouter from './part.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use(profileRouter);
router.use('/dashboard', dashboardRouter);
router.use('/house', houseRouter);
router.use('/room', roomRouter);
router.use('/appliance', applianceRouter);
router.use('/part', partRouter);

export default router;