import { z } from "zod";

/**
 * Design tokens globales (Fase 2 del editor, pero definidos en el esquema
 * desde la Fase 0 para que generación, edición y exportación referencien
 * los mismos ids desde el día uno — ver ROADMAP.md).
 */
export const ColorToken = z.object({
  id: z.string(), // ej. "color.primary"
  name: z.string(), // ej. "Primary"
  value: z.string(), // "#RRGGBB"
});
export type ColorToken = z.infer<typeof ColorToken>;

export const TypographyToken = z.object({
  id: z.string(), // ej. "typography.heading-lg"
  name: z.string(),
  fontFamily: z.string(),
  fontSize: z.number(),
  fontWeight: z.number().default(400),
  lineHeight: z.number().optional(),
});
export type TypographyToken = z.infer<typeof TypographyToken>;

export const SpacingToken = z.object({
  id: z.string(), // ej. "spacing.md"
  name: z.string(),
  value: z.number(),
});
export type SpacingToken = z.infer<typeof SpacingToken>;

export const ThemeTokens = z.object({
  colors: z.array(ColorToken).default([]),
  typography: z.array(TypographyToken).default([]),
  spacing: z.array(SpacingToken).default([]),
});
export type ThemeTokens = z.infer<typeof ThemeTokens>;

/**
 * Soporta múltiples temas (ej. "light"/"dark") como conjuntos alternativos
 * de tokens con los mismos ids — así un elemento referencia "color.primary"
 * sin importar el tema activo.
 */
export const DesignTokens = z.object({
  defaultTheme: z.string().default("light"),
  themes: z.record(z.string(), ThemeTokens).default({ light: { colors: [], typography: [], spacing: [] } }),
});
export type DesignTokens = z.infer<typeof DesignTokens>;

export function emptyDesignTokens(): DesignTokens {
  return { defaultTheme: "light", themes: { light: { colors: [], typography: [], spacing: [] } } };
}
