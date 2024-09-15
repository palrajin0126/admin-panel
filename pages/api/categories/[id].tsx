import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/app/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const categoryRef = doc(db, 'categories', id as string);
      await updateDoc(categoryRef, req.body);
      res.status(200).json({ message: 'Category updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating category', error });
    }
  } else if (req.method === 'DELETE') {
    try {
      const categoryRef = doc(db, 'categories', id as string);
      await deleteDoc(categoryRef);
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting category', error });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};