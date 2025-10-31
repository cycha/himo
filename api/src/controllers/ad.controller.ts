import { Request, Response, NextFunction } from 'express';
import { adService } from '../services/ad.service';
import { SearchAdDto } from '../types/search.dto';

export class AdController {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const searchDto: SearchAdDto = req.body;
      const page = searchDto.page || 0;

      const ads = await adService.search(searchDto, page);

      res.status(200).json({
        success: true,
        data: ads,
        page,
        count: ads.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const ad = await adService.getById(id);

      if (!ad) {
        res.status(404).json({
          success: false,
          error: 'Ad not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: ad,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adController = new AdController();
