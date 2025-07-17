import { json, urlencoded } from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';

// local imports
// import { config } from './config/env.config.js';
import { CustomError, NotFoundPageError } from './utils/CustomError.js';
import { DBConnection } from './connections/MongoDb.connection.js';
import MainRouter from './routes.js';
import { startUserDataJob } from './jobs/GetUserData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server PORT
const SEREVR_PORT = 6001;

export function Start(app) {
  securityMiddleware(app);
  RoutesHandler(app);
  ErrorHandle(app);
  StartServer(app);
  Connections();
  jobsHandler();
}

// cors configration

// {
//       origin: config.NODE_ENV !== 'development' ? [config.APP_IP, config.CLIENT_URL] : [config.LOCAL_APP_IP, config.LOCAL_CLIENT_URL],
//       credentials: true,
//       methods: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE', 'OPTION'],
//     }

function securityMiddleware(app) {
  app.set('trust proxy', 1);
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));
  app.use(cors());
  app.use(cookieParser());
  app.get('/health', (_req, res) => {
    return res.send('Server is healthy and ok');
  });
}

function RoutesHandler(app) {
  app.use('/exports', express.static(path.join(__dirname, '../public', 'exports')));
  app.use('/api/v1', MainRouter);
}

function ErrorHandle(app) {
  app.use('/', (req, _res, next) => {
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    // res.status(StatusCodes.NOT_FOUND).json({ message: 'The endpoint called does not exist.', url: fullUrl });
    next(new NotFoundPageError(`the endpoint call does not exist url: ${fullUrl}`, 'main server file'));
  });

  app.use((error, _req, res, next) => {
    if (error instanceof CustomError) {
      // console.log('error', `GatewayService ${error.comingFrom}:`, error);
      if (error.statusCode === 404 && error.status === 'page') {
        const filePath = path.join(__dirname, '/templates/pages/NotFoundPage.html');
        return res.sendFile(filePath);
      } else {
        res.status(error.statusCode).json(error.serializeErrors());
      }
    } else if (error) {
      return res.status(500).json({ error: error.message });
    }
    next();
  });
}

function jobsHandler() {
  startUserDataJob();
}

function Connections() {
  DBConnection();
}

function StartServer(app) {
  const server = http.createServer(app);
  server.listen(SEREVR_PORT, () => {
    console.log('server is up and Running on port : %d', SEREVR_PORT);
  });
}
