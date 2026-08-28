import React from 'react';
import Navbar from '../components/landing/Navbar';
import HeroBanner from '../components/landing/HeroBanner';
import MapSection from '../components/landing/MapSection';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col font-sans antialiased text-slate-800">
      {/* Encabezado Superior */}
      <Navbar />

      {/* Contenido Principal */}
      <main className="flex-1">
        <HeroBanner />
        <MapSection />
      </main>

      {/* Pie de Página */}
      <Footer />
    </div>
  );
}
