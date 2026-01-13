'use client';

import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Upload, X } from 'lucide-react';
import { AvatarCropDialog } from '@/components/settings/avatar-crop-dialog';
import { showToast } from '@/lib/toast';

interface CandidateOptionInputProps {
  value: {
    text: string;
    order: number;
    photo?: string;
    bio?: string;
  };
  onChange: (value: {
    text: string;
    order: number;
    photo?: string;
    bio?: string;
  }) => void;
  onRemove?: () => void;
  index: number;
  canRemove: boolean;
}

export function CandidateOptionInput({
  value,
  onChange,
  onRemove,
  index,
  canRemove,
}: CandidateOptionInputProps) {
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/heic'];
    if (!allowedTypes.includes(file.type)) {
      showToast.error('Only PNG, JPG, JPEG, or HEIC images are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast.error('Image size must be less than 5MB');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImageToCrop(previewUrl);
    setCropDialogOpen(true);
  };

  const handleCropComplete = async (croppedImageUrl: string) => {
    try {
      setIsUploading(true);

      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'candidate.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('photo', file);

      const uploadResponse = await fetch('/api/candidates/upload-photo', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.message || 'Failed to upload photo');
      }

      const data = await uploadResponse.json();
      onChange({
        ...value,
        photo: data.data?.photo || croppedImageUrl,
      });

      if (imageToCrop && imageToCrop.startsWith('blob:')) {
        URL.revokeObjectURL(imageToCrop);
      }
      setImageToCrop(null);
    } catch (error: any) {
      console.error('Failed to upload photo:', error);
      showToast.error(error?.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    onChange({
      ...value,
      photo: undefined,
    });
  };

  return (
    <>
      <div className="space-y-3 p-4 border rounded-lg">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {value.photo ? (
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={value.photo} alt={value.text || `Candidate ${index + 1}`} />
                  <AvatarFallback>
                    {value.text?.[0]?.toUpperCase() || 'C'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={handleRemovePhoto}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/heic"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-20 w-20"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Upload className="h-6 w-6" />
                  )}
                </Button>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <Label htmlFor={`option-${index}-text`}>Candidate Name *</Label>
              <Input
                id={`option-${index}-text`}
                placeholder={`Candidate ${index + 1}`}
                value={value.text}
                onChange={(e) =>
                  onChange({
                    ...value,
                    text: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor={`option-${index}-bio`}>Bio</Label>
              <Textarea
                id={`option-${index}-bio`}
                placeholder="Optional candidate bio or description..."
                rows={3}
                value={value.bio || ''}
                onChange={(e) =>
                  onChange({
                    ...value,
                    bio: e.target.value,
                  })
                }
              />
            </div>
          </div>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="mt-0"
            >
              <X className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </div>

      <AvatarCropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        imageSrc={imageToCrop || ''}
        onCropComplete={handleCropComplete}
        title="Crop Candidate Photo"
        description="Adjust and crop the candidate's photo to make it square"
      />
    </>
  );
}
