import prisma from '@/../../lib/prisma';
import { getAuth } from 'firebase-admin/auth';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const {
    productName,
    price,
    marketPrice,
    brand,
    seller,
    description,
    manufacturingDate,
    expiryDate,
    listingDate,
    percentageOfDiscountOffered,
    stock,
    category,
    deliveryInfo,
    firebaseProductId,
    images, // Add this field to handle image URLs
  } = req.body;

  try {
    // Create the product in PostgreSQL and use firebaseProductId as the id
    const product = await prisma.product.create({
      data: {
        id: firebaseProductId, // Use firebaseProductId as the id
        productName,
        price: parseFloat(price),
        marketPrice: parseFloat(marketPrice),
        brand,
        seller,
        description,
        manufacturingDate: new Date(manufacturingDate),
        expiryDate: new Date(expiryDate),
        listingDate: new Date(listingDate),
        percentageOfDiscountOffered: parseFloat(percentageOfDiscountOffered),
        stock: parseInt(stock),
        category,
        deliveryInfo,
        images, // Save the image URLs
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
