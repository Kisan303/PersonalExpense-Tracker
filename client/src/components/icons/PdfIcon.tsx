import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const PdfIcon: React.FC<IconProps> = ({ className, size = 24 }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M8 11v2c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-2" />
    </svg>
  );
};

export default PdfIcon;