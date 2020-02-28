const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const config = require("./config");

const handlers = {
  sample: function(data, callback) {
    callback(406, { name: "sample handler name" });
  },
  ping: function(data, callback) {
    callback(200);
  },
  hello: function(data, callback) {
    callback(200, { greeting: "Hello fake world" });
  },
  notFound: function(data, callback) {
    callback(404);
  }
};

const router = {
  sample: handlers.sample
};

const httpServer = http.createServer((request, response) => {
  unifiedServer(request, response);
});

const httpsServerOptions = {
  key: fs.readFileSync(path.normalize(__dirname + "/https/key.pem")),
  cert: fs.readFileSync(path.normalize(__dirname + "/https/cert.pem"))
};

const httpsServer = https.createServer(
  httpsServerOptions,
  (request, response) => {
    unifiedServer(request, response);
  }
);

const HTTP_PORT = config.httpPort || process.env.PORT;
const HTTPS_PORT = config.httpsPort || process.env.PORT;

httpServer.listen(HTTP_PORT, () => {
  console.log("Server listening on port " + HTTP_PORT + "...");
});

httpsServer.listen(HTTPS_PORT, () => {
  console.log("Server listening on port " + HTTPS_PORT + "...");
});

const unifiedServer = (request, response) => {
  const parsedUrl = url.parse(request.url, true);

  const path = parsedUrl.pathname;
  const trimmedPath = path.trim().replace(/^\/+|\/+$/g, "");

  const method = request.method.toLowerCase();
  const queryStringObj = parsedUrl.query;
  const headers = request.headers;

  const decoder = new StringDecoder("UTF-8");
  let buffer = "";

  request.on("data", data => {
    buffer += decoder.write(data);
  });

  request.on("end", () => {
    buffer += decoder.end();

    const chosenRouteHandler =
      trimmedPath in router ? handlers[trimmedPath] : handlers["notFound"];

    const data = {
      trimmedPath,
      queryStringObj,
      headers,
      method,
      payload: buffer
    };

    chosenRouteHandler(data, function(statusCode = 201, payload = {}) {
      const payloadString = JSON.stringify(payload);

      response.setHeader("Content-Type", "application/json");
      response.setHeader(
        "Content-Length",
        Buffer.byteLength(payloadString, "UTF-8")
      );
      response.writeHead(statusCode);
      response.end(payloadString);
    });
  });
};
