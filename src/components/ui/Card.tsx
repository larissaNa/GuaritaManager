import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow';
  subtitle?: string;
  showVisibilityToggle?: boolean;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  value, 
  icon, 
  color = 'blue', 
  subtitle, 
  showVisibilityToggle = false,
  isVisible = true,
  onToggleVisibility 
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon && (
              <div className={`p-3 rounded-md ${colorClasses[color]} text-white`}>
                {icon}
              </div>
            )}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate flex items-center justify-between">
                <span>{title}</span>
                {showVisibilityToggle && (
                  <button
                    onClick={onToggleVisibility}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title={isVisible ? "Ocultar valor" : "Mostrar valor"}
                  >
                    {isVisible ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    )}
                  </button>
                )}
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {isVisible ? value : '••••••'}
              </dd>
              {subtitle && (
                <dd className="text-sm text-gray-600">{subtitle}</dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};
