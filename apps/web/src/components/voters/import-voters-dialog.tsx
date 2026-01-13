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
  } | null>(null);
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
        if (response.data.errors.length === 0) {
          showToast.success(
            `Successfully imported ${response.data.success} voters!`
          );
          onSuccess();
          onOpenChange(false);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          showToast.warning(
            `Imported ${response.data.success} voters with ${response.data.errors.length} errors`
          );
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
    </Dialog>
  );
}
