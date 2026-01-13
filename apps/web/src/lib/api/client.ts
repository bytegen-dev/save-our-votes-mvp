import type {
  ElectionsResponse,
  ElectionResponse,
  Election,
} from '@/lib/types/election';
import type {
  VotersResponse,
  VoterImportResponse,
  Voter,
} from '@/lib/types/voter';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, response.statusText, errorData);
    }

    if (response.status === 204) {
      return { status: 'success', data: null } as T;
    }

    const text = await response.text();
    if (!text) {
      return { status: 'success', data: null } as T;
    }

    try {
      return JSON.parse(text);
    } catch {
      return { status: 'success', data: text } as T;
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error(`Failed to fetch from ${url}. Is the backend running?`);
      throw new ApiError(0, 'Network Error', {
        message:
          'Failed to connect to backend API. Make sure the Express server is running.',
        originalError: error.message,
      });
    }
    throw error;
  }
}

export const api = {
  dashboard: {
    getStats: () =>
      fetchApi<{
        status: 'success';
        data: {
          overall: {
            totalVoters: number;
            totalVotes: number;
            votersWhoVoted: number;
            overallTurnout: number;
          };
          elections: Array<{
            electionId: string;
            electionTitle: string;
            voters: number;
            voted: number;
            votes: number;
            turnout: number;
          }>;
        };
      }>('/dashboard/stats'),
  },
  elections: {
    list: () => fetchApi<ElectionsResponse>('/elections'),
    get: (id: string) => fetchApi<ElectionResponse>(`/elections/${id}`),
    getBySlug: (slug: string) =>
      fetchApi<ElectionResponse>(`/elections/slug/${slug}`),
    create: (data: Partial<Election>) =>
      fetchApi<ElectionResponse>('/elections', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Election>) =>
      fetchApi<ElectionResponse>(`/elections/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchApi<{ status: 'success'; data: null }>(`/elections/${id}`, {
        method: 'DELETE',
      }),
    duplicate: (id: string, title?: string) =>
      fetchApi<ElectionResponse>(`/elections/${id}/duplicate`, {
        method: 'POST',
        body: JSON.stringify({ title }),
      }),
    publish: (id: string) =>
      fetchApi<ElectionResponse>(`/elections/${id}/publish`, {
        method: 'POST',
      }),
    convertToDraft: (id: string) =>
      fetchApi<ElectionResponse>(`/elections/${id}/convert-to-draft`, {
        method: 'POST',
      }),
  },
  ballots: {
    list: (electionId: string) => fetchApi(`/elections/${electionId}/ballots`),
    create: (electionId: string, data: unknown) =>
      fetchApi(`/elections/${electionId}/ballots`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (electionId: string, ballotId: string, data: unknown) =>
      fetchApi(`/elections/${electionId}/ballots/${ballotId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (electionId: string, ballotId: string) =>
      fetchApi(`/elections/${electionId}/ballots/${ballotId}`, {
        method: 'DELETE',
      }),
  },
  votes: {
    validate: (data: unknown) =>
      fetchApi('/vote/validate', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    cast: (data: unknown) =>
      fetchApi('/vote/cast', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    castAll: (data: unknown) =>
      fetchApi('/vote/cast-all', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getResults: (electionId: string) =>
      fetchApi<{
        status: 'success';
        data: {
          electionId: string;
          results: Array<{
            ballotId: string;
            ballotTitle: string;
            ballotDescription?: string;
            ballotType: string;
            options: Array<{
              optionId: string;
              text: string;
              order: number;
              votes: number;
            }>;
            totalVotes: number;
          }>;
        };
      }>(`/vote/results/${electionId}`),
  },
  tokens: {
    generate: (
      electionId: string,
      data: { emails: string[]; expiryHours?: number }
    ) =>
      fetchApi<{
        status: 'success';
        count: number;
        data: { tokens: Array<{ email: string; token: string }> };
      }>(`/elections/${electionId}/tokens`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  voters: {
    list: (electionId: string) =>
      fetchApi<VotersResponse>(`/voters/${electionId}`),
    add: (electionId: string, data: { email: string; expiryHours?: number }) =>
      fetchApi<{
        status: 'success';
        data: {
          voter: Voter;
          token: string;
        };
      }>(`/voters/${electionId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (voterId: string, data: { email: string }) =>
      fetchApi<VotersResponse>(`/voters/${voterId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (voterId: string) =>
      fetchApi<{ status: 'success'; message: string }>(`/voters/${voterId}`, {
        method: 'DELETE',
      }),
    deleteBulk: (voterIds: string[]) =>
      fetchApi<{
        status: 'success';
        message: string;
        deletedCount: number;
      }>('/voters/bulk', {
        method: 'DELETE',
        body: JSON.stringify({ voterIds }),
      }),
    importCSV: (electionId: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('electionId', electionId);

      return fetch(`${API_URL}/voters/import-csv`, {
        method: 'POST',
        body: formData,
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new ApiError(response.status, response.statusText, errorData);
        }
        return response.json() as Promise<VoterImportResponse>;
      });
    },
  },
};

export { ApiError };
