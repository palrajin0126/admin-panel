import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { authAdmin } from '../../lib/firebaseAdmin';

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

    // Fetch orders from Prisma in descending order of creation date
    const orders = await prisma.customerOrder.findMany({
      select: {
        orderNumber: true,
        customerName: true,
        apartment: true,
        block: true,
        locality: true,
        city: true,
        state: true,
        pincode: true,
        email: true,
        mobile: true,
        orderTotal: true,
        orderItems: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc', // Order by creation date in descending order
      },
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }

    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
