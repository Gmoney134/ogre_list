import express from 'express';//added types
import  { AuthController }  from '../controllers/index.js';//updated import

const router = express.Router();

router.post('/register', AuthController.registerUser); //updated
router.post('/login', AuthController.loginUser);//updated
export default router;