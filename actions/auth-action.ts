"use server";

import { authService, serviceCheckUser } from "../services/auth-service";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect("/auth/auth-error?message=Email and password are required");
  }

  await authService.signInWithEmail(email, password);
}

export async function register(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password) {
    redirect("/auth/auth-error?message=Email and password are required");
  }

  await authService.signUpNewUser(name, email, password);
}

export async function logout() {
  const result = await authService.signOut();
  return result;
}

export async function checkLogin() {
  const checkedUser = await serviceCheckUser();

  return checkedUser;
}
