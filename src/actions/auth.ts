"use server";

import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

async function upsertUserRecord(supabaseUser: { id: string; email?: string | null }) {
  if (!supabaseUser.email) {
    return null;
  }

  return prisma.user.upsert({
    where: { supabaseUserId: supabaseUser.id },
    update: {
      email: supabaseUser.email,
    },
    create: {
      email: supabaseUser.email,
      supabaseUserId: supabaseUser.id,
    },
  });
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await upsertUserRecord(data.user);
  }

  redirect("/");
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await upsertUserRecord(data.user);
  }

  if (!data.session) {
    return { success: "Check your email to confirm your account, then sign in." };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
