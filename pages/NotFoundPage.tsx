import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center flex flex-col items-center justify-center h-[60vh]">
      <h1 className="text-6xl font-bold text-zinc-900 dark:text-slate-50">404</h1>
      <p className="text-2xl mt-4 mb-2 text-zinc-800 dark:text-zinc-200">Oops! Page not found</p>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-sm">The page you are looking for does not exist or has been moved.</p>
      <Link to="/dashboard">
        <Button>
          Go back to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;