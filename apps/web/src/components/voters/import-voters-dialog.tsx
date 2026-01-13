'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api/client';
import { showToast } from '@/lib/toast';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TokensDisplayDialog } from './tokens-display-dialog';

interface ImportVotersDialogProps {
  electionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ImportVotersDialog({
  electionId,
  open,
  onOpenChange,
  onSuccess,
}: ImportVotersDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    success: number;
    errors: string[];
    voters: Array<{ email: string; token: string }>;
  } | null>(null);
  const [showTokensDialog, setShowTokensDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        showToast.error('Please select a CSV file');
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !electionId) {
      showToast.error('Please select a file and election');
      return;
    }

    try {
      setIsLoading(true);
      setImportResult(null);

      const response = await api.voters.importCSV(electionId, selectedFile);

      if (response.status === 'success') {
        setImportResult(response.data);
        if (response.data.success > 0) {
          showToast.success(
            `Successfully imported ${response.data.success} voter${response.data.success !== 1 ? 's' : ''}!`
          );
          
          // Show tokens dialog if we have voters with tokens
          if (response.data.voters && response.data.voters.length > 0) {
            setShowTokensDialog(true);
          }
          
          onSuccess();
          
          // Only close if no errors or if user wants to proceed
          if (response.data.errors.length === 0) {
            setSelectedFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }
        } else {
          showToast.error('No voters were imported');
        }
      }
    } catch (error: any) {
      console.error('Failed to import voters:', error);
      showToast.error(
        error?.data?.message || error?.message || 'Failed to import voters'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Voters from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with voter emails. Each row should contain an email address.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileSelect}
                disabled={isLoading}
              />
            </div>
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{selectedFile.name}</span>
              </div>
            )}
          </div>

          {importResult && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p>
                    <strong>{importResult.success}</strong> voters imported successfully
                  </p>
                  {importResult.errors.length > 0 && (
                    <div>
                      <p className="font-semibold">
                        {importResult.errors.length} error(s):
                      </p>
                      <ul className="list-disc list-inside text-xs max-h-32 overflow-y-auto">
                        {importResult.errors.slice(0, 10).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {importResult.errors.length > 10 && (
                          <li>... and {importResult.errors.length - 10} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground">
            <p className="font-semibold mb-1">CSV Format:</p>
            <p>Expected format: One email per row</p>
            <pre className="mt-2 p-2 bg-muted rounded text-xs">
              email{'\n'}voter1@example.com{'\n'}voter2@example.com
            </pre>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !selectedFile || !electionId}
          >
            {isLoading ? (
              'Importing...'
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Voters
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      {importResult?.voters && importResult.voters.length > 0 && (
        <TokensDisplayDialog
          open={showTokensDialog}
          onOpenChange={(open) => {
            setShowTokensDialog(open);
            if (!open && importResult.errors.length === 0) {
              onOpenChange(false);
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }
          }}
          voters={importResult.voters}
        />
      )}
    </Dialog>
  );
}
