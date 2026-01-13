import { requireAuth } from '@/lib/auth/middleware';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SettingsClient } from './settings-client';

export default async function SettingsPage() {
  const session = await requireAuth();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <SettingsClient user={session.user || {}} />
    </div>
  );
}
