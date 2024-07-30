import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractDescription, extractPrice } from "../utils";

export async function scrapeAmazonProduct(url: string) {
    if (!url) return;


    // bd proxy configuration
    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    const port = 22225;
    const session_id = (1000000 * Math.random()) | 0;
    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password: password,
        },
        host: 'brd.superproxy.io',
        port: port,
        rejectUnauthorized: false,
    };

    try {
        const response = await axios.get(url, options);
        const $ = cheerio.load(response.data);

        const title = $('#productTitle').text().trim();
        const currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base'),
        );

        const originalPrice = extractPrice(
            $('.priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen'),
            $('#priceblock_dealprice'),
            $('#listPrice'),
            $('.a-size-base.a-color-price')
        );

        const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

        const images = $('imgBlkFront').attr('data-a-dynamic-image') || $('#landingImage').attr('data-a-dynamic-image') || '{}';
        const imageUrls = Object.keys(JSON.parse(images));

        const currency = extractCurrency($('.a-price-symbol'));
        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");

        // Scrape additional details
        // const description = $('#productDescription p').text().trim() || $('div.a-section.a-spacing-small span').text().trim();

        const description = extractDescription($);

        const category = $('#wayfinding-breadcrumbs_container ul li a')
            .map((i, el) => $(el).text().trim())
            .get()
            .join(' > ');

        const reviewsCount = $('#acrCustomerReviewText').text().trim().split(' ')[0].replace(',', '');
        const stars = $('span.a-icon-alt').first().text().trim().split(' ')[0];


        //    console.log({title, currentPrice, originalPrice, outOfStock, imageUrls,currency, discountRate});
        // console.log(response.data);

        const data = {
            url,
            currency: currency,
            image: imageUrls[0],
            title: title,
            currentPrice: Number(currentPrice) || Number(originalPrice),
            originalPrice: Number(originalPrice) || Number(currentPrice),
            priceHistory: [],
            discountRate: Number(discountRate),
            // description: description,
            category: category,
            reviewsCount: Number(reviewsCount.replace(/[^0-9]/g, '')),
            stars: Number(stars),
            // catergory: 'category',
            // reviewsCount: 0,
            // stars: 4,
            isOutOfStock: outOfStock,
            description: description,
            lowestPrice: Number(currentPrice) || Number(originalPrice),
            highestPrice: Number(originalPrice) || Number(currentPrice),
            average: Number(currentPrice) || Number(originalPrice)
        };

        console.log(data);
        return data;

    } catch (error: any) {
        console.error(`Failed to scrape product: ${error.message}`);
        throw new Error(`Failed to scrape product: ${error.message}`);
    }
}