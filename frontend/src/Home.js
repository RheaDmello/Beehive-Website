import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
 const navigate = useNavigate();

 return (
 <div className="min-h-screen bg-black text-white overflow-hidden relative">
 {/* Background glow */}
 <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-orange-500/10 to-black blur-3xl"></div>

 {/* Navbar */}
 <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10">
 <h1 className="text-2xl font-bold tracking-wide text-yellow-400">
 Beehive AI
 </h1>
 <button
 onClick={() => navigate("/dashboard")}
 className="px-5 py-2 rounded-full bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition"
 >
 Open Dashboard
 </button>
 </nav>

 {/* Hero Section */}
 <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-24">
 <div className="max-w-4xl">
 <p className="inline-block px-4 py-1 mb-6 text-sm rounded-full border border-yellow-400/40 bg-yellow-400/10 text-yellow-300">
 Smart Monitoring for Modern Beehives
 </p>

 <h2 className="text-5xl md:text-7xl font-extrabold leading-tight bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-500 bg-clip-text text-transparent">
 Protect Your Hive <br /> With Intelligent Insights
 </h2>

 <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
 Monitor hive health, detect predators, and analyze activity with a
 modern AI-powered dashboard designed for beekeepers.
 </p>

 <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
 <button
 onClick={() => navigate("/dashboard")}
 className="px-8 py-3 rounded-xl bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition shadow-lg shadow-yellow-500/20"
 >
 Get Started
 </button>

 <button className="px-8 py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition">
 Learn More
 </button>
 </div>
 </div>
 </section>

 {/* Features */}
 <section className="relative z-10 px-6 md:px-16 pb-20">
 <div className="grid md:grid-cols-3 gap-6">
 <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:scale-105 transition">
 <h3 className="text-xl font-semibold text-yellow-300 mb-3">
 Audio Analysis
 </h3>
 <p className="text-gray-300">
 Detect unusual hive sounds and identify stress patterns with smart
 monitoring.
 </p>
 </div>

 <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:scale-105 transition">
 <h3 className="text-xl font-semibold text-yellow-300 mb-3">
 Predator Alerts
 </h3>
 <p className="text-gray-300">
 Get real-time alerts when threats or unusual external activity are
 detected near the hive.
 </p>
 </div>

 <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:scale-105 transition">
 <h3 className="text-xl font-semibold text-yellow-300 mb-3">
 Hive Health Insights
 </h3>
 <p className="text-gray-300">
 Visualize colony condition, track previous analyses, and make
 better decisions faster.
 </p>
 </div>
 </div>
 </section>

 {/* CTA */}
 <section className="relative z-10 px-6 md:px-16 pb-24">
 <div className="rounded-3xl border border-yellow-400/20 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 p-10 text-center backdrop-blur-xl">
 <h3 className="text-3xl md:text-4xl font-bold text-yellow-300">
 Start Monitoring Smarter
 </h3>
 <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
 Bring AI into your beekeeping workflow and keep your hive protected,
 healthy, and productive.
 </p>
 <button
 onClick={() => navigate("/dashboard")}
 className="mt-8 px-8 py-3 rounded-xl bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition"
 >
 Go to Dashboard
 </button>
 </div>
 </section>
 </div>
 );
}

export default Home;