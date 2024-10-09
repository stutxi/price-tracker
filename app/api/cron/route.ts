import Product from "@/lib/models/product.model";
import { connectDB } from "@/lib/mongoose"
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice } from "@/lib/utils";
import { NextResponse } from "next/server";

 export async function GET(request: Request) {
    try {
        await connectDB();

        const products = await Product.find({});

        if (!products) throw new Error('No Products Found');

        // 1. Scrape latest product details and update db
        const updatedProducts = await Promise.all(
            products.map(async (currentProduct) => {
                // scrape product
                const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);
                if (!scrapedProduct) return;

                const updatedPriceHistory: any = [
                    ...currentProduct.priceHistory,
                    { 
                        price: scrapedProduct.currentPrice,
                    },
                ];

                const product = {
                    ...scrapedProduct,
                    priceHistory: updatedPriceHistory,
                    lowestPrice: getLowestPrice(updatedPriceHistory),
                    highestPrice: getHighestPrice(updatedPriceHistory),
                    averagePrice: getAveragePrice(updatedPriceHistory)
                };
                
                // Update Products in DB
                const updatedProduct = await Product.findOneAndUpdate(
                    {
                        url: product.url,
                    },
                    product,
                );

                // check each product status and send email accordingly
                const emailNotifType = getEmailNotifType(
                    scrapedProduct,
                    currentProduct
                );

                if (emailNotifType && updatedProduct.users.length > 0) {
                    const productInfo = {
                        title: updatedProduct.title,
                        url: updatedProduct.url,
                    };

                    // construct email content
                    const emailContent = await generateEmailBody(productInfo, emailNotifType);
                    // get array of user emails
                    const userEmails = updatedProduct.users.map((user: any) => user.email);
                    // send email notif
                    await sendEmail(emailContent, userEmails);
                }
                return updatedProduct;
            })
        );
        return NextResponse.json({
            message: "Ok",
            data: updatedProducts,
        });
    } catch (error: any) {
        throw new Error(`Failed to get all products: ${error.message}`)
    }
 }