import { Request, Response, NextFunction } from 'express';
import catchAsync from '../Util/catchAsync';
import AppError from '../Util/AppError';
import Election from '../model/electionModel.js';
import VoterToken from '../model/voterTokenModel.js';
import Vote from '../model/voteModel.js';

export const getDashboardStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get all elections
    const elections = await Election.find().lean();

    // Get total voters across all elections
    const totalVoters = await VoterToken.countDocuments();

    // Get total votes cast across all elections
    const totalVotes = await Vote.countDocuments();

    // Get voters who have voted
    const votersWhoVoted = await VoterToken.countDocuments({ used: true });

    // Calculate overall turnout percentage
    const overallTurnout = totalVoters > 0 ? (votersWhoVoted / totalVoters) * 100 : 0;

    // Get per-election statistics
    const electionStats = await Promise.all(
      elections.map(async (election) => {
        const electionId = String(election._id);
        
        // Count voters for this election
        const voters = await VoterToken.countDocuments({ 
          electionId: election._id 
        });
        
        // Count voters who voted
        const voted = await VoterToken.countDocuments({
          electionId: election._id,
          used: true,
        });

        // Count total votes cast (each vote is one ballot selection)
        const votes = await Vote.countDocuments({ 
          election: election._id 
        });

        // Calculate turnout percentage
        const turnout = voters > 0 ? (voted / voters) * 100 : 0;

        return {
          electionId,
          electionTitle: election.title,
          voters,
          voted,
          votes,
          turnout: Math.round(turnout * 100) / 100, // Round to 2 decimal places
        };
      })
    );

    res.status(200).json({
      status: 'success',
      data: {
        overall: {
          totalVoters,
          totalVotes,
          votersWhoVoted,
          overallTurnout: Math.round(overallTurnout * 100) / 100,
        },
        elections: electionStats,
      },
    });
  }
);
