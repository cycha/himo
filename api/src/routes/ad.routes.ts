import { Router, type Router as RouterType } from 'express';
import { adController } from '../controllers/ad.controller';
import { searchValidation } from '../middleware/validation';
import { handleValidationErrors } from '../middleware/error-handler';

const router: RouterType = Router();

// GET/POST /api/ads/search - Search for ads with filters
router
  .route('/search')
  .get(searchValidation, handleValidationErrors, adController.search.bind(adController))
  .post(searchValidation, handleValidationErrors, adController.search.bind(adController));

// GET /api/ads/:id - Get ad by ID
router.get('/:id', adController.getById.bind(adController));

export default router;
