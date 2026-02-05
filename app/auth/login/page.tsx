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
import { login } from "../../../actions/auth-action";
import { useAuth } from "../../../src/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { setIsLogin } = useAuth();
  const router = useRouter();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await login(formData);

      setIsLogin(true);
      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-screen grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch min-h-screen">
        {/* Left visual panel (hidden on mobile) */}
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

        {/* Right form panel */}
        <div className="flex items-center justify-center h-screen">
          <Card className="w-full text-[#004b23] h-full flex flex-col justify-center rounded-none md:p-50">
            <CardHeader className="md:px-10">
              <CardTitle className="text-3xl text-[#004b23]">
                Login to your account
              </CardTitle>
              <CardDescription className="text-gray-600">
                Enter your email below to login to your account
              </CardDescription>
              <CardAction>
                <Button variant="link" asChild>
                  <Link href="/auth/register" className="text-[#007200]">
                    Sign up
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>

            <form onSubmit={handleLogin}>
              <CardContent className="px-6 md:px-10">
                <div className="flex flex-col gap-6">
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
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex-col gap-2 px-6 md:px-10">
                <Button
                  type="submit"
                  className="w-full bg-[#007200] hover:bg-[#70e000] text-white hover:text-[#004b23] font-semibold h-10"
                >
                  Login
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
