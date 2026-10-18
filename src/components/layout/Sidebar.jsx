import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  FiGrid,
  FiFolder,
  FiCode,
  FiBriefcase,
  FiBook,
  FiBookOpen,
  FiFileText,
  FiMessageCircle,
  FiMail,
  FiUser,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiExternalLink,
  FiX,
} from 'react-icons/fi';
import { logout } from '@/redux/features/authSlice';
import { useLogoutApiMutation } from '@/redux/api/apiSlice';
import { ThemeToggle } from '../common/ThemeToggle';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin', icon: FiGrid },
  { name: 'Projects', path: '/admin/projects', icon: FiFolder },
  { name: 'Skills', path: '/admin/skills', icon: FiCode },
  { name: 'Experience', path: '/admin/experience', icon: FiBriefcase },
  { name: 'Education', path: '/admin/education', icon: FiBook },
  { name: 'Courses', path: '/admin/courses', icon: FiBookOpen },
  { name: 'Blogs & Articles', path: '/admin/blogs', icon: FiFileText },
  { name: 'Testimonials', path: '/admin/testimonials', icon: FiMessageCircle },
  { name: 'Messages', path: '/admin/messages', icon: FiMail },
  { name: 'About Me', path: '/admin/about', icon: FiUser },
  { name: 'Admin Users', path: '/admin/users', icon: FiUsers },
  { name: 'Settings', path: '/admin/settings', icon: FiSettings },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApi] = useLogoutApiMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // ignore
    } finally {
      dispatch(logout());
      toast.success('Signed out successfully');
      navigate('/');
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
            <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              Admin Portal
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/25'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-medium text-slate-500">Theme</span>
            <ThemeToggle />
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FiExternalLink className="w-4 h-4" />
            Live Website
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <FiLogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
};
