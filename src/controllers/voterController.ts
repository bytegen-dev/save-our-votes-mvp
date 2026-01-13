import { Request, Response, NextFunction } from 'express';
import catchAsync from '../Util/catchAsync';
import AppError from '../Util/AppError';
import { importVotersFromCSV } from '../services/voterImportService';
import VoterToken from '../model/voterTokenModel.js';
import crypto from 'crypto';

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

const hashToken = (raw: string): string =>
  crypto.createHash('sha256').update(String(raw)).digest('hex');

export const addVoter = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { electionId } = req.params;
    const { email, expiryHours } = req.body;

    if (!email) {
      return next(new AppError('email is required', 400));
    }

    // Validate email format
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return next(new AppError('Invalid email format', 400));
    }

    // Check if email already exists for this election
    const existingVoter = await VoterToken.findOne({
      electionId,
      email: email.toLowerCase(),
    });

    if (existingVoter) {
      return next(new AppError('Email already exists for this election', 400));
    }

    // Generate raw token and hash
    const rawToken = crypto.randomBytes(24).toString('hex');
    const tokenHash = hashToken(rawToken);

    const expiresAt = expiryHours
      ? new Date(Date.now() + expiryHours * 60 * 60 * 1000)
      : undefined;

    const voter = await VoterToken.create({
      email: email.toLowerCase(),
      electionId,
      tokenHash,
      used: false,
      expiresAt,
    });

    res.status(201).json({
      status: 'success',
      data: {
        voter: {
          _id: voter._id,
          email: voter.email,
          used: voter.used,
          usedAt: voter.usedAt,
          createdAt: voter.createdAt,
          expiresAt: voter.expiresAt,
        },
        token: rawToken, // Return raw token for display
      },
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
      data: {
        success: result.success,
        errors: result.errors,
        voters: result.voters, // Include tokens
      },
    });
  }
);

export const updateVoter = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { voterId } = req.params;
    const { email } = req.body;

    if (!email) {
      return next(new AppError('email is required', 400));
    }

    // Validate email format
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return next(new AppError('Invalid email format', 400));
    }

    const voter = await VoterToken.findById(voterId);
    if (!voter) {
      return next(new AppError('Voter not found', 404));
    }

    // Check if email already exists for this election
    const existingVoter = await VoterToken.findOne({
      electionId: voter.electionId,
      email: email.toLowerCase(),
      _id: { $ne: voterId },
    });

    if (existingVoter) {
      return next(new AppError('Email already exists for this election', 400));
    }

    voter.email = email.toLowerCase();
    await voter.save();

    res.status(200).json({
      status: 'success',
      data: { voter },
    });
  }
);

export const deleteVoter = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { voterId } = req.params;

    const voter = await VoterToken.findById(voterId);
    if (!voter) {
      return next(new AppError('Voter not found', 404));
    }

    // Prevent deletion if voter has already voted
    if (voter.used) {
      return next(
        new AppError(
          'Cannot delete voter who has already voted',
          400
        )
      );
    }

    await VoterToken.findByIdAndDelete(voterId);

    res.status(200).json({
      status: 'success',
      message: 'Voter deleted successfully',
    });
  }
);

export const deleteVotersBulk = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { voterIds } = req.body;

    if (!Array.isArray(voterIds) || voterIds.length === 0) {
      return next(new AppError('voterIds array is required', 400));
    }

    // Check if any voters have already voted
    const voters = await VoterToken.find({
      _id: { $in: voterIds },
      used: true,
    });

    if (voters.length > 0) {
      return next(
        new AppError(
          `Cannot delete ${voters.length} voter(s) who have already voted`,
          400
        )
      );
    }

    const result = await VoterToken.deleteMany({
      _id: { $in: voterIds },
      used: false,
    });

    res.status(200).json({
      status: 'success',
      message: `${result.deletedCount} voter(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  }
);
