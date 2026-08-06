# SafeMenu — Gestor de Menús QR con IA

Gestor de menús QR inteligentes con detección automática de alérgenos por IA (OpenAI).

## Stack

| Componente | Tecnología |
|---|---|
| Frontend & API | **Next.js 16** (App Router) + TypeScript |
| Estilos | **Tailwind CSS 4** |
| Base de Datos + Auth | **Supabase** (PostgreSQL + RLS + Auth) |
| IA | **OpenAI gpt-4o-mini** (structured outputs) |
| QR | **qrcode** (generación on-demand) |
| Almacenamiento | Supabase Storage (logos e imágenes) |

---

## Funcionalidades implementadas

### Autenticación
- Login / Registro con Supabase Auth (email + password)
- Proxy (middleware) que protege rutas privadas y redirige según sesión
- API routes: `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/user`

### Panel de control (Dashboard)
- Vista general con acceso rápido a todas las funciones
- Cabecera con nombre del restaurante y enlace al menú público
- Cierre de sesión

### Perfil del Restaurante
- Edición de nombre, color principal y logo
- Subida de logo por archivo (Supabase Storage) o URL directa
- Vista previa del perfil

### Gestión de Categorías
- Crear, listar y eliminar categorías
- Ordenación por campo `orden`

### Gestión de Platos
- Crear, editar y eliminar platos
- Campos: nombre, descripción, precio, categoría, imagen
- Subida de imagen por archivo o URL (con vista previa)
- Checkboxes para los **14 alérgenos UE**

### Detección IA de Alérgenos
- Botón "Detectar alérgenos con IA" en el formulario del plato
- Envía la descripción a OpenAI gpt-4o-mini
- Recibe JSON estructurado con los 14 alérgenos booleanos
- Rellena automáticamente los checkboxes correspondientes
- API: `POST /api/platos/detectar-alergenos`

### Menú Público
- Ruta dinámica `/[slug]`
- Carga restaurante, categorías y platos desde la BD
- Cabecera con color personalizado y logo
- Cards de platos con nombre, descripción, precio, imagen e iconos de alérgenos
- Diseño responsive mobile-first

### Código QR
- Generación automática en el dashboard con `qrcode`
- Descarga en PNG
- Copia de URL al portapapeles
- El QR es permanente (la URL no cambia, solo los datos en BD)

### Base de Datos (PostgreSQL)
- Esquema completo en `supabase-schema.sql`
- Tablas: `restaurantes`, `categorias`, `platos` (con 14 columnas booleanas de alérgenos + `imagen_url`)
- Índices para consultas rápidas
- Row Level Security (RLS):
  - Cada usuario solo ve/edita sus propios datos
  - Lectura pública para el menú QR

### API Routes

| Ruta | Métodos | Descripción |
|---|---|---|
| `/api/auth/login` | POST | Inicio de sesión |
| `/api/auth/register` | POST | Registro + creación de restaurante |
| `/api/auth/logout` | POST | Cierre de sesión |
| `/api/auth/user` | GET | Datos del usuario y restaurante |
| `/api/restaurantes` | GET, PUT | Perfil del restaurante |
| `/api/categorias` | GET, POST, PUT, DELETE | CRUD categorías |
| `/api/platos` | GET, POST, PUT, DELETE | CRUD platos |
| `/api/platos/detectar-alergenos` | POST | Detección IA de alérgenos |
| `/api/menu?slug=` | GET | Menú público |
| `/api/upload` | POST | Subida de imágenes |

### 14 alérgenos UE soportados

Gluten · Crustáceos · Huevos · Pescado · Cacahuetes · Soja · Leche · Frutos de cáscara · Apio · Mostaza · Sésamo · Sulfitos · Altramuces · Moluscos

---

## Pendiente / Próximas funcionalidades

- [ ] **Reordenar menú** — Drag & drop para ordenar categorías y platos
- [ ] **Refinar UI/UX** — Notificaciones toast, skeletons, diseño responsive mejorado
- [ ] **Dashboard analytics** — Contador de visitas al menú público
- [ ] **Multi-idioma** — Soporte ES/EN para menú público
- [ ] **Vista impresión** — Layout optimizado para imprimir el QR + menú
- [ ] **Modo oscuro** — Toggle claro/oscuro en dashboard
- [ ] **Editar slug manualmente** — Con validación de unicidad
- [ ] **Webhook/sincronización** — Actualización automática al cambiar datos

---

## Cómo poner en marcha

### 1. Configurar Supabase

Crear proyecto en [supabase.com](https://supabase.com), luego en el SQL Editor ejecutar el contenido de `supabase-schema.sql`.

Crear bucket público `safemenu` en Supabase Storage (Dashboard > Storage) y ejecutar:

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('safemenu', 'safemenu', true);
CREATE POLICY "Subida autenticada" ON storage.objects FOR INSERT TO authenticated USING (bucket_id = 'safemenu');
CREATE POLICY "Lectura pública" ON storage.objects FOR SELECT TO public USING (bucket_id = 'safemenu');
```

### 2. Variables de entorno

Crear `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
OPENAI_API_KEY=tu-openai-api-key
```

### 3. Iniciar

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`, registrarse y empezar a gestionar el menú.
