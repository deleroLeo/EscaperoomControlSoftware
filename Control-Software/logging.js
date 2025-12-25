//const winston = require('winston');
import winston from "winston";
const { combine, timestamp, json } = winston.format;
//import pino from 'pino'
//import type { LokiOptions } from 'pino-loki'

import LokiTransport from "winston-loki";

//const { combine, timestamp, json } = winston.format;
//const pino = require('pino-loki');

// Create a Pino Loki transport
/*const transport = pino.transport<LokiOptions>({
  target: "pino-loki",
  options: {
    host: 'http://192.168.6.2:3100', //or where your loki is hosted
  },
});*/
// Create a Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), json()),
  transports: [
    new LokiTransport({
      host:"192.168.6.2:3100"
    })
    //new winston.transports.Console(), // Add other transports if needed
  ],
});

export default logger;