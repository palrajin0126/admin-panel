import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { authAdmin } from '../../lib/firebaseAdmin';
import { db } from '@/app/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface CartProduct {
  productId: string;
  quantity: number;
  price: number;
}

interface Cart {
  id: number;
  userId: string;
  products: CartProduct[];
  totalCartValue: number;
  isPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const idToken = req.headers.authorization?.split('Bearer ')[1];

  if (!idToken) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  try {
    // Verify the idToken using Firebase Admin SDK
    const decodedToken = await authAdmin.verifyIdToken(idToken);

    if (!decodedToken) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    // Fetch cart details from Prisma
    const carts = await prisma.cart.findMany();

    // Fetch product details from Firebase
    const enhancedCarts = await Promise.all(
      carts.map(async (cart: Cart) => {
        const productsWithDetails = await Promise.all(
          (cart.products as CartProduct[]).map(async (product: CartProduct) => {
            const productDoc = doc(db, 'products', product.productId);
            const productSnap = await getDoc(productDoc);
            return productSnap.exists()
              ? {
                  ...product,
                  ...(productSnap.data() as any),
                }
              : null;
          })
        );

        return {
          ...cart,
          products: productsWithDetails.filter(Boolean) as CartProduct[],
        };
      })
    );

    if (!enhancedCarts || enhancedCarts.length === 0) {
      return res.status(404).json({ message: 'No carts found' });
    }

    return res.status(200).json(enhancedCarts);
  } catch (error) {
    console.error('Error fetching carts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
