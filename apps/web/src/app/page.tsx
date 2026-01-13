import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <div className="flex justify-center mb-4">
          <Image
            src="/logo.png"
            alt="Save Our Votes"
            width={300}
            height={100}
            className="h-auto w-auto max-w-md"
            priority
          />
        </div>
        <p className="text-lg text-muted-foreground">E-voting platform</p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
