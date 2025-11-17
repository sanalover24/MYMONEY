import React from 'react';
import { useLocation, NavLink, Outlet } from 'react-router-dom';
import { 
  PlusCircleIcon, SearchIcon, LogOutIcon, LayoutGridIcon, 
  ArrowRightLeftIcon, WalletIcon, MoreHorizontalIcon, PlusIcon 
} from './icons';
import { useData } from '../context/DataContext';
import { useSearch } from '../context/SearchContext';
import Sidebar from './Sidebar';

const getPageTitle = (pathname: string): string => {
  if (pathname.startsWith('/credit/person/')) {
    const name = decodeURIComponent(pathname.split('/').pop() || '');
    return `${name}'s Profile`;
  }
  if (pathname.startsWith('/credit/')) return 'Credit Details';
  if (pathname.startsWith('/credit-received/')) return 'Credit Received Details';
  
  const path = pathname.split('/').pop() || 'dashboard';
  if (path === 'add') return 'Add Transaction';
  if (path === 'profile') return 'Settings';
  if (path === 'more') return 'More';
  if (path === '') return 'Dashboard';
  const title = path.charAt(0).toUpperCase() + path.slice(1);
  return title.replace('-', ' ');
}

const RightSidebar: React.FC<{onLogout: () => void}> = ({onLogout}) => {
  const { user, transactions } = useData();
  const recentTransactions = transactions ?? [];

  const getIconForCategory = (category: string) => {
    if (!category) return '💰';
    const lower = category.toLowerCase();
    if (lower.includes('food') || lower.includes('apple')) return '🍎';
    if (lower.includes('shopping')) return '🛍️';
    if (lower.includes('transport')) return '🚌';
    if (lower.includes('entertainment') || lower.includes('netflix')) return '🎬';
    return '💰';
  };

  return (
    <aside className="hidden xl:flex flex-col w-[350px] bg-white/50 dark:bg-black/20 backdrop-blur-lg p-6 border-l border-white/40 dark:border-white/10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-zinc-800 dark:text-white">Profile</h2>
        <button onClick={onLogout} className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-rose-500 dark:hover:text-rose-500 transition-colors rounded-full hover:bg-rose-100 dark:hover:bg-zinc-700">
          <LogOutIcon className="w-5 h-5"/>
        </button>
      </div>
      <div className="flex flex-col items-center text-center mb-8">
        <img 
          src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${user?.email ?? 'guest'}`} 
          alt="User Avatar" 
          className="w-20 h-20 rounded-full mb-4 ring-2 ring-offset-2 ring-brand-500 dark:ring-offset-zinc-900"
        />
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">{user?.name ?? 'User'}</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{user?.email ?? ''}</p>
      </div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-zinc-800 dark:text-white">Transactions</h2>
        <NavLink to="/transactions" className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">
          See more
        </NavLink>
      </div>
      <div className="space-y-4">
        {recentTransactions.slice(0, 4).map(t => (
          <div key={t?.id ?? Math.random()} className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-700 flex items-center justify-center text-xl mr-4">
              {getIconForCategory(t?.category)}
            </div>
            <div className="flex-grow">
              <p className="font-semibold text-zinc-800 dark:text-white">{t?.category ?? 'Unknown'}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {t?.date ? new Date(t.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
              </p>
            </div>
            <p className={`font-semibold ${t?.type === 'expense' ? 'text-zinc-800 dark:text-white' : 'text-emerald-500'}`}>
              {t?.type === 'expense' ? '-' : '+'}Rs. {t?.amount?.toLocaleString('en-IN') ?? 0}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
};

const MobileNavLink: React.FC<{ to: string; icon: React.FC<{className?:string}>; label: string }> = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center w-full transition-colors h-full pt-2
      ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-zinc-500 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400'}`
    }
  >
    <Icon className="w-6 h-6 mb-1" />
    <span className="text-[10px] font-medium">{label}</span>
  </NavLink>
);

const Layout: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const { user, transactions } = useData();
  const { searchTerm, setSearchTerm, isSearchable } = useSearch();
  
  const safeTransactions = transactions ?? [];

  return (
    <div className="text-zinc-800 dark:text-zinc-200">
      <div className="md:grid md:grid-cols-[250px_1fr] xl:grid-cols-[250px_1fr_350px]">
        <Sidebar />

        <div className="flex-1 w-full min-h-screen">
          {/* --- Mobile Header --- */}
          <div className="md:hidden p-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-zinc-800 dark:text-white">{pageTitle}</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Welcome back, {user?.name ?? 'User'}</p>
            </div>
            <NavLink to="/profile">
              <img 
                src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${user?.email ?? 'guest'}`} 
                alt="User Avatar" 
                className="w-10 h-10 rounded-full ring-2 ring-offset-2 ring-brand-500 dark:ring-offset-zinc-900"
              />
            </NavLink>
          </div>

          {/* --- Desktop Header --- */}
          <header className="hidden md:flex bg-white/50 dark:bg-black/20 backdrop-blur-lg items-center justify-between h-20 px-4 md:px-8 sticky top-0 z-20 border-b border-white/40 dark:border-white/10">
            <h1 className="text-3xl font-bold text-zinc-800 dark:text-white">{pageTitle}</h1>
            <div className="flex items-center gap-4">
              {isSearchable && (
                <div className="relative animate-fade-in w-64">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input 
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/70 dark:bg-black/20 border dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              )}
              <NavLink 
                to="/add" 
                className="bg-gradient-to-br from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 rounded-lg p-2.5 font-semibold shadow-sm hover:shadow-md transform transition-all duration-200 flex items-center justify-center"
              >
                <PlusCircleIcon className="w-5 h-5"/>
              </NavLink>
            </div>
          </header>

          <main className="pb-24 md:pb-0">
            <div className="container mx-auto px-4 md:px-8 pt-4 md:pt-8 pb-8">
              {isSearchable && (
                <div className="md:hidden mb-6 animate-fade-in-down">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input 
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/70 dark:bg-black/20 border dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              )}
              <Outlet />
            </div>
          </main>
        </div>

        <RightSidebar onLogout={onLogout} />
      </div>

      {/* --- Mobile Bottom Nav --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/70 dark:bg-black/30 backdrop-blur-lg border-t border-slate-200/50 dark:border-white/10 z-30">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto relative">
          <MobileNavLink to="/dashboard" icon={LayoutGridIcon} label="Dashboard" />
          <MobileNavLink to="/transactions" icon={ArrowRightLeftIcon} label="Transactions" />
          <div className="w-20" /> {/* Spacer for FAB */}
          <MobileNavLink to="/wallet" icon={WalletIcon} label="Wallet" />
          <MobileNavLink to="/more" icon={MoreHorizontalIcon} label="More" />

          <NavLink
            to="/add"
            className="absolute left-1/2 -translate-x-1/2 -top-6 w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 active:scale-100"
            aria-label="Add new transaction"
          >
            <PlusIcon className="w-8 h-8" />
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
