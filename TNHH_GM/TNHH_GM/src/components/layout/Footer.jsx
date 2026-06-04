import React from 'react';
import logo from '../../assets/GMlogo.png'; 
const Footer = () => {
  return (
    <footer className="w-full flex flex-col">
      
      {/* 1. NEWSLETTER SECTION (Nền xám nhạt) */}
      <div className="w-full bg-gray-50 border-t border-gray-200 py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="w-full md:w-1/3 text-center md:text-left">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Subcribe our Newsletter</h3>
            <p className="text-sm text-gray-500">Pellentesque eu nibh eget mauris congue mattis mattis nec tellus. Phasellus imperdiet elit eu magna.</p>
          </div>

          <div className="w-full md:w-1/3 flex relative">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="w-full pl-4 pr-32 py-3 rounded-full border border-gray-200 outline-none focus:border-green-500 text-sm"
            />
            <button className="absolute right-0 top-0 h-full bg-green-600 hover:bg-green-700 text-white px-6 rounded-full font-bold text-sm transition-colors">
              Subscribe
            </button>
          </div>

          <div className="w-full md:w-auto flex justify-center md:justify-end gap-3">
             {/* Social Icons */}
             <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-green-600 hover:text-white transition-colors hover:border-green-600">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
             </a>
             <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-green-600 hover:text-white transition-colors hover:border-green-600">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
             </a>
          </div>

        </div>
      </div>

      {/* 2. MAIN FOOTER (Nền xám đậm) */}
      <div className="w-full bg-[#1A1A1A] text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Cột 1: Thông tin công ty (Chiếm 2 cột) */}
          <div className="lg:col-span-2">
            <div className="flex items-start gap-2 mb-6">
              <img 
                            src={logo} 
                            alt="GM Logo" 
                            className="w-8 h-8 object-contain rounded" 
                          />
              <span className="text-2xl font-bold tracking-tight text-white">GM</span>
            </div>
            <p className="text-sm mb-6 leading-relaxed max-w-sm">
              Morbi cursus porttitor enim lobortis molestie. Duis gravida turpis dui, eget bibendum magna congue nec.
            </p>
            <div className="flex gap-4">
              <span className="font-medium text-white border-b-2 border-green-600 pb-1 cursor-pointer hover:text-green-500">(+84) 98-192-7503</span>
              <span>or</span>
              <span className="font-medium text-white border-b-2 border-green-600 pb-1 cursor-pointer hover:text-green-500">tnhhgm@gmail.com</span>
            </div>
          </div>

          {/* Cột 2: My Account */}
          <div>
            <h4 className="text-white font-semibold mb-5">My Account</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">My Account</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Order History</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shopping Cart</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Wishlist</a></li>
            </ul>
          </div>

          {/* Cột 3: Helps */}
          <div>
            <h4 className="text-white font-semibold mb-5">Helps</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Faqs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms & Condition</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Cột 4: Proxy */}
          <div>
            <h4 className="text-white font-semibold mb-5">Proxy</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shop</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Product</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Track Order</a></li>
            </ul>
          </div>

        </div>
      </div>

      {/* 3. COPYRIGHT SECTION (Nền đen nhất) */}
      <div className="w-full bg-[#111111] py-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>Ecobazar eCommerce © 2026. All Rights Reserved</p>
          <div className="flex gap-2 mt-4 md:mt-0">
             {/* Giả lập các logo thanh toán bằng các khối màu xám */}
             <div className="w-10 h-6 bg-gray-800 rounded border border-gray-700 flex items-center justify-center text-[8px] font-bold text-gray-400">VISA</div>
             <div className="w-10 h-6 bg-gray-800 rounded border border-gray-700 flex items-center justify-center text-[8px] font-bold text-gray-400">PAY</div>
             <div className="w-10 h-6 bg-gray-800 rounded border border-gray-700 flex items-center justify-center text-[8px] font-bold text-gray-400">CARD</div>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;