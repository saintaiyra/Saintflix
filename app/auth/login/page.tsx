import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)] flex items-center justify-center"><div className="animate-pulse flex h-12 w-24 items-center justify-center rounded-full bg-[var(--primary)]" /></div>}>
      <LoginForm />
    </Suspense>
  );
}