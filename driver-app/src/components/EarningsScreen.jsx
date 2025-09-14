import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Clock,
  Star,
  Target,
  Award,
  Download,
  Filter,
  ArrowUp,
  ArrowDown,
  CreditCard
} from 'lucide-react';

const EarningsScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [showWithdraw, setShowWithdraw] = useState(false);

  const periods = [
    { id: 'today', name: 'Today' },
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
    { id: 'year', name: 'This Year' }
  ];

  const earningsData = {
    today: {
      total: 2850,
      rides: 12,
      hours: 6.5,
      bonus: 450,
      tips: 200,
      average: 237.5
    },
    week: {
      total: 18750,
      rides: 89,
      hours: 42,
      bonus: 2100,
      tips: 1250,
      average: 210.7
    },
    month: {
      total: 75400,
      rides: 342,
      hours: 168,
      bonus: 8900,
      tips: 4200,
      average: 220.5
    },
    year: {
      total: 456800,
      rides: 2156,
      hours: 1024,
      bonus: 58900,
      tips: 28400,
      average: 212.0
    }
  };

  const recentEarnings = [
    {
      id: 1,
      type: 'ride',
      description: 'Blue Area → F-7 Markaz',
      amount: 180,
      time: '2:30 PM',
      tip: 20,
      rating: 5
    },
    {
      id: 2,
      type: 'bonus',
      description: 'Peak Hour Bonus',
      amount: 50,
      time: '2:00 PM',
      tip: 0,
      rating: null
    },
    {
      id: 3,
      type: 'ride',
      description: 'G-9 → Centaurus Mall',
      amount: 220,
      time: '1:45 PM',
      tip: 30,
      rating: 5
    },
    {
      id: 4,
      type: 'ride',
      description: 'PWD → PIMS Hospital',
      amount: 150,
      time: '1:15 PM',
      tip: 0,
      rating: 4
    },
    {
      id: 5,
      type: 'bonus',
      description: 'Consecutive Rides Bonus',
      amount: 100,
      time: '12:30 PM',
      tip: 0,
      rating: null
    }
  ];

  const weeklyGoals = {
    rides: { current: 89, target: 100 },
    earnings: { current: 18750, target: 25000 },
    rating: { current: 4.8, target: 4.7 },
    hours: { current: 42, target: 50 }
  };

  const currentData = earningsData[selectedPeriod];

  const handleWithdraw = () => {
    setShowWithdraw(true);
  };

  const EarningsSummary = () => (
    <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">₨{currentData.total.toLocaleString()}</h2>
          <p className="text-green-100">Total earnings {selectedPeriod}</p>
        </div>
        <DollarSign className="w-12 h-12 text-green-200" />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-semibold">{currentData.rides}</div>
          <div className="text-sm text-green-100">Rides</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold">{currentData.hours}h</div>
          <div className="text-sm text-green-100">Online</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold">₨{Math.round(currentData.average)}</div>
          <div className="text-sm text-green-100">Per ride</div>
        </div>
      </div>
    </div>
  );

  const EarningsBreakdown = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Earnings Breakdown</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Base Fare</span>
          </div>
          <span className="font-medium">₨{(currentData.total - currentData.bonus - currentData.tips).toLocaleString()}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">Bonuses</span>
          </div>
          <span className="font-medium">₨{currentData.bonus.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-700">Tips</span>
          </div>
          <span className="font-medium">₨{currentData.tips.toLocaleString()}</span>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-gray-800">Total Earned</span>
            <span className="text-green-600">₨{currentData.total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const WeeklyGoals = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Weekly Goals</h3>
        <Target className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Rides Completed</span>
            <span className="text-sm font-medium">{weeklyGoals.rides.current}/{weeklyGoals.rides.target}</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(weeklyGoals.rides.current / weeklyGoals.rides.target) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Earnings Target</span>
            <span className="text-sm font-medium">₨{weeklyGoals.earnings.current.toLocaleString()}/₨{weeklyGoals.earnings.target.toLocaleString()}</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(weeklyGoals.earnings.current / weeklyGoals.earnings.target) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Rating Maintenance</span>
            <span className="text-sm font-medium">{weeklyGoals.rating.current}★ (Target: {weeklyGoals.rating.target}★)</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(weeklyGoals.rating.current / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );

  const RecentEarnings = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
        <Filter className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-3">
        {recentEarnings.map(earning => (
          <div key={earning.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                earning.type === 'ride' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
              }`}>
                {earning.type === 'ride' ? <Clock className="w-4 h-4" /> : <Award className="w-4 h-4" />}
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">{earning.description}</p>
                <p className="text-xs text-gray-500">{earning.time}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-green-600">₨{earning.amount}</span>
                {earning.tip > 0 && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                    +₨{earning.tip} tip
                  </span>
                )}
              </div>
              {earning.rating && (
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-xs text-gray-500">{earning.rating}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 text-blue-600 font-medium text-sm hover:text-blue-700">
        View All Transactions
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Earnings</h1>
          <div className="flex space-x-2">
            <button 
              onClick={handleWithdraw}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center space-x-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Withdraw</span>
            </button>
            <button className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Period Selector */}
        <div className="flex bg-white rounded-lg p-1 shadow-sm border">
          {periods.map(period => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period.id
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              {period.name}
            </button>
          ))}
        </div>

        {/* Earnings Summary */}
        <EarningsSummary />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg per hour</p>
                <p className="text-xl font-bold text-gray-800">
                  ₨{Math.round(currentData.total / currentData.hours)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12% vs last {selectedPeriod}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Acceptance rate</p>
                <p className="text-xl font-bold text-gray-800">94%</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+3% vs last {selectedPeriod}</span>
            </div>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <EarningsBreakdown />

        {/* Weekly Goals */}
        {selectedPeriod === 'week' && <WeeklyGoals />}

        {/* Recent Earnings */}
        <RecentEarnings />

        {/* Earning Tips */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-xl text-white">
          <h3 className="text-lg font-semibold mb-3">💰 Maximize Your Earnings</h3>
          <div className="space-y-2 text-sm">
            <p>• Drive during peak hours: 7-10 AM, 5-8 PM</p>
            <p>• Complete consecutive rides for bonus rewards</p>
            <p>• Maintain high rating for premium ride access</p>
            <p>• Accept surge pricing requests for higher fares</p>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Insights</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">4.9★</div>
              <div className="text-sm text-blue-700">Average Rating</div>
              <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">2.1min</div>
              <div className="text-sm text-green-700">Avg Response</div>
              <div className="text-xs text-gray-500 mt-1">To ride requests</div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowWithdraw(false)}
          ></div>
          <div className="relative bg-white rounded-lg p-6 m-4 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Withdraw Earnings</h3>
            
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">₨{currentData.total.toLocaleString()}</div>
                  <div className="text-sm text-green-700">Available Balance</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Withdrawal Amount
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Account
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                  <option>HBL Account ****1234</option>
                  <option>MCB Account ****5678</option>
                  <option>JazzCash ****9012</option>
                </select>
              </div>

              <div className="text-xs text-gray-500">
                • Minimum withdrawal: ₨500<br/>
                • Processing time: 1-2 business days<br/>
                • No fees for bank transfers
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowWithdraw(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Withdrawal request submitted');
                    setShowWithdraw(false);
                  }}
                  className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsScreen;