'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { showToast } from '@/lib/toast';
import Image from 'next/image';
import { AvatarCropDialog } from '@/components/settings/avatar-crop-dialog';

interface ElectionBrandingProps {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  onLogoChange: (url: string) => void;
  onPrimaryColorChange: (color: string) => void;
  onSecondaryColorChange: (color: string) => void;
}

export function ElectionBranding({
  logo,
  primaryColor = '#000000',
  secondaryColor = '#666666',
  onLogoChange,
  onPrimaryColorChange,
  onSecondaryColorChange,
}: ElectionBrandingProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (SVG doesn't need cropping)
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/svg+xml',
      'image/webp',
    ];
    if (!allowedTypes.includes(file.type)) {
      showToast.error(
        'Invalid file type. Only PNG, JPEG, JPG, SVG, and WEBP are allowed.'
      );
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showToast.error('File size exceeds 5MB limit');
      return;
    }

    // SVG files don't need cropping, upload directly
    if (file.type === 'image/svg+xml') {
      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/elections/upload-logo', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to upload logo');
        }

        const data = await response.json();
        onLogoChange(data.url);
        showToast.success('Logo uploaded successfully!');
      } catch (error: any) {
        console.error('Failed to upload logo:', error);
        showToast.error(error?.message || 'Failed to upload logo');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
      return;
    }

    // For other image types, show crop dialog
    const previewUrl = URL.createObjectURL(file);
    setImageToCrop(previewUrl);
    setCropDialogOpen(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedImageUrl: string) => {
    try {
      setIsUploading(true);

      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'logo.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/elections/upload-logo', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || 'Failed to upload logo');
      }

      const data = await uploadResponse.json();
      onLogoChange(data.url);
      showToast.success('Logo uploaded successfully!');

      if (imageToCrop && imageToCrop.startsWith('blob:')) {
        URL.revokeObjectURL(imageToCrop);
      }
      setImageToCrop(null);
    } catch (error: any) {
      console.error('Failed to upload logo:', error);
      showToast.error(error?.message || 'Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    onLogoChange('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Branding</h3>
        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              {logo ? (
                <div className="relative">
                  <div className="relative w-24 h-24 border rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={logo}
                      alt="Election logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={handleRemoveLogo}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="logo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading
                    ? 'Uploading...'
                    : logo
                    ? 'Change Logo'
                    : 'Upload Logo'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPEG, JPG, SVG, or WEBP (max 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Color Theme Selectors */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => onPrimaryColorChange(e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => onPrimaryColorChange(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="secondary-color"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => onSecondaryColorChange(e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => onSecondaryColorChange(e.target.value)}
                  placeholder="#666666"
                  className="flex-1"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                />
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div
              className="p-6 rounded-lg border"
              style={{
                backgroundColor: primaryColor || '#000000',
                color: secondaryColor || '#ffffff',
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                {logo && (
                  <div className="relative w-12 h-12">
                    <Image
                      src={logo}
                      alt="Preview logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: secondaryColor || '#ffffff' }}
                  >
                    Election Title
                  </h3>
                  <p className="text-sm opacity-90">Preview of your branding</p>
                </div>
              </div>
              <div className="space-y-2">
                <div
                  className="px-4 py-2 rounded"
                  style={{
                    backgroundColor: secondaryColor || '#666666',
                    color: primaryColor || '#000000',
                  }}
                >
                  Sample Button
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {imageToCrop && (
        <AvatarCropDialog
          open={cropDialogOpen}
          onOpenChange={setCropDialogOpen}
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          title="Crop Election Logo"
          description="Adjust and crop your logo to make it square"
        />
      )}
    </div>
  );
}
