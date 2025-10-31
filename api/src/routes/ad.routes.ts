import { Router } from 'express';
import { adController } from '../controllers/ad.controller';
import { searchValidation } from '../middleware/validation';
import { handleValidationErrors } from '../middleware/error-handler';

const router = Router();

/**
 * @route   POST /api/ads/search
 * @desc    Search for ads with filters
 * @access  Public
 */
router.post(
  '/search',
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
