import { Request, Response, NextFunction } from 'express';
import Election from '../model/electionModel.js';
import { IElection } from '../Interfaces/electionInterface';
import AppError from '../Util/AppError';
import {
  getAll as listFactory,
  updateOne as updateFactory,
  deleteOne as deleteFactory,
} from './handlerFactory.js';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Create a new election (expects req.user to be set to the authenticated organizer)
export const createElection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, startAt, endAt, organizerId } = req.body;
    console.log('createElection req.body =', req.body);
    if (!title || !startAt || !endAt) {
      return next(new AppError('title, startAt and endAt are required', 400));
    }

    const start = new Date(startAt);
    const end = new Date(endAt);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return next(new AppError('Invalid startAt or endAt date', 400));
    }
    if (start >= end) {
      return next(new AppError('startAt must be before endAt', 400));
    }

    // determine organizer: prefer authenticated user
    const organizer = req.user && req.user._id ? req.user._id : organizerId;
    if (!organizer) {
      return next(
        new AppError(
          'Organizer not found. Authenticate or provide organizerId',
          401
        )
      );
    }

    const election = await Election.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      organizer,
      startAt: start,
      endAt: end,
      status: 'draft', // Default to draft - admin must publish
    });

    res.status(201).json({
      status: 'success',
      data: { election },
    });
  } catch (err) {
    next(err);
  }
};

// Get election by ID
export const getElection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const election = await Election.findById(req.params.id).populate(
      'organizer',
      'fullName email'
    );
    if (!election) return next(new AppError('Election not found', 404));
    res.status(200).json({ status: 'success', data: { election } });
  } catch (err) {
    next(err);
  }
};

// Get election by slug
export const getElectionBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const election = await Election.findOne({ slug: req.params.slug }).populate(
      'organizer',
      'fullName email'
    );
    if (!election) return next(new AppError('Election not found', 404));
    res.status(200).json({ status: 'success', data: { election } });
  } catch (err) {
    next(err);
  }
};

export const duplicateElection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const originalElection = await Election.findById(id);
    if (!originalElection) {
      return next(new AppError('Election not found', 404));
    }

    const organizer = req.user && req.user._id ? req.user._id : originalElection.organizer;
    if (!organizer) {
      return next(new AppError('Organizer not found', 401));
    }

    const now = new Date();
    const defaultStart = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const defaultEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const duplicatedElection = await Election.create({
      title: title || `Copy of ${originalElection.title}`,
      description: originalElection.description,
      organizer,
      startAt: defaultStart,
      endAt: defaultEnd,
      status: 'draft',
      ballots: originalElection.ballots || [],
    });

    res.status(201).json({
      status: 'success',
      data: { election: duplicatedElection },
    });
  } catch (err) {
    next(err);
  }
};

export const publishElection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const election = await Election.findById(id);

    if (!election) {
      return next(new AppError('Election not found', 404));
    }

    if (election.status !== 'draft') {
      return next(
        new AppError('Only draft elections can be published', 400)
      );
    }

    // Calculate status based on dates
    const now = new Date();
    const startAt = new Date(election.startAt);
    const endAt = new Date(election.endAt);

    let calculatedStatus: 'scheduled' | 'open' | 'closed';
    if (now < startAt) {
      calculatedStatus = 'scheduled';
    } else if (now >= startAt && now <= endAt) {
      calculatedStatus = 'open';
    } else {
      calculatedStatus = 'closed';
    }

    // Update status from draft to calculated status
    election.status = calculatedStatus;
    await election.save();

    res.status(200).json({
      status: 'success',
      data: { election },
    });
  } catch (err) {
    next(err);
  }
};

export const convertToDraft = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const election = await Election.findById(id);

    if (!election) {
      return next(new AppError('Election not found', 404));
    }

    if (election.status === 'draft') {
      return next(
        new AppError('Election is already a draft', 400)
      );
    }

    // Convert to draft
    election.status = 'draft';
    await election.save();

    res.status(200).json({
      status: 'success',
      data: { election },
    });
  } catch (err) {
    next(err);
  }
};

export const listElections = listFactory(Election);
export const updateElection = updateFactory(Election);
export const deleteElection = deleteFactory(Election);
