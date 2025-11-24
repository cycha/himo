import { Router, type Router as RouterType } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const router: RouterType = Router();

// Load OpenAPI specification
const openapiPath = path.join(__dirname, '../../openapi.yaml');
const openapiDocument = YAML.load(openapiPath);

/**
 * Swagger UI options
 */
const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Himo API Documentation',
};

/**
 * @route   GET /api/docs
 * @desc    Serve OpenAPI documentation UI
 * @access  Public
 */
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(openapiDocument, swaggerUiOptions));

/**
 * @route   GET /api/docs/json
 * @desc    Get OpenAPI specification in JSON format
 * @access  Public
 */
router.get('/json', (req, res) => {
  res.json(openapiDocument);
});

/**
 * @route   GET /api/docs/yaml
 * @desc    Get OpenAPI specification in YAML format
 * @access  Public
 */
router.get('/yaml', (req, res) => {
  res.type('text/yaml');
  res.send(YAML.stringify(openapiDocument, 10, 2));
});

export default router;
