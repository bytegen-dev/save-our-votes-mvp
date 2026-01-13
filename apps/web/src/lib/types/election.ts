export type ElectionStatus = 'draft' | 'scheduled' | 'open' | 'closed';

export interface Election {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  organizer: string | {
    _id: string;
    fullName?: string;
    email?: string;
  };
  startAt: string;
  endAt: string;
  status: ElectionStatus;
  ballots: Array<{
    _id: string;
    title: string;
    description?: string;
    type: 'single' | 'multiple';
    maxSelections: number;
    options: Array<{
      _id: string;
      text: string;
      order: number;
      photo?: string;
      bio?: string;
    }>;
    isActive: boolean;
  }>;
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  results?: number;
  message?: string;
}

export interface ElectionsResponse {
  status: 'success';
  results: number;
  data: {
    docs: Election[];
  };
}

export interface ElectionResponse {
  status: 'success';
  data: {
    election: Election;
  };
}
