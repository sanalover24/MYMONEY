import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGridIcon, WalletIcon, FolderIcon, SettingsIcon, UsersIcon, ArrowRightLeftIcon, DownloadIcon } from './icons';

export const navItems = [
  { path: '/dashboard', icon: LayoutGridIcon, label: 'Dashboard' },
  { path: '/transactions', icon: ArrowRightLeftIcon, label: 'Transactions' },
  { path: '/wallet', icon: WalletIcon, label: 'My Wallet' },
  { path: '/credit', icon: UsersIcon, label: 'Credit Lent' },
  { path: '/credit-received', icon: DownloadIcon, label: 'Credit Received' },
  { path: '/categories', icon: FolderIcon, label: 'Categories' },
  { path: '/profile', icon: SettingsIcon, label: 'Settings' },
];

const Sidebar: React.FC = () => {
    const baseLinkClasses = "flex items-center px-4 py-2.5 text-zinc-500 dark:text-zinc-400 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors font-medium";
    const activeLinkClasses = "bg-gradient-to-r from-brand-500 to-brand-600 text-white dark:text-white font-semibold shadow-lg shadow-brand-500/30";

    return (
        <aside className="hidden md:flex flex-col w-[250px] bg-white/50 dark:bg-black/20 backdrop-blur-lg min-h-screen p-4 border-r border-white/40 dark:border-white/10">
            <div className="text-2xl font-bold tracking-wider mb-12 px-2 text-zinc-800 dark:text-white">
                MYMONEY.
            </div>
            <nav className="flex-grow">
                <ul className="space-y-2">
                    {navItems.map(item => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;