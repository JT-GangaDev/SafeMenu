import type { AlergenoInfo } from "./types";

export const ALERGENOS: AlergenoInfo[] = [
  { key: "contiene_gluten", label: "Gluten", icon: "🌾" },
  { key: "contiene_crustaceos", label: "Crustáceos", icon: "🦐" },
  { key: "contiene_huevos", label: "Huevos", icon: "🥚" },
  { key: "contiene_pescado", label: "Pescado", icon: "🐟" },
  { key: "contiene_cacahuetes", label: "Cacahuetes", icon: "🥜" },
  { key: "contiene_soja", label: "Soja", icon: "🫘" },
  { key: "contiene_leche", label: "Leche", icon: "🥛" },
  { key: "contiene_frutos_cascara", label: "Frutos de cáscara", icon: "🌰" },
  { key: "contiene_apio", label: "Apio", icon: "🥬" },
  { key: "contiene_mostaza", label: "Mostaza", icon: "🫙" },
  { key: "contiene_sesamo", label: "Sésamo", icon: "🫓" },
  { key: "contiene_sulfitos", label: "Sulfitos", icon: "🧪" },
  { key: "contiene_altramuces", label: "Altramuces", icon: "🌸" },
  { key: "contiene_moluscos", label: "Moluscos", icon: "🐚" },
];

export const ALERGENO_KEYS = ALERGENOS.map((a) => a.key);
