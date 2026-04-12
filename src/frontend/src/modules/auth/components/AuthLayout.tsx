import React from 'react';
import { motion } from "framer-motion";
import { HeartPulse } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: React.ReactNode;
  subtitle: string;
  imageSrc?: string;
}

export default function AuthLayout({ 
  children, 
  title, 
  subtitle, 
  imageSrc = "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=2069&auto=format&fit=crop" 
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Left Side: Visual Section */}
      <section className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden">
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent z-10" />

        {/* Background Image */}
        <motion.img 
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 12, repeat: Infinity, repeatType: "reverse" }}
          alt="Medical Environment" 
          className="absolute inset-0 w-full h-full object-cover" 
          src={imageSrc}
          referrerPolicy="no-referrer"
        />

        {/* Branding Overlay */}
        <div className="absolute top-12 left-12 z-20 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/95 backdrop-blur-md flex items-center justify-center text-primary rounded-xl shadow-lg border border-white/30">
            <HeartPulse size={28} strokeWidth={1.8} />
          </div>
          <div>
            <span className="font-headline font-bold text-3xl tracking-tighter text-white drop-shadow-lg">
              CareFirst
            </span>
            <p className="text-white/70 text-sm -mt-1">Clinic</p>
          </div>
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-24 left-12 right-12 z-20 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="font-headline text-6xl lg:text-7xl font-bold leading-[1.05] text-white mb-6 drop-shadow-2xl">
              {title}
            </h1>
            <p className="text-xl font-medium text-white/90 leading-relaxed">
              {subtitle}
            </p>
          </motion.div>
        </div>

        {/* Decorative Glow */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -mr-40 -mb-40 z-10" />
      </section>

      {/* Right Side: Form Area */}
      <section className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 lg:p-24 bg-white relative">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" 
             style={{ 
               backgroundImage: 'radial-gradient(#0a7e8c 1px, transparent 1px)', 
               backgroundSize: '28px 28px' 
             }} 
        />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile Branding */}
          <div className="md:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary flex items-center justify-center text-white rounded-2xl shadow">
              <HeartPulse size={24} strokeWidth={2} />
            </div>
            <div>
              <span className="font-headline font-bold text-2xl tracking-tight text-primary">
                CareFirst
              </span>
              <p className="text-primary/70 text-xs -mt-1">Clinic</p>
            </div>
          </div>

          {/* Form Content */}
          {children}

          {/* Footer */}
          <footer className="mt-16 text-center">
            <div className="flex justify-center gap-6 text-xs text-slate-400 mb-4">
              <a href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</a>
              <a href="#" className="hover:text-primary transition-colors">Điều khoản dịch vụ</a>
              <a href="#" className="hover:text-primary transition-colors">Hỗ trợ</a>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-slate-300 font-medium">
              © 2026 CareFirst Clinic • All rights reserved
            </p>
          </footer>
        </motion.div>
      </section>
    </div>
  );
}