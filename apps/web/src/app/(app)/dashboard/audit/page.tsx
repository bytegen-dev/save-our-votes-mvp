import { requireAuth } from '@/lib/auth/middleware';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default async function AuditPage() {
  await requireAuth();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">
          View and track all system activities
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg mb-2">Audit logs coming soon</h3>
          <p className="text-sm text-muted-foreground text-center">
            Audit log functionality will be available in a future update
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
