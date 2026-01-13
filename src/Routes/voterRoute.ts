import express from 'express';
import multer from 'multer';
import {
  listVoters,
  uploadVotersCSV,
  addVoter,
  updateVoter,
  deleteVoter,
  deleteVotersBulk,
} from '../controllers/voterController';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/:electionId', listVoters);
router.post('/import-csv', upload.single('file'), uploadVotersCSV);
router.post('/:electionId', addVoter);
router.patch('/:voterId', updateVoter);
router.delete('/bulk', deleteVotersBulk);
router.delete('/:voterId', deleteVoter);

export default router;
