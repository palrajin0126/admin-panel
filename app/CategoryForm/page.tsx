"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, storage } from '@/app/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, updateMetadata } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';

export default function CategoryForm() {
  const [user, setUser] = useState<{ id: string; email: string | null } | null>(null);
  const [formData, setFormData] = useState({
    categoryName: '',
    images: [] as string[],
  });
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          id: user.uid,
          email: user.email,
        });
      } else {
        setUser(null);
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && user) {
      setIsUploading(true);
      const imageUrls: string[] = [];
      for (const file of Array.from(files)) {
        const storageRef = ref(storage, `categories/${user.id}/${file.name}`);
        await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(storageRef);

        const metadata = {
          customMetadata: {
            userId: user.id,
          },
        };
        await updateMetadata(storageRef, metadata);

        imageUrls.push(imageUrl);
      }
      console.log("Image URLs after upload:", imageUrls); 
      setFormData((prevFormData) => ({
        ...prevFormData,
        images: [...prevFormData.images, ...imageUrls],
      }));
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('You need to be logged in to post a category');
      return;
    }
    if (isUploading) {
      alert('Please wait for the image upload to complete');
      return;
    }
    console.log("Form data before submission:", formData);
    try {
      const categoryData = {
        categoryName: formData.categoryName,
        userId: user.id,
        images: formData.images,
      };
      await addDoc(collection(db, 'categories'), categoryData);
      alert('Category posted successfully!');
      router.push('/');
    } catch (err) {
      console.error('Error posting category:', err);
      alert('Error posting category');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 text-slate-700 bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Post Category</h1>
        <div className="mb-4">
          <label className="block text-gray-700">Category Name</label>
          <input
            type="text"
            name="categoryName"
            placeholder="Category Name"
            value={formData.categoryName}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded mt-1"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Image</label>
          <input
            type="file"
            name="images"
            onChange={handleImageUpload}
            multiple
            className="w-full p-2 border border-gray-300 rounded mt-1"
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Post Category</button>
      </form>
    </main>
  );
}