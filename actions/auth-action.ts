"use server";

import { authService, serviceCheckUser } from "../services/auth-service";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  await authService.signInWithEmail(email, password);
}

export async function register(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

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
