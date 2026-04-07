import { HeartPulse, MessageCircle, Mail, Globe, PlayCircle, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-20 pb-10 md:pb-20 lg:pb-10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-amber-500"></div>
      
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                <HeartPulse className="h-6 w-6 text-teal-400" />
              </div>
              <span className="font-bold text-2xl text-white tracking-tight">MediCare<span className="text-teal-500">+</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your trusted partner in health since 2010. Providing comprehensive medical services with a focus on quality care and patient comfort.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-teal-500 hover:text-white transition-all">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-teal-500 hover:text-white transition-all">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-teal-500 hover:text-white transition-all">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-teal-500 hover:text-white transition-all">
                <PlayCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              {['About Us', 'Our Doctors', 'Services', 'Contact'].map(link => (
                <li key={link}>
                  <a href={`#${link.toLowerCase().replace(' ', '-')}`} className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 text-sm group">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-teal-500 transition-colors"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: For Patients */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">For Patients</h4>
            <ul className="space-y-3">
              {['How to Book', 'Insurance Partners', 'FAQs', 'Patient Rights'].map(link => (
                <li key={link}>
                  <a href={`#${link.toLowerCase().replace(' ', '-')}`} className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 text-sm group">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-teal-500 transition-colors"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Subscribe Newsletter</h4>
            <p className="text-slate-400 text-sm mb-4">
              Get health tips and 10% off your first checkup package.
            </p>
            <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); alert('Subscribed!'); }}>
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm"
              />
              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-500 text-white py-3 px-6 rounded-xl font-bold transition-all duration-200 flex justify-center items-center gap-2 text-sm"
              >
                Subscribe <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} MediCare+. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
            <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#cookies" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
