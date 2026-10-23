"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

export default function ProtectedRoute({ children, requireProfile = true }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, selectedProfile, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        const callbackUrl = encodeURIComponent(pathname);
        router.push(`/auth/login?callbackUrl=${callbackUrl}`);
      } else if (requireProfile && !selectedProfile && (user?.profiles?.length ?? 0) > 0) {
        router.push("/profiles");
      } else if (requireProfile && (user?.profiles?.length ?? 0) === 0) {
        router.push("/profiles");
      }
    }
  }, [isAuthenticated, isLoading, selectedProfile, user, pathname, router, requireProfile]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-pulse flex h-12 w-24 items-center justify-center rounded-full bg-[var(--primary)]" />
      </main>
    );
  }

  if (!isAuthenticated || (requireProfile && !selectedProfile)) {
    return null;
  }

  return <>{children}</>;
}