'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { ServiceBuilderHome } from '@/components/ServiceBuilderHome';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-[#e0e0e0]">Loading...</div>
      </div>
    );
  }

  // If not authenticated, don't render the component (will redirect)
  if (!user) {
    return null;
  }

  return <ServiceBuilderHome />;
}
