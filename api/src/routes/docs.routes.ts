import { Router, type Router as RouterType } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const router: RouterType = Router();

const openapiPath = path.join(__dirname, '../../openapi.yaml');
const openapiDocument = YAML.load(openapiPath);

const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Himo API Documentation',
};

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(openapiDocument, swaggerUiOptions));

router.get('/json', (req, res) => {
  res.json(openapiDocument);
});

router.get('/yaml', (req, res) => {
  res.type('text/yaml');
  res.send(YAML.stringify(openapiDocument, 10, 2));
});

export default router;
