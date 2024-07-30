"use server"

import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
    mongoose.set('strictQuery', true);

    if (!process.env.MONGODB_URI) {
        return console.log('MONGODB_URI is not defined');
    }

    if (isConnected) {
        return console.log('=> using exisiting database connection');
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);

        isConnected = true;

        console.log('MongoDB Connected')

    } catch (error) {
        console.log(error);
    }
}