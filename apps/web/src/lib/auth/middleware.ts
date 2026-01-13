import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { getAuth } from './config';

export async function requireAuth() {
  const auth = await getAuth();
  const headersList = await headers();
  const cookieStore = await cookies();
  
  // Build headers object with cookies
  const headersObj: Record<string, string> = {};
  headersList.forEach((value, key) => {
    headersObj[key] = value;
  });
  
  // Add cookie header if cookies exist
  const cookieHeader = cookieStore.toString();
  if (cookieHeader) {
    headersObj['cookie'] = cookieHeader;
  }

  const session = await auth.api.getSession({ 
    headers: headersObj as any 
  });
  
  if (!session) {
    redirect('/signin');
  }

  return session;
}
