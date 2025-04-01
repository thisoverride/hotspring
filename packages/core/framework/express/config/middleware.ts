import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import express, { type Application } from 'express';
import { Logger } from '../../..';

export const configureMiddleware = (app: Application, logger: Logger): void => {
  // app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(express.json({ limit: '50mb' }));
  app.use(morgan('dev', { stream : {
    write: (message: string) => {
      const formattedMessage: string = message.trim();
      logger.info(`[HTTP] ${formattedMessage}`);
    }
  }}));
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:8007', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  }));
};
