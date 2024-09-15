"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { auth } from '../firebase';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [user, setUser] = useState<null | User>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Sign out error', error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isDropdownOpen) {
      timer = setTimeout(() => {
        setIsDropdownOpen(false);
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [isDropdownOpen]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;
    router.push(`/searchProduct?search=${search}`);
  };

  return (
    <nav className="bg-gray-900 p-4 flex flex-col md:flex-row justify-between items-center z-20">
      <div className="flex items-center mb-4 md:mb-0 w-full justify-between md:w-auto">
        <Link href="/" className="text-3xl font-bold text-white">
          <img src="/logo.jpeg" alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10" />
        </Link>
        {user ? (
          <>
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
              >
                Account
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg">
                  <Link href="/account">
                    <span className="block px-4 py-2 text-gray-700 hover:bg-gray-200">
                      Account
                    </span>
                  </Link>
                  <Link href="/Order">
                    <span className="block px-4 py-2 text-gray-700 hover:bg-gray-200">
                      Orders
                    </span>
                  </Link>
                </div>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded ml-2"
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="/login">
            <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
              Login
            </button>
          </Link>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex items-center w-full md:w-auto md:ml-4 mt-4 md:mt-0">
        <input
          type="search"
          name="search"
          placeholder="Search..."
          className="p-2 text-sm text-gray-600 w-full md:w-auto focus:outline-none focus:border-orange-500 rounded-l-md"
        />
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-r-md"
        >
          Search
        </button>
      </form>
    </nav>
  );
};

export default Navbar;
