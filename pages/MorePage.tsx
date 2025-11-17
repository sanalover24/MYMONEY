
import React from 'react';
import { NavLink } from 'react-router-dom';
import Card from '../components/ui/Card';
import { ChevronRightIcon } from '../components/icons';
import { navItems } from '../components/Sidebar';

const moreNavLinks = navItems.filter(item => 
  ['/credit', '/credit-received', '/categories', '/profile'].includes(item.path)
);
    
const descriptions: { [key: string]: string } = {
    '/credit': 'Track money you have lent to others.',
    '/credit-received': 'Manage money you have borrowed.',
    '/categories': 'Organize your income and expenses.',
    '/profile': 'Manage your profile, theme, and data.'
};

const MorePage: React.FC = () => {
  return (
    <div className="space-y-4 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-white px-1">More Options</h1>
        {moreNavLinks.map((item, index) => (
            <NavLink to={item.path} key={item.path} className="block">
                <Card className="!p-4 hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-700/50 flex items-center justify-center">
                                <item.icon className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                            </div>
                            <div>
                                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{item.label}</p>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">{descriptions[item.path]}</p>
                            </div>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-zinc-400" />
                    </div>
                </Card>
            </NavLink>
        ))}
    </div>
  );
};

export default MorePage;