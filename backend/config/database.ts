import mongoose from 'mongoose';
import logger from '../logger/logger';
import 'dotenv/config';
async function InitializeDBConnection(): Promise<void>{
    try{
         await mongoose.connect(process.env.DATABASE_URL||'mongodb://localhost:27017/collabcode');
    }catch(err){
        logger.error('MongoDB connection error:', err)
        process.exit(1);
    }
}

export default InitializeDBConnection