import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // Handle DELETE request to delete the product
  if (req.method === 'DELETE') {
    try {
      // Delete from Postgres
      const deletedProduct = await prisma.product.delete({
        where: { id: String(id) },
      });

      res.status(200).json({ message: 'Product deleted successfully', deletedProduct });
    } catch (error) {
      console.error('Error deleting product from Postgres:', error);
      res.status(500).json({ message: 'Error deleting product', error });
    }
    return;
  }

  // Handle PUT request to update the product
  if (req.method === 'PUT') {
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
      emi,
      images,
    } = req.body;

    try {
      // Update in Postgres
      const updatedProduct = await prisma.product.update({
        where: { id: String(id) },
        data: {
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
          emi,
          images,
        },
      });

      res.status(200).json({ message: 'Product updated successfully', updatedProduct });
    } catch (error) {
      console.error('Error updating product in Postgres:', error);
      res.status(500).json({ message: 'Error updating product', error });
    }
    return;
  }

  // If method is not PUT or DELETE, return 405
  res.status(405).send({ message: 'Only PUT and DELETE requests allowed' });
}
