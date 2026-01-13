'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Election } from '@/lib/types/election';
import { api } from '@/lib/api/client';
import { showToast } from '@/lib/toast';
import { VoteConfirmationDialog } from './vote-confirmation-dialog';

interface BallotDisplayProps {
  election: Election;
  token: string;
}

export function BallotDisplay({ election, token }: BallotDisplayProps) {
  const router = useRouter();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  if (!election.ballots || election.ballots.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No ballots available for this election.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleOptionChange = (ballotId: string, optionId: string, isMultiple: boolean) => {
    setSelectedOptions((prev) => {
      const current = prev[ballotId] || [];
      
      if (isMultiple) {
        const newSelection = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [ballotId]: newSelection };
      } else {
        return { ...prev, [ballotId]: [optionId] };
      }
    });
  };

  const validateSelections = (): boolean => {
    for (const ballot of election.ballots || []) {
      const selections = selectedOptions[ballot._id] || [];
      
      if (selections.length === 0) {
        showToast.error(`Please make a selection for "${ballot.title}"`);
        return false;
      }

      if (ballot.type === 'single' && selections.length > 1) {
        showToast.error(`You can only select one option for "${ballot.title}"`);
        return false;
      }

      if (ballot.type === 'multiple' && ballot.maxSelections && selections.length > ballot.maxSelections) {
        showToast.error(`You can select at most ${ballot.maxSelections} options for "${ballot.title}"`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateSelections()) {
      return;
    }

    setShowConfirmation(true);
  };

  const confirmVote = async () => {
    setIsSubmitting(true);
    setShowConfirmation(false);

    try {
      const ballotsToVote = (election.ballots || []).filter(
        (ballot) => (selectedOptions[ballot._id] || []).length > 0
      );

      if (ballotsToVote.length === 0) {
        showToast.error('Please make at least one selection');
        setIsSubmitting(false);
        return;
      }

      // Cast all votes in a single transaction
      const ballots = ballotsToVote.map((ballot) => ({
        ballotId: ballot._id,
        optionIds: selectedOptions[ballot._id] || [],
      }));

      await api.votes.castAll({
        token,
        electionId: election._id,
        ballots,
      });

      setHasVoted(true);
      showToast.success('Your vote has been recorded successfully!');
    } catch (error: any) {
      console.error('Failed to cast vote:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to submit vote';
      showToast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  const primaryColor = election.branding?.primaryColor || '#000000';
  const secondaryColor = election.branding?.secondaryColor || '#666666';
  const logo = election.branding?.logo;

  if (hasVoted) {
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle 
              className="text-2xl"
              style={{ color: primaryColor }}
            >
              Vote Submitted Successfully!
            </CardTitle>
            <CardDescription 
              className="mt-2"
              style={{ color: primaryColor, opacity: 0.8 }}
            >
              Thank you for participating in this election.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your vote has been recorded. This token can no longer be used to vote.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalBallots = election.ballots?.length || 0;
  const completedBallots = Object.keys(selectedOptions).filter(
    (ballotId) => (selectedOptions[ballotId] || []).length > 0
  ).length;
  const progress = totalBallots > 0 ? (completedBallots / totalBallots) * 100 : 0;

  return (
    <>
      <div 
        className="min-h-screen p-4"
        style={{
          backgroundColor: primaryColor,
          color: secondaryColor,
        }}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            {logo && (
              <div className="relative w-24 h-24 mx-auto">
                <Image
                  src={logo}
                  alt="Election logo"
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="space-y-2">
              <h1 
                className="text-3xl"
                style={{ color: secondaryColor }}
              >
                {election.title}
              </h1>
              {election.description && (
                <p style={{ color: secondaryColor, opacity: 0.9 }}>
                  {election.description}
                </p>
              )}
            </div>
          </div>

          {totalBallots > 1 && (
            <Card
              style={{
                backgroundColor: secondaryColor,
                color: primaryColor,
                borderColor: primaryColor,
              }}
            >
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div 
                    className="flex items-center justify-between text-sm"
                    style={{ color: primaryColor }}
                  >
                    <span>Progress</span>
                    <span>{completedBallots} of {totalBallots} ballots completed</span>
                  </div>
                  <Progress value={progress} />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            {election.ballots?.map((ballot) => {
              const isMultiple = ballot.type === 'multiple';
              const selections = selectedOptions[ballot._id] || [];

              return (
                <Card 
                  key={ballot._id}
                  style={{
                    backgroundColor: secondaryColor,
                    color: primaryColor,
                    borderColor: primaryColor,
                  }}
                >
                  <CardHeader>
                    <CardTitle style={{ color: primaryColor }}>
                      {ballot.title}
                    </CardTitle>
                    {ballot.description && (
                      <CardDescription style={{ color: primaryColor, opacity: 0.8 }}>
                        {ballot.description}
                      </CardDescription>
                    )}
                    {isMultiple && ballot.maxSelections && (
                      <CardDescription style={{ color: primaryColor, opacity: 0.8 }}>
                        Select up to {ballot.maxSelections} option{ballot.maxSelections > 1 ? 's' : ''}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {isMultiple ? (
                      <div className="space-y-4">
                        {ballot.options?.map((option) => {
                          const isSelected = selections.includes(option._id);
                          const isDisabled = 
                            !isSelected && 
                            ballot.maxSelections && 
                            selections.length >= ballot.maxSelections;

                          return (
                            <div
                              key={option._id}
                              className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                                isSelected
                                  ? ''
                                  : isDisabled
                                  ? 'opacity-50 cursor-not-allowed'
                                  : ''
                              }`}
                              style={{
                                borderColor: isSelected ? primaryColor : secondaryColor,
                                backgroundColor: isSelected ? `${primaryColor}20` : 'transparent',
                              }}
                              onClick={() => !isDisabled && handleOptionChange(ballot._id, option._id, true)}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleOptionChange(ballot._id, option._id, true)}
                                disabled={isDisabled}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-12 w-12 shrink-0">
                                    {option.photo && (
                                      <AvatarImage src={option.photo} alt={option.text} />
                                    )}
                                    <AvatarFallback>
                                      {option.text?.[0]?.toUpperCase() || 'C'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <Label
                                      htmlFor={`option-${option._id}`}
                                      className="text-base cursor-pointer"
                                      style={{ color: primaryColor }}
                                    >
                                      {option.text}
                                    </Label>
                                    {option.bio && (
                                      <p 
                                        className="text-sm mt-1"
                                        style={{ color: primaryColor, opacity: 0.8 }}
                                      >
                                        {option.bio}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <RadioGroup
                        value={selections[0] || ''}
                        onValueChange={(value) => handleOptionChange(ballot._id, value, false)}
                      >
                        <div className="space-y-4">
                          {ballot.options?.map((option) => (
                            <div
                              key={option._id}
                              className="flex items-start gap-4 p-4 border rounded-lg transition-colors"
                              style={{
                                borderColor: selections[0] === option._id ? primaryColor : secondaryColor,
                                backgroundColor: selections[0] === option._id ? `${primaryColor}20` : 'transparent',
                              }}
                            >
                              <RadioGroupItem
                                value={option._id}
                                id={`option-${option._id}`}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-12 w-12 shrink-0">
                                    {option.photo && (
                                      <AvatarImage src={option.photo} alt={option.text} />
                                    )}
                                    <AvatarFallback>
                                      {option.text?.[0]?.toUpperCase() || 'C'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <Label
                                      htmlFor={`option-${option._id}`}
                                      className="text-base cursor-pointer"
                                      style={{ color: primaryColor }}
                                    >
                                      {option.text}
                                    </Label>
                                    {option.bio && (
                                      <p 
                                        className="text-sm mt-1"
                                        style={{ color: primaryColor, opacity: 0.8 }}
                                      >
                                        {option.bio}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              disabled={isSubmitting}
              style={{
                borderColor: secondaryColor,
                color: secondaryColor,
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              style={{
                backgroundColor: primaryColor,
                color: secondaryColor,
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Vote'
              )}
            </Button>
          </div>
        </div>
      </div>

      <VoteConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        onConfirm={confirmVote}
        election={election}
        selectedOptions={selectedOptions}
      />
    </>
  );
}
