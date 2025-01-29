import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`rounded-lg border bg-white shadow-sm dark:bg-gray-800 ${className || ''}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className }) => {
  return <div className={`p-6 ${className || ''}`}>{children}</div>;
};

export const CardTitle: React.FC<CardProps> = ({ children, className }) => {
  return (
    <h3 className={`text-lg font-medium leading-6 text-gray-900 dark:text-white ${className || ''}`}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<CardProps> = ({ children, className }) => {
  return (
    <p className={`mt-1 text-sm text-gray-500 dark:text-gray-400 ${className || ''}`}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<CardProps> = ({ children, className }) => {
  return <div className={`p-6 pt-0 ${className || ''}`}>{children}</div>;
};

export default Card;