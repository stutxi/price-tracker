"use server"

import { connectDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";

export async function scrapeAndStoreProduct(productUrl: string) {
    if (!productUrl) return;

    try {
        connectDB();

        const scrapedProduct = await scrapeAmazonProduct(productUrl);

        // store prduct
        if (!scrapedProduct) {
            return;
        }

    } catch (error: any) {
        throw new Error(`Failed to create/update product: ${error.message}`)
    }
}