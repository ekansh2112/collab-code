import mongoose from 'mongoose';
import logger from '../logger/logger.ts';
async function InitializeDBConnection(): Promise<void>{
    try{
         await mongoose.connect('mongodb://localhost:27017/collabcode');
    }catch(err){
        logger.error('MongoDB connection error:', err)
        process.exit(1);
    }
}

export default InitializeDBConnection