import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/db";

export async function getCurrentAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getOrCreateCurrentUser() {
  const authUser = await getCurrentAuthUser();
  if (!authUser?.email) {
    return null;
  }

  return prisma.user.upsert({
    where: { supabaseUserId: authUser.id },
    update: {
      email: authUser.email,
    },
    create: {
      email: authUser.email,
      supabaseUserId: authUser.id,
    },
  });
}
