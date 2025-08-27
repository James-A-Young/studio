
"use client";
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, Users, Settings } from 'lucide-react'
import Link from 'next/link'
import { useSession, SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function DashboardPageWrapper() {
  return (
    <SessionProvider>
      <DashboardPage />
    </SessionProvider>
  );
}


import React, { useState } from 'react';

function DashboardPage() {
  const { data: session, status } = useSession();
  const [clubs, setClubs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (status === 'authenticated') {
      setLoading(true);
      fetch('/api/clubs/foruser')
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to fetch clubs');
          return res.json();
        })
        .then(data => {
          setClubs(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [status]);

  if (status === "loading" || loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Welcome back, {session?.user?.name}!</h1>
        <p className="text-muted-foreground">Here's an overview of your clubs and activities.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>My Clubs</CardTitle>
            <CardDescription>Clubs you are a member or manager of.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {clubs.length === 0 ? (
                <li className="text-muted-foreground">You are not a member of any clubs yet.</li>
              ) : (
                clubs.map(club => (
                  <li key={club._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-semibold">{club.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {club.roles && club.roles.length > 0
                          ? club.roles.map((r: any) => r.role).join(', ')
                          : club.memberships && club.memberships.length > 0
                            ? 'Member'
                            : ''}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/clubs/${club._id}`}>Manage</Link>
                    </Button>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader>
                <PlusCircle className="h-8 w-8 text-accent mb-2" />
                <CardTitle>Create a New Club</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Start a new community and invite members to join.</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/dashboard/clubs/create">Create Club</Link>
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
                <Users className="h-8 w-8 text-accent mb-2" />
                <CardTitle>Join a Club</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Find and request to join existing clubs.</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/clubs">Browse Clubs</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
