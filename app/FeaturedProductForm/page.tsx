"use client";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, updateMetadata } from 'firebase/storage';
import { db, storage, auth } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import Image from "next/image"; // Import the Image component

interface FormData {
  featuredproductName: string;
  price: number;
  brand: string;
  seller: string;
  description: string;
  manufacturingDate: string;
  expiryDate: string;
  listingDate: string;
  discountedPrice: number;
  percentageOfDiscountOffered: number;
  stock: number;
  category: string;
  deliveryInfo: string;
  emi: string;
  images: string[]; // Array to store multiple image URLs
}

const FeaturedProductForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    featuredproductName: "",
    price: 0,
    brand: "",
    seller: "",
    description: "",
    manufacturingDate: "",
    expiryDate: "",
    listingDate: new Date().toISOString().split("T")[0],
    discountedPrice: 0,
    percentageOfDiscountOffered: 0,
    stock: 0,
    category: "",
    deliveryInfo: "",
    emi: "",
    images: [], // Initialize as an empty array
  });
  const [user, setUser] = useState<User | null>(null);
  const [isUploading, setIsUploading] = useState(false); // Track image upload status

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && user) {
      setIsUploading(true);
      const uploadedImageUrls: string[] = [];
      for (const file of Array.from(files)) {
        const storageRef = ref(storage, `featuredproducts/${user.uid}/${file.name}`);
        await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(storageRef);

        await updateMetadata(storageRef, {
          customMetadata: {
            userId: user.uid,
          },
        });

        uploadedImageUrls.push(imageUrl);
      }
      console.log("Uploaded image URLs:", uploadedImageUrls); // Log image URLs
      setFormData((prevFormData) => ({
        ...prevFormData,
        images: [...prevFormData.images, ...uploadedImageUrls],
      }));
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('You need to be logged in to add a product');
      return;
    }
    if (isUploading) {
      alert('Please wait for the image upload to complete');
      return;
    }
    console.log("Form data before submission:", formData);
    try {
      const featuredproductData = {
        ...formData,
        userId: user.uid,
      };
      const docRef = await addDoc(collection(db, "featuredproducts"), featuredproductData);
      alert("Product added successfully!");
      console.log("Document written with ID: ", docRef.id);
      router.push("/");
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Error adding product");
    }
  };

  return (
    <form
      className="w-full max-w-md mx-auto p-4 rounded shadow-md text-slate-700 bg-white"
      onSubmit={handleSubmit}
    >
      <h2 className="text-slate-700 font-bold mb-4">Product Form</h2>
      <div className="flex flex-col space-y-4">
        {[
          { label: "Featured Product Name", name: "featuredproductName", type: "text" },
          { label: "Price", name: "price", type: "number" },
          { label: "Category", name: "category", type: "text" },
          {label: "Description", name:"description", type: "text"},
          { label: "Brand", name: "brand", type: "text" },
          { label: "Seller", name: "seller", type: "text" },
          { label: "Manufacturing Date", name: "manufacturingDate", type: "date" },
          { label: "Expiry Date", name: "expiryDate", type: "date" },
          { label: "Listing Date", name: "listingDate", type: "date" },
          { label: "Discounted Price", name: "discountedPrice", type: "number" },
          {label: "Delivery Info", name: 'deliveryInfo', type: "date"},
          {label: "EMI", name: 'emi', type:"number"},
          {
            label: "Percentage of Discount Offered",
            name: "percentageOfDiscountOffered",
            type: "number",
          },
          { label: "Stock", name: "stock", type: "number" },
        ].map((field, idx) => (
          <div key={idx}>
            <label
              className="block text-slate-700 font-medium mb-2"
              htmlFor={field.name}
            >
              {field.label}
            </label>
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              className="w-full px-3 py-2 bg-white border shadow-md rounded focus:outline-none focus:shadow-outline-sm"
              value={formData[field.name as keyof FormData] as string | number}
              onChange={handleChange}
            />
          </div>
        ))}
        <div>
          <label
            className="block text-slate-700 font-medium mb-2"
            htmlFor="images"
          >
            Upload Images
          </label>
          <input
            type="file"
            id="images"
            name="images" // Make sure this aligns with formData
            accept="image/*"
            className="w-full px-3 py-2 bg-white border shadow-md rounded focus:outline-none focus:shadow-outline-sm"
            onChange={handleImageUpload}
            multiple // Allow selecting multiple images
          />
        </div>

        {/* Display uploaded images */}
        <div>
          {formData.images.map((imageUrl, index) => (
            <div key={index}>
              <Image
                src={imageUrl}
                alt={`Uploaded image ${index + 1}`}
                width={200} // Adjust width as needed
                height={200} // Adjust height as needed
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add Product
        </button>
      </div>
    </form>
  );
};

export default FeaturedProductForm;
