import { createClient } from "@/lib/supabase/server";
import { ALERGENOS } from "@/lib/alergenos";
import type { Restaurante, Categoria, Plato } from "@/lib/types";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PublicMenu({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: restaurante } = await supabase
    .from("restaurantes")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!restaurante) notFound();

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

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#fafafa", fontFamily: "var(--font-sans)" }}
    >
      <header
        className="sticky top-0 z-10 shadow-sm"
        style={{ backgroundColor: restaurante.color_principal || "#FF5733" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          {restaurante.logo_url && (
            <img src={restaurante.logo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
          )}
          <h1 className="text-xl font-bold text-white">{restaurante.nombre}</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {(categorias ?? []).map((categoria) => {
          const platosCategoria = (platos ?? []).filter(
            (p) => p.categoria_id === categoria.id
          );
          if (platosCategoria.length === 0) return null;

          return (
            <section key={categoria.id}>
              <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                {categoria.nombre}
              </h2>
              <div className="space-y-3">
                {platosCategoria.map((plato) => (
                  <PlatoCard key={plato.id} plato={plato} />
                ))}
              </div>
            </section>
          );
        })}

        {(categorias ?? []).length === 0 && (
          <p className="text-center text-gray-400 py-12">Menú en preparación</p>
        )}
      </main>

      <footer className="text-center py-6 text-xs text-gray-400">
        Menú generado con SafeMenu
      </footer>
    </div>
  );
}

function PlatoCard({ plato }: { plato: Plato }) {
  const alergenosActivos = ALERGENOS.filter((a) => plato[a.key]);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-4">
        {plato.imagen_url && (
          <img src={plato.imagen_url} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900">{plato.nombre}</h3>
          {plato.descripcion && (
            <p className="text-sm text-gray-500 mt-1">{plato.descripcion}</p>
          )}
          {alergenosActivos.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {alergenosActivos.map((a) => (
                <span
                  key={a.key}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full"
                  title={a.label}
                >
                  <span>{a.icon}</span>
                  <span>{a.label}</span>
                </span>
              ))}
            </div>
          )}
        </div>
        <span className="text-lg font-bold text-gray-900 whitespace-nowrap">
          {plato.precio.toFixed(2)}€
        </span>
      </div>
    </div>
  );
}
