import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: categorias, error } = await supabase
    .from("categorias")
    .select("*")
    .eq("restaurante_id", user.id)
    .order("orden");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(categorias);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { nombre } = await request.json();
  if (!nombre) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

  const { data: max } = await supabase
    .from("categorias")
    .select("orden")
    .eq("restaurante_id", user.id)
    .order("orden", { ascending: false })
    .limit(1)
    .single();

  const { data, error } = await supabase
    .from("categorias")
    .insert({ restaurante_id: user.id, nombre, orden: (max?.orden ?? -1) + 1 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id, nombre } = await request.json();

  const { data, error } = await supabase
    .from("categorias")
    .update({ nombre })
    .eq("id", id)
    .eq("restaurante_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await request.json();

  const { error } = await supabase
    .from("categorias")
    .delete()
    .eq("id", id)
    .eq("restaurante_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
