'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { Election } from '@/lib/types/election';
import { api } from '@/lib/api/client';
import { showToast } from '@/lib/toast';
import { BallotDisplay } from './ballot-display';

interface VotingPageClientProps {
  election: Election;
}

export function VotingPageClient({ election }: VotingPageClientProps) {
  const [token, setToken] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please enter your voter token');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const response = await api.votes.validate({
        token: token.trim(),
        electionId: election._id,
      });

      if (response.status === 'success') {
        setIsAuthenticated(true);
        showToast.success('Token validated successfully');
      } else {
        setError('Invalid token. Please check and try again.');
      }
    } catch (error: any) {
      const reason = error?.data?.reason || 'unknown';
      let errorMessage = 'Invalid token. Please check and try again.';
      
      if (reason === 'used') {
        errorMessage = 'This token has already been used to cast a vote.';
      } else if (reason === 'expired') {
        errorMessage = 'This token has expired.';
      } else if (reason === 'invalid') {
        errorMessage = 'Invalid token. Please check and try again.';
      }

      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  if (isAuthenticated) {
    return <BallotDisplay election={election} token={token.trim()} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{election.title}</CardTitle>
          {election.description && (
            <CardDescription className="mt-2">{election.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Voter Token</Label>
              <Input
                id="token"
                type="text"
                placeholder="Enter your voter token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={isValidating}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Enter the token provided to you to access this election.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isValidating}>
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Continue to Vote'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
