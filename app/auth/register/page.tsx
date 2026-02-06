"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { register } from "../../../actions/auth-action";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

function RegisterForm() {
  const router = useRouter();
  const { setIsLogin, refreshAuth, getUser } = useAuth();
  const searchParams = useSearchParams();
  const message = searchParams?.get("message");
  const [showMessage, setShowMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  async function handleRegister(e: React.SubmitEvent<HTMLFormElement>) {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await register(formData);
      await refreshAuth();
      await getUser();
      setIsLogin(true);
      setLoading(false);
      router.push("/");
    } catch (error) {
      setShowMessage(true);
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-screen grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch min-h-screen">
        <div className="hidden md:block w-full h-screen overflow-hidden relative shadow-lg">
          <div
            className="absolute inset-0 bg-cover bg-center h-full w-full"
            style={{ backgroundImage: "url('/mealprep4.jpg')" }}
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/20 to-transparent" />

          <div className="absolute bottom-8 left-8 text-white max-w-xs">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Capturing Moments,
            </h2>
            <p className="mt-2 text-sm sm:text-base">Creating Memories</p>
          </div>
        </div>

        <div className="relative flex items-center justify-center h-screen bg-white">
          {message && showMessage && (
            <div className="absolute top-4 right-4 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-md shadow-sm flex items-center gap-1">
              <div className="text-sm leading-tight">{message}</div>
              <button
                type="button"
                aria-label="Close message"
                onClick={() => setShowMessage(false)}
                className="p-1 rounded hover:cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
              >
                <span className="text-red-700 text-base">×</span>
              </button>
            </div>
          )}
          <Card className="w-full text-[#004b23] h-full flex flex-col justify-center rounded-none md:p-50">
            <CardHeader className="md:px-10">
              <CardTitle className="text-3xl text-[#004b23]">
                Create your account
              </CardTitle>
              <CardDescription className="text-gray-600">
                Enter your name and email below to create your account
              </CardDescription>
              <CardAction>
                <Button variant="link" asChild>
                  <Link href="/auth/login" className="text-[#007200]">
                    Sign in
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="px-6 md:px-10">
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-gray-700">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your name"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-gray-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="grid gap-2 mb-5">
                    <div className="flex items-center">
                      <Label htmlFor="password" className="text-gray-700">
                        Password
                      </Label>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2 px-6 md:px-10">
                <Button
                  type="submit"
                  className="w-full bg-[#007200] hover:bg-[#70e000] hover:text-[#004b23] h-10"
                  isLoading={loading}
                  loadingText="Creating account..."
                >
                  Create Account
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
