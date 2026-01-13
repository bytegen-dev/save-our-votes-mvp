import { Request, Response, NextFunction } from 'express';
import catchAsync from '../Util/catchAsync';
import AppError from '../Util/AppError';
import { importVotersFromCSV } from '../services/voterImportService';
import VoterToken from '../model/voterTokenModel.js';

export const listVoters = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { electionId } = req.params;

    if (!electionId) {
      return next(new AppError('electionId required', 400));
    }

    const voters = await VoterToken.find({ electionId })
      .select('_id email used usedAt createdAt expiresAt')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      status: 'success',
      results: voters.length,
      data: { voters },
    });
  }
);

export const uploadVotersCSV = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    const { electionId } = req.body;
    if (!electionId) {
      return next(new AppError('electionId required', 400));
    }

    const result = await importVotersFromCSV(req.file.path, electionId);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);
