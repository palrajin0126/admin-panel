"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { getAuth } from 'firebase/auth';

type CartProduct = {
  productId: string;
  quantity: number;
  productName: string;
  price: number;
  images: string[];
};

type UserCart = {
  userId: string;
  products: CartProduct[];
  totalCartValue: number;
};

const AdminCart = () => {
  const [carts, setCarts] = useState<UserCart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCarts = async () => {
      setLoading(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        const idToken = user ? await user.getIdToken(true) : null;

        const response = await axios.get('/api/cart', {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        setCarts(response.data);
      } catch (error) {
        console.error('Error fetching carts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (carts.length === 0) {
    return <div>No carts found</div>;
  }

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">All Users' Carts</h1>
      {carts.map((userCart) => (
        <div key={userCart.userId} className="mb-8 p-4 border rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">User ID: {userCart.userId}</h2>
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Product Name</th>
                <th className="py-2 px-4 border-b">Price</th>
                <th className="py-2 px-4 border-b">Quantity</th>
                <th className="py-2 px-4 border-b">Image</th>
              </tr>
            </thead>
            <tbody>
              {userCart.products.map((product) => (
                <tr key={product.productId}>
                  <td className="py-2 px-4 border-b">{product.productName}</td>
                  <td className="py-2 px-4 border-b">Rs {product.price}</td>
                  <td className="py-2 px-4 border-b">{product.quantity}</td>
                  <td className="py-2 px-4 border-b">
                    {product.images && product.images.length > 0 && (
                      <Image
                        src={product.images[0]}
                        alt={product.productName}
                        width={50}
                        height={50}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 text-right font-bold">
            Total Cart Value: Rs {userCart.totalCartValue}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminCart;
