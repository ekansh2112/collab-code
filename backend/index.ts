import InitializeDBConnection from './config/database.ts';
import express from "express"
import logger from "./logger/logger.ts";
import SetUpWebSocket from './websocket.ts';
const app=express()


async function StartServer(){
  logger.info("Server started at",8000)
  logger.info("Starting DB connection...")
    try {
        await InitializeDBConnection();
        logger.info('Database connected successfully');
    } catch (err) {
      logger.error('Failed to connect to database:', err)
    }
    try{
       SetUpWebSocket()
       logger.info("Websocket setup successfully")

    }catch(err){
      logger.error("Error setting up websocket")
      process.exit(1)
    }
}

app.listen(8000,StartServer);


