'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserMenu } from '@/components/layout/user-menu';
import { ChevronRight } from 'lucide-react';
import { CgMenuRight } from 'react-icons/cg';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { useSidebar } from './sidebar-provider';

interface HeaderProps {
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  };
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const getBreadcrumbs = (
  pathname: string,
  electionTitle?: string,
  electionId?: string,
  ballotTitle?: string,
  ballotId?: string
): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = [{ label: 'Admin', href: '/dashboard' }];

  if (pathname === '/dashboard') {
    return items;
  }

  if (pathname.startsWith('/dashboard/elections')) {
    items.push({ label: 'Elections', href: '/dashboard/elections' });

    if (pathname === '/dashboard/elections/new') {
      items.push({ label: 'New' });
    } else if (pathname.includes('/duplicate')) {
      items.push({ label: 'Duplicate' });
    } else if (pathname.includes('/results')) {
      const match = pathname.match(/\/dashboard\/elections\/([^/]+)\/results/);
      if (match && electionTitle) {
        items.push({
          label: electionTitle,
          href: electionId ? `/dashboard/elections/${electionId}` : undefined,
        });
        items.push({
          label: 'Results',
          href:
            ballotTitle && electionId
              ? `/dashboard/elections/${electionId}/results`
              : undefined,
        });
        if (ballotTitle && ballotId) {
          items.push({
            label: ballotTitle,
          });
        }
      }
    } else if (pathname !== '/dashboard/elections') {
      const match = pathname.match(/\/dashboard\/elections\/([^/]+)/);
      if (match && electionTitle) {
        items.push({
          label: electionTitle,
          href: electionId ? `/dashboard/elections/${electionId}` : undefined,
        });
      }
    }
  } else if (pathname === '/dashboard/voters') {
    items.push({ label: 'Voters' });
  } else if (pathname === '/dashboard/results') {
    items.push({ label: 'Results' });
  } else if (pathname === '/dashboard/audit') {
    items.push({ label: 'Audit Logs' });
  } else if (pathname === '/dashboard/settings') {
    items.push({ label: 'Settings' });
  }

  return items;
};

export function Header({ session }: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [electionTitle, setElectionTitle] = useState<string | undefined>();
  const [electionId, setElectionId] = useState<string | undefined>();
  const [ballotTitle, setBallotTitle] = useState<string | undefined>();
  const [ballotId, setBallotId] = useState<string | undefined>();

  useEffect(() => {
    let id: string | null = null;
    const ballotParam = searchParams.get('ballot');

    const match = pathname.match(/\/dashboard\/elections\/([^/]+)/);
    if (
      match &&
      !pathname.includes('/new') &&
      !pathname.includes('/duplicate')
    ) {
      id = match[1];
    }

    if (id) {
      setElectionId(id);
      api.elections
        .get(id)
        .then((response) => {
          if (response.status === 'success' && response.data?.election) {
            setElectionTitle(response.data.election.title);

            if (pathname.includes('/results') && ballotParam) {
              const ballot = response.data.election.ballots?.find(
                (b: { _id: string }) => String(b._id) === ballotParam
              );
              if (ballot) {
                setBallotTitle(ballot.title);
                setBallotId(ballotParam);
              } else {
                setBallotTitle(undefined);
                setBallotId(undefined);
              }
            } else {
              setBallotTitle(undefined);
              setBallotId(undefined);
            }
          }
        })
        .catch(() => {
          // silently fail
        });
    } else {
      setElectionTitle(undefined);
      setElectionId(undefined);
      setBallotTitle(undefined);
      setBallotId(undefined);
    }
  }, [pathname, searchParams]);

  const breadcrumbs = getBreadcrumbs(
    pathname,
    electionTitle,
    electionId,
    ballotTitle,
    ballotId
  );

  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-10 h-16 flex py-4 items-center border-b bg-background/70 backdrop-blur-sm">
      <div className="container-max flex w-full items-center justify-between px-6">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/dashboard" className="flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="Save Our Votes"
              width={120}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
          {breadcrumbs.map((item, index) => {
            const isElectionTitle = item.label === electionTitle;
            return (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`text-sm font-light text-muted-foreground hover:text-foreground transition-colors truncate ${
                      isElectionTitle ? 'max-w-[70px]' : 'max-w-[200px]'
                    }`}
                    title={item.label}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={`text-sm font-light truncate ${
                      isElectionTitle ? 'max-w-[70px]' : 'max-w-[200px]'
                    }`}
                    title={item.label}
                  >
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 min-w-0">
          <UserMenu user={session.user || {}} />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="md:hidden"
          >
            <CgMenuRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
