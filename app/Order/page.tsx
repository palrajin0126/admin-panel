"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface OrderItem {
    productName?: string;
    price?: number;
    quantity: number;
    productId: string;
    imageUrl?: string;
}

interface Order {
    orderNumber: string;
    customerName: string;
    apartment: string;
    block: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
    email: string;
    mobile: string;
    orderTotal: number;
    orderItems: OrderItem[];
}

export default function Order() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const db = getFirestore();

    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                fetchOrders(user);
            } else {
                console.log("User not authenticated");
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router]);

    const fetchOrders = async (user: any) => {
        try {
            const idToken = await user.getIdToken();
            const response = await axios.get('/api/orders', {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            const ordersData: Order[] = response.data;

            const ordersWithDetails = await Promise.all(ordersData.map(async (order) => {
                const orderItemsWithDetails = await Promise.all(order.orderItems.map(async (item) => {
                    const productDoc = await getDoc(doc(db, 'products', item.productId));
                    const productData = productDoc.data();
                    return {
                        ...item,
                        productName: productData?.productName,
                        price: productData?.price,
                        imageUrl: productData?.images ? productData.images[0] : undefined,
                    };
                }));
                return {
                    ...order,
                    orderItems: orderItemsWithDetails,
                };
            }));

            setOrders(ordersWithDetails);
            console.log(ordersWithDetails);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }
    if (orders.length === 0) {
        return <div>No orders found.</div>;
    }

    return (
        <div className="container mx-auto mt-8 bg-gray-300 p-8">
            <h1 className="text-slate-700 font-bold mb-4">Orders Placed</h1>
            {orders.map((order, index) => (
                <div key={index} className="mb-8 p-6 border rounded shadow-lg bg-white">
                    <div className="mb-4">
                        <h2 className="text-slate-700 font-semibold">Order Details</h2>
                        <p className='text-slate-700'><strong>Order Number:</strong> {order.orderNumber}</p>
                        <p className='text-slate-700'><strong>Customer Name:</strong> {order.customerName}</p>
                        <p className='text-slate-700'><strong>Address:</strong> {`${order.apartment}, ${order.block}, ${order.locality}, ${order.city}, ${order.state}, ${order.pincode}`}</p>
                        <p className='text-slate-700'><strong>Email:</strong> {order.email}</p>
                        <p className='text-slate-700'><strong>Mobile:</strong> {order.mobile}</p>
                        <p className='text-slate-700'><strong>Total:</strong> Rs {order.orderTotal}</p>
                    </div>
                    <div>
                        <h2 className="text-slate-700 font-semibold">Order Items</h2>
                        <ul>
                            {order.orderItems.map((item, itemIndex) => (
                                <li key={itemIndex} className="mb-4 flex items-center">
                                    {item.imageUrl && (
                                        <img src={item.imageUrl} alt={item.productName} className="w-16 h-16 object-cover mr-4"/>
                                    )}
                                    <div>
                                        <p className='text-slate-700'><strong>Product Name:</strong> {item.productName}</p>
                                        <p className='text-slate-700'><strong>Price:</strong> Rs {item.price}</p>
                                        <p className='text-slate-700'><strong>Quantity:</strong> {item.quantity}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
}
