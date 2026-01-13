import express, { Router } from 'express';
import {
  validateVoterToken,
  cast,
  castVotes,
  resultsForBallot,
  resultsForElection,
} from '../controllers/voteController.js';

const router: Router = express.Router();

router.post('/validate', validateVoterToken);
router.post('/cast', cast);
router.post('/cast-all', castVotes);
router.get('/results/:electionId', resultsForElection);
router.get('/results/:electionId/:ballotId', resultsForBallot);

export default router;
