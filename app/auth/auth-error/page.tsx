"use client";

import Image from "next/image";
import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="flex justify-center items-center w-full h-200">
      <div className="flex flex-col justify-center items-center h-full w-[50%] gap-4 text-black">
        <Image src="/close.png" alt="close icon" width={100} height={100} />
        <h2>Authentication Error</h2>
        <p>Please try logging in again.</p>
        <p>
          <Link href="/auth/register">Go to Register</Link>
        </p>
      </div>
    </div>
  );
}
