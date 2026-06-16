import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, UserPlus, LogOut, Settings, Calendar, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Rent Ledger', path: '/ledger', icon: Calendar },
    { name: 'Add Student', path: '/add-student', icon: UserPlus },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex overflow-hidden">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 tracking-tight">Radhe Krishn Niwas</h1>
            </div>
            <div className="hidden md:-my-px md:ml-8 md:flex md:space-x-2 lg:space-x-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-all ${
                      isActive
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                    }`
                  }
                >
                  <item.icon size={18} className="mr-2 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
          <div className="hidden md:ml-6 md:flex md:items-center">
            <button
              onClick={logout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
            >
              <LogOut size={18} className="mr-2 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white shadow-lg absolute w-full left-0 animate-in slide-in-from-top-2 duration-200">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900'
                  }`
                }
              >
                <item.icon size={20} className="mr-3" />
                {item.name}
              </NavLink>
            ))}
            <button
              onClick={logout}
              className="w-full flex items-center pl-3 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
