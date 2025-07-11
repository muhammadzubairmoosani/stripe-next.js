import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { ProductsResponse, ErrorResponse } from "@/types/stripe";

export async function GET(): Promise<
  NextResponse<ProductsResponse[] | ErrorResponse>
> {
  try {
    // Get all active products
    const products = await stripe.products.list({ active: true });

    // Get all prices
    const prices = await stripe.prices.list({ active: true });

    // Map prices to products
    const productsWithPrices: ProductsResponse[] = products.data.map(
      (product) => {
        return {
          ...product,
          prices: prices.data.filter((price) => price.product === product.id),
        } as ProductsResponse;
      }
    );

    return NextResponse.json(productsWithPrices);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching products:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
