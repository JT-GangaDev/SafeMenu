import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: platos, error } = await supabase
    .from("platos")
    .select("*")
    .eq("restaurante_id", user.id)
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(platos);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();

  const { data, error } = await supabase
    .from("platos")
    .insert({
      restaurante_id: user.id,
      categoria_id: body.categoria_id,
      nombre: body.nombre,
      descripcion: body.descripcion,
      precio: body.precio,
      contiene_gluten: body.contiene_gluten ?? false,
      contiene_crustaceos: body.contiene_crustaceos ?? false,
      contiene_huevos: body.contiene_huevos ?? false,
      contiene_pescado: body.contiene_pescado ?? false,
      contiene_cacahuetes: body.contiene_cacahuetes ?? false,
      contiene_soja: body.contiene_soja ?? false,
      contiene_leche: body.contiene_leche ?? false,
      contiene_frutos_cascara: body.contiene_frutos_cascara ?? false,
      contiene_apio: body.contiene_apio ?? false,
      contiene_mostaza: body.contiene_mostaza ?? false,
      contiene_sesamo: body.contiene_sesamo ?? false,
      contiene_sulfitos: body.contiene_sulfitos ?? false,
      contiene_altramuces: body.contiene_altramuces ?? false,
      contiene_moluscos: body.contiene_moluscos ?? false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();

  const { data, error } = await supabase
    .from("platos")
    .update({
      nombre: body.nombre,
      descripcion: body.descripcion,
      precio: body.precio,
      categoria_id: body.categoria_id,
      contiene_gluten: body.contiene_gluten,
      contiene_crustaceos: body.contiene_crustaceos,
      contiene_huevos: body.contiene_huevos,
      contiene_pescado: body.contiene_pescado,
      contiene_cacahuetes: body.contiene_cacahuetes,
      contiene_soja: body.contiene_soja,
      contiene_leche: body.contiene_leche,
      contiene_frutos_cascara: body.contiene_frutos_cascara,
      contiene_apio: body.contiene_apio,
      contiene_mostaza: body.contiene_mostaza,
      contiene_sesamo: body.contiene_sesamo,
      contiene_sulfitos: body.contiene_sulfitos,
      contiene_altramuces: body.contiene_altramuces,
      contiene_moluscos: body.contiene_moluscos,
    })
    .eq("id", body.id)
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
    .from("platos")
    .delete()
    .eq("id", id)
    .eq("restaurante_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
