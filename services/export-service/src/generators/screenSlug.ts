/** Convierte el nombre de una pantalla en un slug de ruta y en un nombre de componente válido. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "screen";
}

export function toComponentName(name: string): string {
  return slugify(name)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("") || "Screen";
}

export function toRoutePath(name: string, index: number): string {
  const slug = slugify(name);
  return index === 0 ? "/" : `/${slug}`;
}
