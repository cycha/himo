import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { adController } from '../controllers/ad.controller';
import { searchValidation } from '../middleware/validation';
import { handleValidationErrors } from '../middleware/error-handler';

const router: RouterType = Router();

/**
 * @route   GET/POST /api/ads/search
 * @desc    Search for ads with filters
 * @access  Public
 * @note    GET is primary (RESTful), POST for backward compatibility
 */
router.route('/search')
  .get(
    searchValidation,
    handleValidationErrors,
    adController.search.bind(adController)
  )
  .post(
    searchValidation,
    handleValidationErrors,
    adController.search.bind(adController)
  );

/**
 * @route   GET /api/ads/:id
 * @desc    Get ad by ID
 * @access  Public
 */
router.get('/:id', adController.getById.bind(adController));

export default router;
