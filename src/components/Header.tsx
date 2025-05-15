
import React from 'react';
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn("w-full py-4 border-b", className)}>
      <div className="container flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img 
            src="/logo.svg" 
            alt="Kollect-It" 
            className="h-8 w-8"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI2IiBmaWxsPSIjM0I4MkY2Ii8+PHBhdGggZD0iTTExIDhoLTJ2MTZoMnYtN2g4djdoMlY4aC0ydjdoLTh2LTd6IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==';
            }}
          />
          <h1 className="text-xl font-bold">Kollect-It Image Optimizer</h1>
        </div>
        <a 
          href="https://kollect-it.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-brand-blue hover:underline"
        >
          Visit Kollect-It.com
        </a>
      </div>
    </header>
  );
};

export default Header;
