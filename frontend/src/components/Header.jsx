import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/digger.png"; // Your logo image
import UploadDocument from "./UploadDocument";
import About from "./About";

export function Header() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [showAboutPopup, setShowAboutPopup] = useState(false);
  const [role, setRole] = useState(""); // State to store user role
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve user role from session storage
    const storedRole = sessionStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const toggleUploadPopup = () => {
    setShowUploadPopup(!showUploadPopup);
    document.body.style.overflow = "auto";
  };

  const toggleAboutPopup = () => {
    setShowAboutPopup(!showAboutPopup);
    document.body.style.overflow = "auto";
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        sessionStorage.removeItem("isAuthenticated");
        sessionStorage.removeItem("role");
        navigate("/"); // Redirect to login page
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("An error occurred during logout", error);
    }
  };

  return (
    <header className="flex items-center justify-between pr-4 pb-3 pt-3">
      {/* Logo and App Name */}
      <div className="flex items-center space-x-2">
        <img src={logo} alt="App Logo" className="w-8 h-8" />
        <h1 className="text-1xl text-gray-800">Packos Digger RAG App</h1>        
      </div>

      {/* User Options */}
      <div className="flex items-center space-x-4">
        <button onClick={toggleMenu} className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-menu"
            viewBox="0 0 24 24"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div
          id="dropdownDots"
          className={`${
            menuVisible ? "" : "hidden"
          } bg-white divide-y divide-gray-700 rounded-lg shadow w-44 absolute top-12 right-0 mt-2 z-10`}
        >
          <ul className="py-1 text-sm text-gray-700">
            <li onClick={handleLogout} className="block px-4 py-1">
              Logout
            </li>
            {role === "admin" && (
              <li onClick={toggleUploadPopup} className="block px-4 py-1">
                Upload Documents
              </li>
            )}
            <li onClick={toggleAboutPopup} className="block px-4 py-1">
              About
            </li>
          </ul>
        </div>
      </div>

      {showUploadPopup && <UploadDocument onClose={toggleUploadPopup} />}
      {showAboutPopup && <About onClose={toggleAboutPopup} />}
    </header>
  );
}
