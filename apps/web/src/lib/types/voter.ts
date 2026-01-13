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

export interface VoterImportResponse {
  status: 'success';
  data: {
    success: number;
    errors: string[];
  };
}
