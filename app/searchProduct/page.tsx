"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../firebase"; // Import storage from firebase.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Carousel } from 'react-responsive-carousel'; // Make sure to install react-responsive-carousel
import { Suspense } from 'react';

interface Product {
  id: string;
  productName: string;
  price: number;
  marketPrice: number;
  brand: string;
  seller: string;
  description: string;
  manufacturingDate: string;
  expiryDate: string;
  listingDate: string;
  percentageOfDiscountOffered: number;
  stock: number;
  category: string;
  deliveryInfo: string;
  images: string[]; // Array of image URLs
}

const SearchProduct: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const query = searchParams?.get('search') || '';

  useEffect(() => {
    if (query) {
      searchProducts(query);
    }
  }, [query]);

  const searchProducts = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/products/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const data = await response.json();
        const productsWithImages = await Promise.all(data.map(async (product: Product) => {
          const imageUrls = await fetchImageUrls(product.id);
          return { ...product, images: imageUrls };
        }));
        setProducts(productsWithImages);
      } else {
        console.error('Error searching products:', await response.text());
      }
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchImageUrls = async (productId: string): Promise<string[]> => {
    const urls: string[] = [];
    try {
      // Fetch multiple images if needed, assuming up to 5 images per product
      for (let i = 0; i < 5; i++) {
        try {
          const url = await getDownloadURL(ref(storage, `products/${productId}_${i}.jpg`));
          urls.push(url);
        } catch (error) {
          // Stop fetching further images if an error occurs
          break;
        }
      }
    } catch (error) {
      console.error('Error fetching image URLs:', error);
    }
    return urls;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 text-black bg-white">
      <h2 className="font-bold mb-4">Search Results for "{query}"</h2>
      {loading ? (
        <p className="font-bold">Loading...</p>
      ) : (
        <div>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="p-4 border rounded shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  {product.images.length > 0 && (
                    <Carousel showThumbs={false} infiniteLoop useKeyboardArrows autoPlay>
                      {product.images.map((imageUrl, index) => (
                        <div key={index}>
                          <Image
                            src={imageUrl}
                            alt={`Product image ${index + 1}`}
                            width={300}
                            height={300}
                            className="w-full h-auto object-cover rounded"
                          />
                        </div>
                      ))}
                    </Carousel>
                  )}
                  <h3 className="text-xl font-bold">{product.productName}</h3>
                  <p className="font-bold">Brand: {product.brand}</p>
                  <p className="font-bold">Category: {product.category}</p>
                  <p className="font-bold">Price: ₹{product.price}</p>
                  <p className="font-bold">Market Price: ₹{product.marketPrice}</p>
                  <p className="font-bold">Description: {product.description}</p>
                  <p className="font-bold">Manufacturing Date: {new Date(product.manufacturingDate).toLocaleDateString()}</p>
                  <p className="font-bold">Expiry Date: {new Date(product.expiryDate).toLocaleDateString()}</p>
                  <p className="font-bold">Listing Date: {new Date(product.listingDate).toLocaleDateString()}</p>
                  <p className="font-bold">Percentage of Discount Offered: {product.percentageOfDiscountOffered}%</p>
                  <p className="font-bold">Stock: {product.stock}</p>
                  <p className="font-bold">Delivery Info: {product.deliveryInfo}</p>
                  <Link href={`/products/${product.id}`}>
                    <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">View Product Details</button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-bold">No products found.</p>
          )}
        </div>
      )}
    </div>
  );
};

const SearchProductPage: React.FC = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <SearchProduct />
  </Suspense>
);

export default SearchProductPage;
