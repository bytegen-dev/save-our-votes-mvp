export interface Voter {
  _id: string;
  email?: string;
  used: boolean;
  usedAt?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface VotersResponse {
  status: 'success';
  results: number;
  data: {
    voters: Voter[];
  };
}

export interface ImportedVoter {
  email: string;
  token: string;
}

export interface VoterImportResponse {
  status: 'success';
  data: {
    success: number;
    errors: string[];
    voters: ImportedVoter[];
  };
}
