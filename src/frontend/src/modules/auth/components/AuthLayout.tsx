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
  imageSrc = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop" 
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Side: Immersive Visual */}
      <section className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 z-10" />
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          alt="Serene Medical Environment" 
          className="absolute inset-0 w-full h-full object-cover" 
          src={imageSrc}
          referrerPolicy="no-referrer"
        />
        
        {/* Branding Overlay */}
        <div className="absolute top-12 left-12 z-20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/90 backdrop-blur-md flex items-center justify-center text-primary shadow-sm border border-white/20">
              <HeartPulse size={28} strokeWidth={1.5} />
            </div>
            <span className="font-headline font-bold text-3xl tracking-tight text-white drop-shadow-lg">
              The Clinical Sanctuary
            </span>
          </div>
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-24 left-12 right-12 z-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-xl"
          >
            <h1 className="font-headline text-6xl font-bold leading-[1.1] text-white mb-6 drop-shadow-xl">
              {title}
            </h1>
            <p className="text-xl font-medium text-white/90 max-w-md leading-relaxed">
              {subtitle}
            </p>
          </motion.div>
        </div>
        
        {/* Decorative Element */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-light/20 blur-[100px] rounded-full -mr-32 -mb-32 z-10" />
      </section>

      {/* Right Side: Form Content */}
      <section className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 lg:p-24 relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1a3a3a 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile Branding */}
          <div className="md:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-primary flex items-center justify-center text-white shadow-md">
              <HeartPulse size={22} />
            </div>
            <span className="font-headline font-bold text-2xl tracking-tight text-primary">
              Sanctuary
            </span>
          </div>

          {children}

          {/* Footer */}
          <footer className="mt-16 w-full flex flex-col gap-6 text-center">
            <div className="flex flex-wrap justify-center gap-8">
              <a className="text-[9px] font-bold text-slate-400 hover:text-primary transition-colors tracking-[0.2em] uppercase" href="#">Privacy</a>
              <a className="text-[9px] font-bold text-slate-400 hover:text-primary transition-colors tracking-[0.2em] uppercase" href="#">Terms</a>
              <a className="text-[9px] font-bold text-slate-400 hover:text-primary transition-colors tracking-[0.2em] uppercase" href="#">Support</a>
            </div>
            <p className="text-[9px] uppercase tracking-[0.4em] text-slate-300 font-bold">
              © 2026 THE CLINICAL SANCTUARY
            </p>
          </footer>
        </motion.div>
      </section>
    </div>
  );
}
