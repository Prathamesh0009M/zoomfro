import React from 'react';
import { Link } from 'react-router-dom';
import logo from './logo.png'; // Make sure this is the correct path to your logo image

const Navbar = () => {
  return (
    <nav className="navbar sticky top-0 bg-richblack-900 py-4 shadow-md flex items-center justify-between px-4 md:px-8 z-50">
      <div className="flex items-center justify-center w-full">
        {/* Logo on the left, but centered on both mobile and desktop */}
        <img src={logo} alt="Logo" className="h-10 mr-4" />
        {/* Name centered on both mobile and desktop */}
        <h1 className="text-3xl font-bold text-white">Nexier's Production</h1>
      </div>
    </nav>
  );
};

export default Navbar;
