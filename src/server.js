import { json, urlencoded } from 'express';
import http from 'http';

// server PORT

const SEREVR_PORT = 6001;

export function Start(app) {
  Middlewares(app)
  RoutesHandler(app);
  StartServer(app);
}

function Middlewares(app) {
  app.use(json({limit:"10mb"}));
  app.use(urlencoded({limit:"10mb",extended:true}))
}

function RoutesHandler(app) {
  app.get('/health', (_req, res) => {
    return res.send('Server is healthy and ok');
  });
}

function StartServer(app) {
  const server = http.createServer(app);
  server.listen(SEREVR_PORT, () => {
    console.log('server is up and Running on port : %d', SEREVR_PORT);
  });
}
