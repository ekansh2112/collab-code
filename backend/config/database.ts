import mongoose from 'mongoose';

async function InitializeDBConnection(): Promise<void>{
    try{
         await mongoose.connect('mongodb://localhost:27017/collabcode');
    }catch(err){
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
}

export default InitializeDBConnection