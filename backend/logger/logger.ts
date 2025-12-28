import { createLogger, format, transports } from 'winston';

import DailyRotateFile from 'winston-daily-rotate-file';

// const dailyRotateTransport = new DailyRotateFile({
//     filename: 'logs/%DATE%-app.log',
//     datePattern: 'YYYY-MM-DD',
//     zippedArchive: true, //COMPRESS LOG FILES 
//     maxSize: '20m',
//     maxFiles: '14d',
//     level: 'info',
// });


const logger = createLogger({
  level: 'info', 
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }), 
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(), 
        format.printf(({ timestamp, level, message, stack }) => {
          return `${timestamp} [${level}]: ${stack || message}`;
        })
      )
    }),
    // dailyRotateTransport,
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ],
  exitOnError: false,
});

export default logger;
