"use client";
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { doc, setDoc } from 'firebase/firestore';
import { z } from 'zod';

// Define a schema for form validation using zod
const signupSchema = z.object({
  fullName: z.string().min(1, 'Full Name is required'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(10, 'Invalid mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

const Signup = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validate form data
    const result = signupSchema.safeParse({ fullName, email, mobile, password });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: fullName,
      });

      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        name: fullName,
        email: user.email,
        mobile: mobile,
      });

      await sendEmailVerification(user);

      // Make an API request to your /api/signup route
      const response = await axios.post('/api/signup', {
        id: user.uid, // Use the user's uid from Firebase
        name: fullName,
        email: user.email,
        password: password, // Consider hashing the password for security 
      });

      if (response.status === 201) { // Assuming 201 for created
        alert('Account created successfully! Please verify your email.');
        router.push('/verify-email'); // Redirect to verify email page
      } else {
        console.error('Error creating user on the server:', response.data);
      }

    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to create account. Please try again.');
    }
  };

  return (
    <div className="flex justify-center p-4">
      <Head>
        <title>Sign Up</title>
      </Head>
      <form onSubmit={handleSubmit} className="w-full max-w-md p-4 bg-white rounded shadow md:px-24 md:py-8 sm:p-10 lg:p-12 xl:p-14">
        {error && (
          <div className="bg-red-200 border-l border-red-500 p-4 rounded text-sm text-red-700">
            {error}
          </div>
        )}
        <label className="block mb-2">
          <span className="text-gray-600">Full Name</span>
          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="John Doe"
            className="w-full p-3 text-slate-500 bg-white border-none rounded focus:shadow-outline focus:outline-none transition duration-300 ease-out"
          />
        </label>
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
          <span className="text-gray-600">Mobile</span>
          <input
            type="text"
            value={mobile}
            onChange={(event) => setMobile(event.target.value)}
            placeholder="+1 1234567890"
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
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;
