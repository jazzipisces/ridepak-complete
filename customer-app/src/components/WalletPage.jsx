import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Minus, 
  ArrowUpRight, 
  ArrowDownLeft,
  Wallet,
  Gift,
  History,
  Settings
} from 'lucide-react';
import NavBar from './NavBar';

const WalletPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('balance');
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('');

  const transactions = [
    {
      id: 1,
      type: 'debit',
      amount: 180,
      description: 'Ride to F-7 Markaz',
      date: '2024-09-12',
      time: '14:30',
      status: 'completed'
    },
    {
      id: 2,
      type: 'credit',
      amount: 1000,
      description: 'Wallet Top-up',
      date: '2024-09-12',
      time: '10:15',
      status: 'completed'
    },
    {
      id: 3,
      type: 'debit',
      amount: 220,
      description: 'Ride to G-9 Markaz',
      date: '2024-09-11',
      time: '09:15',
      status: 'completed'
    },
    {
      id: 4,
      type: 'credit',
      amount: 50,
      description: 'Referral Bonus',
      date: '2024-09-10',
      time: '16:20',
      status: 'completed'
    },
    {
      id: 5,
      type: 'debit',
      amount: 4500,
      description: 'Intercity Ride to Lahore',
      date: '2024-09-10',
      time: '06:00',
      status: 'completed'
    }
  ];

  const paymentMethods = [
    {
      id: 1,
      type: 'card',
      name: 'Visa •••• 1234',
      icon: '💳',
      isDefault: true
    },
    {
      id: 2,
      type: 'card',
      name: 'Mastercard •••• 5678',
      icon: '💳',
      isDefault: false
    },
    {
      id: 3,
      type: 'bank',
      name: 'JazzCash',
      icon: '📱',
      isDefault: false
    },
    {
      id: 4,
      type: 'bank',
      name: 'EasyPaisa',
      icon: '📱',
      isDefault: false
    }
  ];

  const quickAmounts = [500, 1000, 2000, 5000];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const handleAddMoney = () => {
    if (amount && parseFloat(amount) > 0) {
      // Here you would integrate with payment gateway
      alert(`Adding ₨${amount} to wallet`);
      setAmount('');
      setShowAddMoney(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <NavBar user={user} />
      
      <div className="p-4">
        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium opacity-90">Wallet Balance</h2>
              <p className="text-3xl font-bold">₨{user?.balance?.toLocaleString() || '1,250'}</p>
            </div>
            <Wallet className="w-12 h-12 opacity-80" />
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddMoney(true)}
              className="flex-1 bg-white bg-opacity-20 backdrop-blur-sm py-3 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-opacity-30 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Money</span>
            </button>
            <button className="flex-1 bg-white bg-opacity-20 backdrop-blur-sm py-3 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-opacity-30 transition-all">
              <Minus className="w-5 h-5" />
              <span className="font-medium">Send Money</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-lg shadow-sm border mb-6">
          {[
            { id: 'balance', name: 'Transactions', icon: History },
            { id: 'methods', name: 'Payment Methods', icon: CreditCard },
            { id: 'offers', name: 'Offers', icon: Gift }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 ${
                activeTab === tab.id 
                  ? 'bg-green-50 text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
              } transition-all`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Transactions Tab */}
        {activeTab === 'balance' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
              <button className="text-green-600 text-sm font-medium hover:text-green-700">
                View All
              </button>
            </div>

            {transactions.map(transaction => (
              <div key={transaction.id} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'credit' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{transaction.description}</h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(transaction.date)} • {transaction.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}₨{transaction.amount}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{transaction.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'methods' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Payment Methods</h3>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add New</span>
              </button>
            </div>

            {paymentMethods.map(method => (
              <div key={method.id} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-800">{method.name}</h4>
                      {method.isDefault && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!method.isDefault && (
                      <button className="text-green-600 text-sm font-medium hover:text-green-700">
                        Set Default
                      </button>
                    )}
                    <Settings className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === 'offers' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Special Offers</h3>
            
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold mb-1">First Ride Bonus</h4>
                  <p className="text-sm text-blue-100">Get ₨100 cashback on your first intercity ride</p>
                  <p className="text-xs text-blue-200 mt-2">Code: FIRST100</p>
                </div>
                <Gift className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold mb-1">Weekend Special</h4>
                  <p className="text-sm text-orange-100">20% off on all rides this weekend</p>
                  <p className="text-xs text-orange-200 mt-2">Code: WEEKEND20</p>
                </div>
                <Gift className="w-8 h-8 text-orange-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold mb-1">Referral Bonus</h4>
                  <p className="text-sm text-green-100">Refer friends and earn ₨50 for each signup</p>
                  <p className="text-xs text-green-200 mt-2">Share your code: PAK{user?.id || '123'}</p>
                </div>
                <Gift className="w-8 h-8 text-green-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Money Modal */}
      {showAddMoney && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowAddMoney(false)}
          ></div>
          <div className="relative bg-white rounded-lg p-6 m-4 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Money to Wallet</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="₨0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Select
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {quickAmounts.map(quickAmount => (
                    <button
                      key={quickAmount}
                      onClick={() => setAmount(quickAmount.toString())}
                      className="p-3 border border-gray-300 rounded-lg text-center hover:border-green-500 hover:text-green-600 transition-colors"
                    >
                      ₨{quickAmount}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAddMoney(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMoney}
                  className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Add Money
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;