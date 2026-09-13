"use server";

import { signOut } from "@/auth";

export async function signOutAction(formData?: FormData) {
  const redirectTo =
    typeof formData?.get("redirectTo") === "string"
      ? String(formData.get("redirectTo"))
      : "/";

  await signOut({ redirectTo });
}
