'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Copy, Download, Eye, EyeOff, Check } from 'lucide-react';
import { showToast } from '@/lib/toast';
import type { ImportedVoter } from '@/lib/types/voter';

interface TokensDisplayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voters: ImportedVoter[];
  electionTitle?: string;
}

export function TokensDisplayDialog({
  open,
  onOpenChange,
  voters,
  electionTitle,
}: TokensDisplayDialogProps) {
  const [showTokens, setShowTokens] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyToken = (token: string, index: number) => {
    navigator.clipboard.writeText(token);
    setCopiedIndex(index);
    showToast.success('Token copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    const text = voters
      .map((v) => `${v.email},${v.token}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    showToast.success('All tokens copied to clipboard');
  };

  const handleExportCSV = () => {
    const csvRows = ['Email,Token'];
    voters.forEach((v) => {
      csvRows.push(`${v.email},${v.token}`);
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${electionTitle || 'voters'}_tokens_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showToast.success('Tokens exported to CSV');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Voter Tokens Generated</DialogTitle>
          <DialogDescription>
            {voters.length} voter token{voters.length !== 1 ? 's' : ''} generated
            successfully. Save these tokens securely - they cannot be retrieved
            later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTokens(!showTokens)}
            >
              {showTokens ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Hide Tokens
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Show Tokens
                </>
              )}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyAll}>
                <Copy className="mr-2 h-4 w-4" />
                Copy All
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voters.map((voter, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">
                      {voter.email}
                    </TableCell>
                    <TableCell>
                      {showTokens ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={voter.token}
                            readOnly
                            className="font-mono text-xs h-8"
                          />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          ••••••••••••••••••••••••••••••••
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {showTokens && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyToken(voter.token, index)}
                          className="h-8 w-8"
                        >
                          {copiedIndex === index ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
