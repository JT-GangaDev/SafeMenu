"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Restaurante, Categoria, Plato } from "@/lib/types";
import { ALERGENOS } from "@/lib/alergenos";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [restaurante, setRestaurante] = useState<Restaurante | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/user")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login");
          return;
        }
        setUser(data.user);
        setRestaurante(data.restaurante);
      });
  }, [router]);

  const loadRestaurante = useCallback(async () => {
    const res = await fetch("/api/restaurantes");
    if (res.ok) setRestaurante(await res.json());
  }, []);

  const loadData = useCallback(async () => {
    const [catRes, plaRes] = await Promise.all([
      fetch("/api/categorias"),
      fetch("/api/platos"),
    ]);
    if (catRes.ok) setCategorias(await catRes.json());
    if (plaRes.ok) setPlatos(await plaRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{restaurante?.nombre || "SafeMenu"}</h1>
          <p className="text-sm text-gray-500">Panel de control</p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`/${restaurante?.slug}`}
            target="_blank"
            className="text-sm text-blue-600 hover:underline"
          >
            Ver menú público
          </a>
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <PerfilRestaurante restaurante={restaurante} onUpdate={loadRestaurante} />
          <QRGenerator slug={restaurante?.slug} />
          <CategoriasManager
            categorias={categorias}
            onUpdate={loadData}
            restauranteId={restaurante?.id}
          />
          <PlatosManager
            platos={platos}
            categorias={categorias}
            onUpdate={loadData}
            restauranteId={restaurante?.id}
          />
        </div>
      </div>
    </div>
  );
}

function PerfilRestaurante({
  restaurante,
  onUpdate,
}: {
  restaurante: Restaurante | null;
  onUpdate: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(restaurante?.nombre ?? "");
  const [color, setColor] = useState(restaurante?.color_principal ?? "#FF5733");
  const [logoUrl, setLogoUrl] = useState(restaurante?.logo_url ?? "");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (restaurante) {
      setNombre(restaurante.nombre);
      setColor(restaurante.color_principal);
      setLogoUrl(restaurante.logo_url ?? "");
    }
  }, [restaurante]);

  const handleGuardar = async () => {
    setGuardando(true);
    setMensaje("");
    const res = await fetch("/api/restaurantes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, color_principal: color, logo_url: logoUrl || null }),
    });
    if (res.ok) {
      setMensaje("Guardado");
      setEditando(false);
      onUpdate();
    } else {
      setMensaje("Error al guardar");
    }
    setGuardando(false);
    setTimeout(() => setMensaje(""), 3000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok && data.url) {
      setLogoUrl(data.url);
    }
  };

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Perfil del Restaurante</h2>
        {!editando && (
          <button
            onClick={() => setEditando(true)}
            className="text-sm px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Editar
          </button>
        )}
      </div>

      {editando ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Color principal</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border"
              />
              <span className="text-sm text-gray-500">{color}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Logo</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="URL del logo..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <span className="text-xs text-gray-400">o</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-sm"
              />
            </div>
            {logoUrl && (
              <img src={logoUrl} alt="Logo preview" className="mt-2 w-16 h-16 rounded-lg object-cover" />
            )}
          </div>
          {mensaje && (
            <p className={`text-sm ${mensaje === "Guardado" ? "text-green-600" : "text-red-600"}`}>
              {mensaje}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleGuardar}
              disabled={guardando}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={() => { setEditando(false); setMensaje(""); }}
              className="px-4 py-2 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {restaurante?.logo_url && (
            <img src={restaurante.logo_url} alt="Logo" className="w-14 h-14 rounded-lg object-cover" />
          )}
          <div>
            <p className="font-medium">{restaurante?.nombre}</p>
            <p className="text-sm text-gray-500">
              Slug: /{restaurante?.slug}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: restaurante?.color_principal }}
              />
              <span className="text-xs text-gray-400">{restaurante?.color_principal}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QRGenerator({ slug }: { slug?: string }) {
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    import("qrcode").then((QRCode) => {
      const url = `${window.location.origin}/${slug}`;
      QRCode.toDataURL(url, { width: 400, margin: 2 }).then(setQr);
    });
  }, [slug]);

  if (!qr) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = `menu-${slug}.png`;
    link.href = qr;
    link.click();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border p-6">
      <h2 className="text-lg font-semibold mb-4">Código QR del Menú</h2>
      <div className="flex items-center gap-6">
        <img src={qr} alt="QR del menú" className="w-32 h-32" />
        <div className="space-y-2">
          <button
            onClick={handleDownload}
            className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Descargar QR
          </button>
          <button
            onClick={handleCopy}
            className="block px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
          >
            {copied ? "Copiado!" : "Copiar URL"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoriasManager({
  categorias,
  onUpdate,
}: {
  categorias: Categoria[];
  onUpdate: () => void;
  restauranteId?: string;
}) {
  const [nueva, setNueva] = useState("");

  const crear = async () => {
    if (!nueva.trim()) return;
    await fetch("/api/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nueva.trim() }),
    });
    setNueva("");
    onUpdate();
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    await fetch("/api/categorias", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    onUpdate();
  };

  return (
    <div className="bg-white rounded-xl border p-6">
      <h2 className="text-lg font-semibold mb-4">Categorías</h2>
      <div className="flex gap-2 mb-4">
        <input
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          placeholder="Nueva categoría..."
          className="flex-1 px-3 py-2 border rounded-lg text-sm"
          onKeyDown={(e) => e.key === "Enter" && crear()}
        />
        <button onClick={crear} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          Añadir
        </button>
      </div>
      <div className="space-y-1">
        {categorias.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">{cat.nombre}</span>
            <button
              onClick={() => eliminar(cat.id)}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Eliminar
            </button>
          </div>
        ))}
        {categorias.length === 0 && (
          <p className="text-sm text-gray-400">Sin categorías aún</p>
        )}
      </div>
    </div>
  );
}

function PlatosManager({
  platos,
  categorias,
  onUpdate,
}: {
  platos: Plato[];
  categorias: Categoria[];
  onUpdate: () => void;
  restauranteId?: string;
}) {
  const [editando, setEditando] = useState<Plato | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [detectando, setDetectando] = useState(false);

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar este plato?")) return;
    await fetch("/api/platos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    onUpdate();
  };

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Platos</h2>
        <button
          onClick={() => { setEditando(null); setMostrarForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          + Nuevo plato
        </button>
      </div>

      {(mostrarForm || editando) && (
        <PlatoForm
          plato={editando}
          categorias={categorias}
          onClose={() => { setMostrarForm(false); setEditando(null); }}
          onSaved={onUpdate}
          detectando={detectando}
          setDetectando={setDetectando}
        />
      )}

      <div className="space-y-2">
        {platos.map((plato) => {
          const cat = categorias.find((c) => c.id === plato.categoria_id);
          const alergenosActivos = ALERGENOS.filter((a) => plato[a.key]);
          return (
            <div key={plato.id} className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-lg">
              {plato.imagen_url && (
                <img src={plato.imagen_url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{plato.nombre}</span>
                  <span className="text-xs text-gray-400">{cat?.nombre}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1">{plato.descripcion}</p>
                <div className="flex gap-0.5 mt-1">
                  {alergenosActivos.map((a) => (
                    <span key={a.key} title={a.label}>{a.icon}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-semibold">{plato.precio.toFixed(2)}€</span>
                <button
                  onClick={() => { setEditando(plato); setMostrarForm(true); }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminar(plato.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
        {platos.length === 0 && !mostrarForm && (
          <p className="text-sm text-gray-400">Sin platos aún</p>
        )}
      </div>
    </div>
  );
}

function PlatoForm({
  plato,
  categorias,
  onClose,
  onSaved,
  detectando,
  setDetectando,
}: {
  plato: Plato | null;
  categorias: Categoria[];
  onClose: () => void;
  onSaved: () => void;
  detectando: boolean;
  setDetectando: (v: boolean) => void;
}) {
  const [nombre, setNombre] = useState(plato?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(plato?.descripcion ?? "");
  const [precio, setPrecio] = useState(plato?.precio ?? 0);
  const [categoriaId, setCategoriaId] = useState(plato?.categoria_id ?? categorias[0]?.id ?? "");
  const [imagenUrl, setImagenUrl] = useState(plato?.imagen_url ?? "");
  const [subiendoImg, setSubiendoImg] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const [alergenos, setAlergenos] = useState<Record<string, boolean>>(() => {
    if (plato) {
      const a: Record<string, boolean> = {};
      ALERGENOS.forEach((al) => { a[al.key] = plato[al.key] as boolean; });
      return a;
    }
    const a: Record<string, boolean> = {};
    ALERGENOS.forEach((al) => { a[al.key] = false; });
    return a;
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoImg(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok && data.url) setImagenUrl(data.url);
    setSubiendoImg(false);
  };

  const detectarAlergenos = async () => {
    if (!descripcion.trim()) return;
    setDetectando(true);
    try {
      const res = await fetch("/api/platos/detectar-alergenos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion }),
      });
      const data = await res.json();
      if (!data.error) {
        const nuevos = { ...alergenos };
        ALERGENOS.forEach((al) => {
          const key = al.key.replace("contiene_", "");
          if (data[key] !== undefined) {
            nuevos[al.key] = data[key];
          }
        });
        setAlergenos(nuevos);
      }
    } catch {
      console.error("Error detectando alérgenos");
    }
    setDetectando(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      ...(plato ? { id: plato.id } : {}),
      nombre,
      descripcion,
      precio,
      categoria_id: categoriaId,
      imagen_url: imagenUrl || null,
      ...alergenos,
    };

    const res = await fetch(`/api/platos`, {
      method: plato ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      onSaved();
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-xl bg-gray-50 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Precio (€)</label>
          <input
            type="number"
            step="0.01"
            value={precio}
            onChange={(e) => setPrecio(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Categoría</label>
        <select
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm"
          required
        >
          <option value="">Seleccionar...</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium">Descripción</label>
          <button
            type="button"
            onClick={detectarAlergenos}
            disabled={detectando || !descripcion.trim()}
            className="text-xs px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {detectando ? "Detectando..." : "Detectar alérgenos con IA"}
          </button>
        </div>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm"
          rows={3}
          placeholder="Ej: Tarta de queso casera con base de galleta Lotus y mermelada de arándanos"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Imagen del plato</label>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={imagenUrl}
            onChange={(e) => setImagenUrl(e.target.value)}
            placeholder="URL de la imagen..."
            className="flex-1 px-3 py-2 border rounded-lg text-sm"
          />
          <span className="text-xs text-gray-400">o</span>
          <input
            ref={imgInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-sm"
            disabled={subiendoImg}
          />
          {subiendoImg && <span className="text-xs text-gray-500">Subiendo...</span>}
        </div>
        {imagenUrl && (
          <img src={imagenUrl} alt="Preview" className="mt-2 w-20 h-20 rounded-lg object-cover" />
        )}
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Alérgenos detectados</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {ALERGENOS.map((al) => (
            <label key={al.key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={alergenos[al.key]}
                onChange={(e) => setAlergenos({ ...alergenos, [al.key]: e.target.checked })}
                className="rounded"
              />
              <span>{al.icon}</span>
              <span>{al.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          {plato ? "Guardar cambios" : "Crear plato"}
        </button>
      </div>
    </form>
  );
}
