import fs from 'fs';
import csc from 'csv-parser';
import crypto from 'crypto';
import VoterToken from '../model/voterTokenModel';

interface VoterRow {
  email: string;
  name?: string;
  electionId: string;
}

const hashToken = (raw: string): string =>
  crypto.createHash('sha256').update(String(raw)).digest('hex');

export interface ImportedVoter {
  email: string;
  token: string;
}

export const importVotersFromCSV = async (
  filePath: string,
  electionId: string
): Promise<{ success: number; errors: string[]; voters: ImportedVoter[] }> => {
  const errors: string[] = [];
  const voters: ImportedVoter[] = [];
  let success = 0;

  return new Promise((resolve, reject) => {
    const promises: Promise<void>[] = [];

    fs.createReadStream(filePath)
      .pipe(csc())
      .on('data', (row: VoterRow) => {
        const promise = (async () => {
          try {
            // Handle case-insensitive email field and skip comment rows
            const email = row.email || (row as any).Email || (row as any).EMAIL;
            
            // Skip comment rows (lines starting with #)
            if (!email || email.trim().startsWith('#')) {
              return;
            }

            if (!email.trim()) {
              errors.push(`Row missing email: ${JSON.stringify(row)}`);
              return;
            }

            // Validate email format
            const emailToValidate = email.trim();
            if (!emailToValidate.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
              errors.push(`Invalid email: ${emailToValidate}`);
              return;
            }

            // Generate raw token and hash
            const rawToken = crypto.randomBytes(24).toString('hex');
            const tokenHash = hashToken(rawToken);

            await VoterToken.create({
              email: emailToValidate.toLowerCase(),
              electionId,
              tokenHash,
              used: false,
            });

            voters.push({
              email: emailToValidate.toLowerCase(),
              token: rawToken,
            });
            success++;
          } catch (err: any) {
            const email = row.email || (row as any).Email || (row as any).EMAIL || 'unknown';
            errors.push(`Error processing ${email}: ${err.message}`);
          }
        })();
        
        promises.push(promise);
      })
      .on('end', async () => {
        try {
          // Wait for all async operations to complete
          await Promise.all(promises);
          fs.unlinkSync(filePath); // Delete temp file
          resolve({ success, errors, voters });
        } catch (err) {
          reject(err);
        }
      })
      .on('error', reject);
  });
};
