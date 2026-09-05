/**
 * Conceptual commerce catalogue. Prices are demo indications in CHF and are
 * the single source of truth for both client display and server validation.
 */
export type ProductId = "foundation" | "interactive" | "commerce" | "three" | "flagship";
export type VariantId = "essential" | "extended" | "signature";

export type ProductVariant = {
  id: VariantId;
  price: number;
};

export type Product = {
  id: ProductId;
  slug: string;
  index: string;
  /** Layer count drives the 3D representation in the store. */
  layers: number;
  /** Visual accent for the product's 3D object (hex). */
  tint: string;
  variants: ProductVariant[];
  defaultVariant: VariantId;
};

export const products: Product[] = [
  {
    id: "foundation",
    slug: "digital-foundation",
    index: "01",
    layers: 2,
    tint: "#d9dde3",
    variants: [
      { id: "essential", price: 9800 },
      { id: "extended", price: 14500 },
      { id: "signature", price: 19800 },
    ],
    defaultVariant: "essential",
  },
  {
    id: "interactive",
    slug: "interactive-experience",
    index: "02",
    layers: 3,
    tint: "#bfe3ff",
    variants: [
      { id: "essential", price: 18500 },
      { id: "extended", price: 24000 },
      { id: "signature", price: 32000 },
    ],
    defaultVariant: "extended",
  },
  {
    id: "commerce",
    slug: "commerce-system",
    index: "03",
    layers: 4,
    tint: "#7fd3ff",
    variants: [
      { id: "essential", price: 22000 },
      { id: "extended", price: 29500 },
      { id: "signature", price: 38000 },
    ],
    defaultVariant: "extended",
  },
  {
    id: "three",
    slug: "3d-experience",
    index: "04",
    layers: 5,
    tint: "#9b8cff",
    variants: [
      { id: "essential", price: 16000 },
      { id: "extended", price: 24000 },
      { id: "signature", price: 34000 },
    ],
    defaultVariant: "extended",
  },
  {
    id: "flagship",
    slug: "flagship-build",
    index: "05",
    layers: 7,
    tint: "#ece9e2",
    variants: [
      { id: "essential", price: 42000 },
      { id: "extended", price: 52000 },
      { id: "signature", price: 68000 },
    ],
    defaultVariant: "extended",
  },
];

export const productIds = ["foundation", "interactive", "commerce", "three", "flagship"] as const;

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getVariant(productId: string, variantId: string): ProductVariant | undefined {
  return getProduct(productId)?.variants.find((v) => v.id === variantId);
}
