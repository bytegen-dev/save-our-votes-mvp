'use client';

import { useState } from 'react';
import Image from 'next/image';
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

  const primaryColor = election.branding?.primaryColor || '#000000';
  const secondaryColor = election.branding?.secondaryColor || '#666666';
  const logo = election.branding?.logo;

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: primaryColor,
        color: secondaryColor,
      }}
    >
      <Card 
        className="w-full max-w-md"
        style={{
          backgroundColor: secondaryColor,
          color: primaryColor,
          borderColor: primaryColor,
        }}
      >
        <CardHeader className="text-center">
          {logo && (
            <div className="relative w-20 h-20 mx-auto mb-4">
              <Image
                src={logo}
                alt="Election logo"
                fill
                className="object-contain"
              />
            </div>
          )}
          <CardTitle 
            className="text-2xl"
            style={{ color: primaryColor }}
          >
            {election.title}
          </CardTitle>
          {election.description && (
            <CardDescription 
              className="mt-2"
              style={{ color: primaryColor, opacity: 0.8 }}
            >
              {election.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label 
                htmlFor="token"
                style={{ color: primaryColor }}
              >
                Voter Token
              </Label>
              <Input
                id="token"
                type="text"
                placeholder="Enter your voter token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={isValidating}
                autoFocus
                style={{
                  backgroundColor: 'white',
                  color: '#000000',
                }}
              />
              <p 
                className="text-xs"
                style={{ color: primaryColor, opacity: 0.7 }}
              >
                Enter the token provided to you to access this election.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isValidating}
              style={{
                backgroundColor: primaryColor,
                color: secondaryColor,
              }}
            >
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
