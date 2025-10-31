import { Request, Response, NextFunction } from 'express';
import { adService } from '../services/ad.service';
import { SearchAdDto } from '../dtos/ad.dto';

export class AdController {
  constructor(private readonly service = adService) {}

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const searchDto: SearchAdDto = req.body;
      const page = searchDto.page || 0;

      const result = await this.service.search(searchDto, page);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const ad = await this.service.getById(id);

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
