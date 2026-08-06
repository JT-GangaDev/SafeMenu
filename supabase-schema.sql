-- Esquema SafeMenu para Supabase (PostgreSQL)

-- 1. Tabla de Restaurantes (Inquilinos)
CREATE TABLE restaurantes (
    id UUID PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    logo_url TEXT,
    color_principal VARCHAR(7) DEFAULT '#FF5733',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabla de Categorías
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurante_id UUID REFERENCES restaurantes(id) ON DELETE CASCADE,
    nombre VARCHAR(50) NOT NULL,
    orden INT DEFAULT 0
);

-- 3. Tabla de Platos con los 14 alérgenos UE
CREATE TABLE platos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
    restaurante_id UUID REFERENCES restaurantes(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL DEFAULT '',
    precio DECIMAL(10,2) NOT NULL,
    contiene_gluten BOOLEAN DEFAULT FALSE,
    contiene_crustaceos BOOLEAN DEFAULT FALSE,
    contiene_huevos BOOLEAN DEFAULT FALSE,
    contiene_pescado BOOLEAN DEFAULT FALSE,
    contiene_cacahuetes BOOLEAN DEFAULT FALSE,
    contiene_soja BOOLEAN DEFAULT FALSE,
    contiene_leche BOOLEAN DEFAULT FALSE,
    contiene_frutos_cascara BOOLEAN DEFAULT FALSE,
    contiene_apio BOOLEAN DEFAULT FALSE,
    contiene_mostaza BOOLEAN DEFAULT FALSE,
    contiene_sesamo BOOLEAN DEFAULT FALSE,
    contiene_sulfitos BOOLEAN DEFAULT FALSE,
    contiene_altramuces BOOLEAN DEFAULT FALSE,
    contiene_moluscos BOOLEAN DEFAULT FALSE,
    imagen_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para acelerar consultas
CREATE INDEX idx_categorias_restaurante ON categorias(restaurante_id);
CREATE INDEX idx_platos_restaurante ON platos(restaurante_id);
CREATE INDEX idx_platos_categoria ON platos(categoria_id);
CREATE INDEX idx_restaurantes_slug ON restaurantes(slug);

-- Row Level Security (RLS)
ALTER TABLE restaurantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE platos ENABLE ROW LEVEL SECURITY;

-- Políticas: cada usuario solo ve/edita su propio restaurante
CREATE POLICY "Usuarios ven su propio restaurante" ON restaurantes
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Usuarios ven sus categorias" ON categorias
    FOR ALL USING (auth.uid() = restaurante_id);

CREATE POLICY "Usuarios ven sus platos" ON platos
    FOR ALL USING (auth.uid() = restaurante_id);

-- Políticas para lectura pública del menú
CREATE POLICY "Lectura pública de restaurantes" ON restaurantes
    FOR SELECT USING (true);

CREATE POLICY "Lectura pública de categorias" ON categorias
    FOR SELECT USING (true);

CREATE POLICY "Lectura pública de platos" ON platos
    FOR SELECT USING (true);

-- Storage: Crear bucket "safemenu" en Supabase Storage (Dashboard > Storage)
-- Política para el bucket (SQL Editor):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('safemenu', 'safemenu', true);
-- CREATE POLICY "Subida autenticada" ON storage.objects FOR INSERT TO authenticated USING (bucket_id = 'safemenu');
-- CREATE POLICY "Lectura pública" ON storage.objects FOR SELECT TO public USING (bucket_id = 'safemenu');
