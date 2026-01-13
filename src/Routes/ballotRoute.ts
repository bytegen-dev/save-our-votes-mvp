import express, { Router } from 'express';
import {
  addBallot,
  listBallots,
  updateBallot,
  deleteBallot,
} from '../controllers/ballotController.js';

const router: Router = express.Router({ mergeParams: true });

router.post('/', addBallot);
router.get('/', listBallots);
router.patch('/:ballotId', updateBallot);
router.delete('/:ballotId', deleteBallot);

export default router;
