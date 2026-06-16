import { NavLink } from 'react-router-dom';
import { Home, Users, UserPlus, LogOut, Settings, Calendar, X, IndianRupee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Rent Ledger', path: '/ledger', icon: Calendar },
    { name: 'Add Student', path: '/add-student', icon: UserPlus },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden animate-in fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={`fixed md:sticky top-0 left-0 z-40 w-64 h-screen bg-white border-r border-slate-200 flex flex-col shadow-sm transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-primary-600 tracking-tight">PG Manager</h1>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

      <div className="flex-1 py-6 px-4 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon size={20} className="shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-all duration-200 font-medium"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
