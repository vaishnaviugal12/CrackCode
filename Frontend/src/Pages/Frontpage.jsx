import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { FiUser, FiLogOut } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';

const FrontPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
      setShowDropdown(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gray-900 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-xl font-bold">CrackCode</span>
          </div>
          
          <div className="hidden md:flex space-x-6">
            <a href="#" className="hover:text-blue-400 transition-colors">Home</a>
            <a href="#" className="hover:text-blue-400 transition-colors">All Problems</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Problems Solved</a>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user?.firstName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:inline text-white">{user?.firstName}</span>
                </button>

                {/* Profile dropdown */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      Signed in as <span className="font-medium">{user?.firstName}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiLogOut className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => navigate('/signup')}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors"
              >
                Sign Up
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gray-800 text-white">
        <img 
          src='\coding-platform-hero.jpg '
          alt="Developer coding on laptop" 
          className="w-full h-96 object-cover opacity-70"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="text-center max-w-4xl px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              MASTER CODING WITH OUR PLATFORM
            </h1>
            <h2 className="text-xl md:text-2xl mb-8">
              Boost your programming skills and solve  problems with our interactive coding environment
            </h2>
            <button  onClick={() => navigate('/problems')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium text-lg transition-colors shadow-lg">
              Start Solving
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-6">
        {/* Features Section */}
        <section className="my-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Why Choose Our Platform
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-blue-500">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Real Coding Environment</h3>
              <p className="text-gray-600">
                Practice with our browser-based IDE that supports multiple programming languages with instant feedback.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-purple-500">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Curated Challenges</h3>
              <p className="text-gray-600">
                Solve problems ranging from beginner to advanced levels, carefully designed by industry experts.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-green-500">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Track Your Progress</h3>
              <p className="text-gray-600">
                Monitor your improvement with detailed analytics and personalized recommendations.
              </p>
            </div>
          </div>
        </section>

        {/* Problem Categories */}
        <section className="my-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Problem Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Arrays', count: 120 },
              { name: 'Linked List', count: 85 },
              { name: 'Stack', count: 45 },
              { name: 'Queue', count: 30 },
              { name: 'Dynamic Programming', count: 25 },
              { name: 'Trees', count: 65 },
              { name: 'Graphs', count: 90 },
              { name: 'Strings', count: 75 },
            ].map((category, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="font-medium text-gray-800">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} problems</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Fixed Footer */}
      <footer className="bg-gray-800 text-white p-4 text-center fixed bottom-0 w-full">
        <div className="container mx-auto flex justify-between items-center">
          <p className="text-sm">
            This platform uses cookies to enhance your experience.  
            <button className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors">
              Accept
            </button>
          </p>
          <div className="hidden md:flex space-x-4 text-sm">
            <a href="#" className="hover:text-blue-400">Terms</a>
            <a href="#" className="hover:text-blue-400">Privacy</a>
            <a href="#" className="hover:text-blue-400">Contact</a>
          </div>
        </div>
      </footer>{showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}

    </div>
    
  );
};

export default FrontPage;




