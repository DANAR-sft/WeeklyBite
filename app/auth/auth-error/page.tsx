"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const message = searchParams?.get("message");
  return (
    <div className="flex justify-center items-center w-full h-200">
      <div className="flex flex-col justify-center items-center h-full w-[50%] gap-4 text-black">
        <Image src="/close.png" alt="close icon" width={100} height={100} />
        <h2>Authentication Error</h2>
        {message ? (
          <p className="text-sm text-red-600">{message}</p>
        ) : (
          <p>Please try logging in again.</p>
        )}
        {message?.toLowerCase().includes("register") ? (
          <p>
            <Link href="/auth/register">Go to Register</Link>
          </p>
        ) : (
          <p>
            <Link href="/auth/login">Go to Login</Link>
          </p>
        )}
      </div>
    </div>
  );
}
