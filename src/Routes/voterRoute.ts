import express from 'express';
import multer from 'multer';
import { listVoters, uploadVotersCSV } from '../controllers/voterController';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/:electionId', listVoters);
router.post('/import-csv', upload.single('file'), uploadVotersCSV);

export default router;
