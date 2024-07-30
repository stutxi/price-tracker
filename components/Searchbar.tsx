"use client"

import { scrapeAndStoreProduct } from "@/lib/actions";
import { FormEvent, useState } from "react"

const isValidAmazonURL = (url: string) => {
    try {
        const parsedURL = new URL(url);
        const hostname = parsedURL.hostname;

        if (
            hostname.includes('amazon.com') ||
            hostname.includes('amazon.') ||
            hostname.endsWith('amazon')
        ) {
            return true;
        }
    } catch (error) {
        return false;
    }
}

const Searchbar = () => {

    const [searchPrompt, setSearchPrompt] = useState('');
    const [isLoading, setisLoading] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const isValidLink = isValidAmazonURL(searchPrompt);

        if (!isValidLink) {
            return alert('Please enter a valid Amazon link!');
        }

        try {
            setisLoading(true);
            const product = await scrapeAndStoreProduct(searchPrompt);
        } catch (error) {
            console.log(error);
        } finally {
            setisLoading(false);
        }

    }
    return (
        <form className='flex flex-wrap gap-4 mt-12' onSubmit={handleSubmit}>
            <input
                type="text"
                value={searchPrompt}
                onChange={(e) => setSearchPrompt(e.target.value)}
                placeholder="Enter the product link"
                className="searchbar-input"
            />

            <button
                type="submit"
                className="searchbar-btn"
                disabled={searchPrompt === ''}
            >
                {isLoading ? 'Searching...' : 'Search'}
            </button>
        </form>
    )
}

export default Searchbar