const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/v1',
    createProxyMiddleware({
      target: 'http://localhost:5000', // Assuming your backend server runs on port 5000
      changeOrigin: true,
    })
  );
};

