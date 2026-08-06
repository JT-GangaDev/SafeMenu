import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Slug requerido" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: restaurante, error: restError } = await supabase
    .from("restaurantes")
    .select("*")
    .eq("slug", slug)
    .single();

  if (restError || !restaurante) {
    return NextResponse.json({ error: "Restaurante no encontrado" }, { status: 404 });
  }

  const { data: categorias } = await supabase
    .from("categorias")
    .select("*")
    .eq("restaurante_id", restaurante.id)
    .order("orden");

  const { data: platos } = await supabase
    .from("platos")
    .select("*")
    .eq("restaurante_id", restaurante.id)
    .order("created_at");

  return NextResponse.json({
    restaurante,
    categorias: categorias ?? [],
    platos: platos ?? [],
  });
}
