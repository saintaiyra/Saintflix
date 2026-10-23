import { Suspense } from "react";
import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)] flex items-center justify-center"><div className="animate-pulse flex h-12 w-24 items-center justify-center rounded-full bg-[var(--primary)]" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}