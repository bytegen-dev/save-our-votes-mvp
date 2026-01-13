'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { User, Mail, Upload, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showToast } from '@/lib/toast';
import { authClient } from '@/lib/auth/client';
import { AvatarCropDialog } from '@/components/settings/avatar-crop-dialog';

interface SettingsClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [avatar, setAvatar] = useState<string | null>(user.image || null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null
  );
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user.name !== undefined) {
      setName(user.name || '');
    }
    if (user.email !== undefined) {
      setEmail(user.email || '');
    }
    if (user.image !== undefined) {
      setAvatar(user.image || null);
    }
  }, [user.name, user.email, user.image]);

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    const response = await fetch(croppedImageUrl);
    const blob = await response.blob();
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

    setSelectedAvatarFile(file);
    setAvatar(croppedImageUrl);
    setImageToCrop(null);

    if (imageToCrop && imageToCrop.startsWith('blob:')) {
      URL.revokeObjectURL(imageToCrop);
    }
  };

  const handleUpdateDetails = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      if (selectedAvatarFile) {
        const formData = new FormData();
        formData.append('avatar', selectedAvatarFile);

        const avatarResponse = await fetch('/api/auth/update-avatar', {
          method: 'POST',
          body: formData,
        });

        if (!avatarResponse.ok) {
          const error = await avatarResponse.json();
          throw new Error(error.message || 'Failed to upload avatar');
        }

        const avatarData = await avatarResponse.json();
        setAvatar(avatarData.data?.image || null);
        setSelectedAvatarFile(null);
      }

      showToast.success('Profile updated successfully!');

      if (selectedAvatarFile) {
        setSelectedAvatarFile(null);
      }

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      showToast.error(error?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast.error('All password fields are required');
      return;
    }

    if (newPassword.length < 8) {
      showToast.error('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast.error('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      showToast.error('New password must be different from current password');
      return;
    }

    try {
      setIsChangingPassword(true);
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }

      showToast.success('Password changed successfully! Please sign in again.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      await authClient.signOut();
      setTimeout(() => {
        router.push('/signin');
      }, 1000);
    } catch (error: any) {
      console.error('Failed to change password:', error);
      showToast.error(error?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Update Details</CardTitle>
              <CardDescription>
                Update your name, email address, and profile photo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Photo</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={avatar || user.image || undefined}
                        alt={name || user.name || 'User'}
                      />
                      <AvatarFallback>
                        {name || user.name
                          ? (name || user.name || '')
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)
                          : (email || user.email || '')?.[0]?.toUpperCase() ||
                            'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <Upload className="h-3 w-3" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/heic"
                      onChange={handleAvatarSelect}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Click the upload button to change your profile photo
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, JPEG, or HEIC (max 5MB)
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <Button onClick={handleUpdateDetails} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the appearance of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred theme
                  </p>
                </div>
                <Select
                  value={theme}
                  onValueChange={(value) => setTheme(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="currentPassword"
                  className="flex items-center gap-2"
                >
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="newPassword"
                  className="flex items-center gap-2"
                >
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters long
                </p>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="flex items-center gap-2"
                >
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {imageToCrop && (
        <AvatarCropDialog
          open={cropDialogOpen}
          onOpenChange={(open) => {
            setCropDialogOpen(open);
            if (!open && imageToCrop) {
              URL.revokeObjectURL(imageToCrop);
              setImageToCrop(null);
            }
          }}
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
}
