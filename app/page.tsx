import React from 'react'
import Image from 'next/image'
import Searchbar from '@/components/Searchbar'
import HeroCarousel from '@/components/HeroCarousel'
import { getAllProducts } from '@/lib/actions'
import ProductCard from '@/components/ProductCard'

const Home = async () => {
  const allProducts = await getAllProducts();
  return (
    <>
      <section className='px-6 md:px-20 py24'>
        <div className='flex max-xl:flex-col gap-16'>
          <div className="flex flex-col justify-center">
            <p className="small-text">
              Begin your smart shopping journey:
              {/* <Image
                src="/assets/icons/arrow-right.svg"
                alt="arrow-right"
                width={16}
                height={16}
              /> */}
            </p>
            <h1 className='head-text'>
              Experience the Advantage of this
              <span className="text-primary"> E-Price Tracker</span>
            </h1>
            <p className="mt-6">
              Simple analytics to help you track prices and make better decisions.
            </p>

            <Searchbar />

          </div>

          <HeroCarousel />
        </div>
      </section>

      <section className='trending-section'>
        <h2 className='section-text'>Trending</h2>

        <div className="flex flex-wrap gap-x-8 gap-y-16">
          {allProducts?.map((product) => (
            // <div>{product.title}</div>
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </>
  )
}

export default Home