"use client";
import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '../firebase'; // Import firebase config

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        alert('Signed in successfully!');
        router.push('/'); // Redirect to home page
      } else {
        setError('Please verify your email before signing in. A verification link has been sent to your email.');
        await sendEmailVerification(user);
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Failed to sign in. Please check your email and password.');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        // User is signed in and email is verified, redirect to home page
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex justify-center p-4">
      <Head>
        <title>Sign In</title>
      </Head>
      <form onSubmit={handleSubmit} className="w-full max-w-md p-4 bg-white rounded shadow md:px-24 md:py-8 sm:p-10 lg:p-12 xl:p-14">
        {error && (
          <div className="bg-red-200 border-l border-red-500 p-4 rounded text-sm text-red-700">
            {error}
          </div>
        )}
        <label className="block mb-2">
          <span className="text-gray-600">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="example@example.com"
            className="w-full p-3 text-slate-500 bg-white border-none rounded focus:shadow-outline focus:outline-none transition duration-300 ease-out"
          />
        </label>
        <label className="block mb-2">
          <span className="text-gray-600">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="*********"
            className="w-full p-3 text-slate-500 bg-white border-none rounded focus:shadow-outline focus:outline-none transition duration-300 ease-out"
          />
        </label>
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Login;
