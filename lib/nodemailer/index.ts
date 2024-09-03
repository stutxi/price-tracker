"use server"

import { EmailContent, EmailProductInfo, NotificationType } from '@/types';
import nodemailer from 'nodemailer';


 const Notification = {
    WELCOME: 'WELCOME',
    CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
    LOWEST_PRICE: 'LOWEST_PRICE',
    THRESHOLD_MET: 'THRESHOLD_MET'
}

export async function generateEmailBody(
    product: EmailProductInfo,
    type: NotificationType
) {

    const THRESHOLD_PERCENTAGE = 40;

    const shortenedTitle =
        product.title.length > 20
            ? `${product.title.substring(0, 20)}...`
            : product.title;

    let subject = '';
    let body = '';

    switch (type) {
        case Notification.WELCOME:
            subject = `Welcome to Price Tracking for ${shortenedTitle}`;
            body = `
            <div>
              <h2>Welcome to PricePal E-Price Tracker 💴</h2>
              <p>You are now tracking ${product.title}.</p>
              <p>Stay tuned for more updates on ${product.title} and other products you're tracking.</p>
            </div>
          `;
            break;

        case Notification.CHANGE_OF_STOCK:
            subject = `${shortenedTitle} is now back in stock!`;
            body = `
            <div>
              <h4>Hey, ${product.title} is now restocked! Grab yours before they run out again!</h4>
              <p>See the product <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a>.</p>
            </div>
          `;
            break;

        case Notification.LOWEST_PRICE:
            subject = `Lowest Price Alert for ${shortenedTitle}`;
            body = `
            <div>
              <h4>Hey, ${product.title} has reached its lowest price ever!!</h4>
              <p>Grab the product <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a> now.</p>
            </div>
          `;
            break;

        case Notification.THRESHOLD_MET:
            subject = `Discount Alert for ${shortenedTitle}`;
            body = `
            <div>
              <h4>Hey, ${product.title} is now available at a discount more than ${THRESHOLD_PERCENTAGE}%!</h4>
              <p>Grab it right away from <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a>.</p>
            </div>
          `;
            break;

        default:
            throw new Error("Invalid notification type.");
    }

    return { subject, body };
}

const transporter = nodemailer.createTransport({
    pool: true,
    service: 'hotmail',
    port: 2525,
    auth: {
        user: 'pricepal.pricetracker@outlook.com',
        pass: process.env.EMAIL_PASSWORD,
    },
    maxConnections: 1
})

export const sendEmail = async (emailContent: EmailContent, sendTo: string[]) => {
    const mailOptions = {
        from: 'pricepal.pricetracker@outlook.com',
        to: sendTo,
        html: emailContent.body,
        subject: emailContent.subject,
    }

    transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) return console.log(error);

        console.log('Email sent: ', info);
    })
}