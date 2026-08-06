import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  const { data: restaurante } = await supabase
    .from("restaurantes")
    .select("*")
    .eq("id", user.id)
    .single();

  return NextResponse.json({ user, restaurante });
}
