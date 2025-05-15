
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-6 border-t">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Kollect-It.com - Image Optimizer
            </p>
          </div>
          <div className="flex space-x-6">
            <a 
              href="#features" 
              className="text-sm text-gray-500 hover:text-brand-blue transition-colors"
            >
              Features
            </a>
            <a 
              href="https://kollect-it.com/contact" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-brand-blue transition-colors"
            >
              Contact
            </a>
            <a 
              href="https://kollect-it.com/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-brand-blue transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
