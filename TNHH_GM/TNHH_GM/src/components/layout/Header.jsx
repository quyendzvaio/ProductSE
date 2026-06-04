import React from 'react';
import logo from '../../assets/GMlogo.png';

const Header = ({
  currentPage,
  isAuthenticated,
  onNavigateHome,
  onOpenWarehouse,
  onOpenLogin,
  onLogout,
}) => {
  const warehouseClassName =
    currentPage === 'warehouse'
      ? 'text-white'
      : 'hover:text-white transition-colors';

  return (
    <header className="w-full bg-white flex flex-col">
      <div className="w-full bg-gray-100 border-b border-gray-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-2.5 flex justify-between items-center text-[11px] text-gray-500 font-medium">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Store Location: Dan Phong, Ha Noi, Viet Nam</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <span className="hover:text-green-600 cursor-pointer">Eng</span>
              <span className="text-gray-300">|</span>
              <span className="hover:text-green-600 cursor-pointer">USD</span>
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex gap-1.5">
              {isAuthenticated ? (
                <>
                  <span className="text-green-600 font-semibold">Admin</span>
                  <span>/</span>
                  <button type="button" onClick={onLogout} className="hover:text-green-600">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={onOpenLogin} className="hover:text-green-600">
                    Sign In
                  </button>
                  <span>/</span>
                  <button type="button" className="hover:text-green-600">Sign Up</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-wrap lg:flex-nowrap justify-between items-center gap-6">
          <button type="button" onClick={onNavigateHome} className="flex items-center gap-2 cursor-pointer">
            <img
              src={logo}
              alt="GM Logo"
              className="w-8 h-8 object-contain rounded"
            />
            <span className="text-2xl font-bold tracking-tight text-gray-900">GM</span>
          </button>

          <div className="flex-grow max-w-2xl hidden md:flex border border-gray-200 rounded-md overflow-hidden focus-within:border-green-500 transition-colors">
            <div className="flex items-center px-4 bg-gray-50 border-r border-gray-200 cursor-pointer text-sm font-medium text-gray-700 min-w-[140px]">
              Tất cả danh mục
              <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search"
              className="flex-grow px-4 py-2.5 outline-none text-sm text-gray-700"
            />
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 font-semibold transition-colors">
              Search
            </button>
          </div>

          <div className="flex items-center gap-5">
            <button className="relative text-gray-800 hover:text-green-600 transition-colors">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <div className="w-px h-6 bg-gray-200"></div>
            <button className="flex items-center gap-3 text-gray-800 hover:text-green-600 transition-colors group">
              <div className="relative">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="absolute -top-1.5 -right-1.5 bg-green-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  2
                </span>
              </div>
              <div className="hidden lg:flex flex-col items-start text-xs leading-tight">
                <span className="text-gray-400 font-medium">Shopping cart:</span>
                <span className="font-bold text-[14px] group-hover:text-green-600">$57.00</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center h-14">
          <div className="flex items-center h-full gap-8">
            <button className="bg-green-600 hover:bg-green-700 transition-colors h-full px-6 flex items-center gap-3 font-semibold text-sm cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              All Categories
            </button>

            <nav className="hidden lg:flex gap-8 text-sm font-medium text-gray-300">
              <button type="button" onClick={onNavigateHome} className="hover:text-white transition-colors flex items-center gap-1">
                Home
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button type="button" className="hover:text-white transition-colors flex items-center gap-1">
                Shop
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button type="button" className="hover:text-white transition-colors flex items-center gap-1">
                Pages
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button type="button" className="hover:text-white transition-colors flex items-center gap-1">
                Blog
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button type="button" className="hover:text-white transition-colors">About Us</button>
              <button type="button" className="hover:text-white transition-colors">Contact Us</button>
              <button type="button" onClick={onOpenWarehouse} className={warehouseClassName}>
                KHO
              </button>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm font-semibold">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            (+84) 98-192-7503
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
