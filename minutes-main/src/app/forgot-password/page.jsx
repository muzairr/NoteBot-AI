import React from "react";
import { Navbar } from "../components/Navbar";
export default function ForgotPassword () {
    return (
        <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-blue-600 mb-6">Forgot Password</h2>
      <p className="text-sm text-gray-600 mb-4">New Password</p>
      <form>
        <div className="mb-6">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">EMAIL</label>
          <input type="email" id="email" className="w-full px-3 py-2 border rounded-md" />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">send</button>
      </form>
    </div>
      </div>
    )
}