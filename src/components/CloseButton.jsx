import { X } from 'lucide-react';

const CloseButton = ({ onClick, className = '' }) => {
  return (
    <button 
      onClick={onClick} 
      className={`absolute top-2 right-2 text-gray-600 hover:text-gray-900 ${className}`}
    >
      <X size={12} />
    </button>
  );
};

export default CloseButton;