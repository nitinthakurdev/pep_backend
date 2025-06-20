import http from 'http';

// server PORT

const SEREVR_PORT = 6000;

export function Start(app) {
  RoutesHandler(app);
  StartServer(app);
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
