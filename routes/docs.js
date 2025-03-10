const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Load both language versions and main API spec
const englishSpec = YAML.load(path.join(__dirname, '../docs/en/api.yaml'));
const estonianSpec = YAML.load(path.join(__dirname, '../docs/et/api.yaml'));
const mainSpec = YAML.load(path.join(__dirname, '../calendly-clone-api.yaml'));

// Base SwaggerUI options
const baseOptions = {
  explorer: true
};

// Language-specific options
const englishOptions = {
  ...baseOptions,
  customSiteTitle: "API Documentation (English)",
  swaggerOptions: {
    url: null, // Use direct spec object
    defaultModelsExpandDepth: 1,
    docExpansion: 'list'
  }
};

const estonianOptions = {
  ...baseOptions,
  customSiteTitle: "API Dokumentatsioon (Eesti)",
  swaggerOptions: {
    url: null, // Use direct spec object
    defaultModelsExpandDepth: 1,
    docExpansion: 'list'
  }
};

const mainOptions = {
  ...baseOptions,
  customSiteTitle: "Calendly Clone API Documentation",
  swaggerOptions: {
    url: null,
    defaultModelsExpandDepth: 1,
    docExpansion: 'list'
  }
};

// Serve docs at the root path
router.use('/', swaggerUi.serve);
router.get('/', (req, res) => {
  if (router.mountpath === '/en') {
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.send(swaggerUi.generateHTML(englishSpec, englishOptions));
  } else if (router.mountpath === '/et') {
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.send(swaggerUi.generateHTML(estonianSpec, estonianOptions));
  } else {
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.send(swaggerUi.generateHTML(mainSpec, mainOptions));
  }
});

// Catch-all for Swagger UI internal routes
router.get('/*', (req, res, next) => {
  // Pass through for asset requests
  if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico)$/)) {
    return next();
  }
  // Otherwise redirect to the root
  res.redirect(router.mountpath);
});

module.exports = router;
