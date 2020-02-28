const environments = {
  staging: {
    httpPort: 3000,
    httpsPort: 3001,
    envName: "staging"
  },
  production: {
    httPort: 5001,
    httpsPort: 5002,
    envName: "production"
  }
};

module.exports = environments[process.env.NODE_ENV] || environments["staging"];
