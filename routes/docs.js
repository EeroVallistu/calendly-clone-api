const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Load both language versions
const englishSpec = YAML.load(path.join(__dirname, '../docs/en/api.yaml'));
const estonianSpec = YAML.load(path.join(__dirname, '../docs/et/api.yaml'));

// Separate SwaggerUI options for each language
const englishOptions = {
  explorer: true,
  customSiteTitle: "API Documentation (English)",
  swaggerOptions: {
    url: null, // Disable URL loading
  }
};

const estonianOptions = {
  explorer: true,
  customSiteTitle: "API Dokumentatsioon (Eesti)",
  swaggerOptions: {
    url: null, // Disable URL loading
  }
};

// Serve English documentation
router.use('/en', swaggerUi.serve);
router.get('/en', (req, res) => {
  res.send(swaggerUi.generateHTML(englishSpec, englishOptions));
});

// Serve Estonian documentation
router.use('/et', swaggerUi.serve);
router.get('/et', (req, res) => {
  res.send(swaggerUi.generateHTML(estonianSpec, estonianOptions));
});

// Redirect root /docs to English version
router.get('/', (req, res) => {
  res.redirect('/docs/en');
});

module.exports = router;
