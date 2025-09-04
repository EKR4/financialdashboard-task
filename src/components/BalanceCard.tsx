import React from 'react';

interface BalanceCardProps {
  platformName: string;
  accountNumber: string;
  balance: number;
  currency: string;
  lastUpdated: string;
  onRefresh: () => void;
  isLoading?: boolean;
  type: 'mpesa' | 'sbm' | 'coop';
}

const getCardColor = (type: string): { bg: string; border: string } => {
  switch (type) {
    case 'mpesa':
      return {
        bg: 'from-green-400 to-emerald-600',
        border: 'border-emerald-500',
      };
    case 'sbm':
      return {
        bg: 'from-blue-400 to-indigo-600',
        border: 'border-indigo-500',
      };
    case 'coop':
      return {
        bg: 'from-purple-400 to-purple-600',
        border: 'border-purple-500',
      };
    default:
      return {
        bg: 'from-gray-400 to-gray-600',
        border: 'border-gray-500',
      };
  }
};

const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
};

const BalanceCard: React.FC<BalanceCardProps> = ({
  platformName,
  accountNumber,
  balance,
  currency,
  lastUpdated,
  onRefresh,
  isLoading = false,
  type,
}) => {
  const { bg, border } = getCardColor(type);

  return (
    <div className={`rounded-lg shadow-lg overflow-hidden border ${border} transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl`}>
      <div className={`bg-gradient-to-br ${bg} p-6 text-white`}>
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold">{platformName}</h3>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Refresh balance"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        </div>
        <p className="text-white/80 text-sm mt-1">Account: {accountNumber}</p>
        <div className="mt-6">
          <p className="text-2xl md:text-3xl font-bold tracking-tight">
            {formatCurrency(balance, currency)}
          </p>
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
          <div className="text-xs">
            Last updated: {formatDate(lastUpdated)}
          </div>
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;