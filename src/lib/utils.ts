import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const priceFormatter = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

// Precio en formato español: 1234.5 -> "1234,50 €"
export function formatPrice(value: number): string {
  return priceFormatter.format(value);
}

// Nombre corto y legible de un producto del catálogo: "Ecosana – COPOS DE AVENA 500gr "" 500gr – Cereales…" -> "Copos de avena 500gr"
export function cleanProductName(name: string, maxLength = 60): string {
  const parts = name.split("–");
  let clean = parts.length > 1 ? parts[1] : name;
  clean = clean.replace(/""/g, "").replace(/formato estándar/gi, "").split("“")[0].split('"')[0].replace(/\s+/g, " ").trim();
  clean = clean.replace(/(\S+)\s+\1$/i, "$1");
  clean = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  return clean.length > maxLength ? clean.substring(0, maxLength) + "…" : clean;
}
