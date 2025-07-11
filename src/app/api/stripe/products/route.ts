import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { ProductsResponse, ErrorResponse } from "@/types/stripe";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ProductsResponse[] | ErrorResponse>> {
  try {
    // Get all active products
    const products = await stripe.products.list({ active: true });

    // Get all prices
    const prices = await stripe.prices.list({ active: true });

    // Map prices to products
    const productsWithPrices = products.data.map((product) => {
      return {
        ...product,
        prices: prices.data.filter((price) => price.product === product.id),
      };
    });

    return NextResponse.json(productsWithPrices);
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
