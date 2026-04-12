import React from 'react';
import { FcGoogle } from 'react-icons/fc';        // Icon Google chính thức
import { FaFacebook } from 'react-icons/fa';      // Icon Facebook

export default function SocialAuth() {
  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth later
    console.log('Google login clicked');
    // window.location.href = '/api/auth/google';
  };

  const handleFacebookLogin = () => {
    // TODO: Implement Facebook OAuth later
    console.log('Facebook login clicked');
    // window.location.href = '/api/auth/facebook';
  };

  return (
    <>
      {/* Divider */}
      <div className="relative my-10">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-6 text-xs font-bold tracking-[0.125em] text-slate-400 uppercase">
            Hoặc tiếp tục với
          </span>
        </div>
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-3 h-12 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100 transition-all rounded-xl font-medium text-slate-700"
        >
          <FcGoogle size={20} />
          <span className="text-sm">Google</span>
        </button>

        {/* Facebook Button */}
        <button
          onClick={handleFacebookLogin}
          className="flex items-center justify-center gap-3 h-12 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100 transition-all rounded-xl font-medium text-slate-700"
        >
          <FaFacebook size={20} className="text-[#1877F2]" />
          <span className="text-sm">Facebook</span>
        </button>
      </div>

      {/* Note */}
      <p className="text-center text-[10px] text-slate-400 mt-6">
        Chúng tôi không chia sẻ thông tin cá nhân của bạn với bên thứ ba
      </p>
    </>
  );
}