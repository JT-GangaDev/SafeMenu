export interface Restaurante {
  id: string
  nombre: string
  slug: string
  email: string
  logo_url: string | null
  color_principal: string
  created_at: string
}

export interface Categoria {
  id: string
  restaurante_id: string
  nombre: string
  orden: number
}

export interface Plato {
  id: string
  categoria_id: string
  restaurante_id: string
  nombre: string
  descripcion: string
  precio: number
  contiene_gluten: boolean
  contiene_crustaceos: boolean
  contiene_huevos: boolean
  contiene_pescado: boolean
  contiene_cacahuetes: boolean
  contiene_soja: boolean
  contiene_leche: boolean
  contiene_frutos_cascara: boolean
  contiene_apio: boolean
  contiene_mostaza: boolean
  contiene_sesamo: boolean
  contiene_sulfitos: boolean
  contiene_altramuces: boolean
  contiene_moluscos: boolean
  imagen_url: string | null
  created_at: string
}

export type AlergenoInfo = {
  key: keyof Plato
  label: string
  icon: string
}

export interface PlatoFormData {
  nombre: string
  descripcion: string
  precio: number
  categoria_id: string
}
