import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

export async function POST(request: Request) {
  const { descripcion } = await request.json();

  if (!descripcion) {
    return NextResponse.json({ error: "Descripción requerida" }, { status: 400 });
  }

  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un experto en seguridad alimentaria y nutrición. Analiza descripciones de platos e identifica los 14 alérgenos según normativa UE.

Los 14 alérgenos son: gluten, crustaceos, huevos, pescado, cacahuetes, soja, leche, frutos_cascara, apio, mostaza, sesamo, sulfitos, altramuces, moluscos.

Devuelve exclusivamente un objeto JSON con estos campos como booleanos (true/false). Los nombres de los campos van con guion bajo. Sin texto adicional.`,
        },
        {
          role: "user",
          content: `Plato a analizar: "${descripcion}"`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Respuesta vacía de la IA" }, { status: 500 });
    }

    const alergenos = JSON.parse(content);
    return NextResponse.json(alergenos);
  } catch {
    return NextResponse.json({ error: "Error al procesar con IA" }, { status: 500 });
  }
}
