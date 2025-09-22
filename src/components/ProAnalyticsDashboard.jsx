import React, { useState, useEffect } from 'react';
import { useAdvancedAnalytics, useAbTest, useRealtimeNotifications } from '../hooks/useProFeatures';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const ProAnalyticsDashboard = () => {
  const { metrics, loading } = useAdvancedAnalytics();
  const { notifications } = useRealtimeNotifications();
  const { variant: dashboardVariant } = useAbTest('dashboard_layout');

  const [conversionFunnelData, setConversionFunnelData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    // Fetch conversion funnel data
    const fetchFunnelData = async () => {
      const { data } = await supabase
        .from('conversion_funnel')
        .select('*')
        .order('journey_stage');
      
      setConversionFunnelData(data || []);
    };

    // Fetch revenue trends
    const fetchRevenueData = async () => {
      const { data } = await supabase
        .rpc('get_revenue_by_month', { months: 6 });
      
      setRevenueData(data || []);
    };

    fetchFunnelData();
    fetchRevenueData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F3E3C3]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Real-time notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <div key={notification.id} className="bg-green-500 text-white p-3 rounded-lg shadow-lg">
              <p className="font-semibold">{notification.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">Real-time Visitors</h3>
          <p className="text-3xl font-bold">{metrics.realTimeVisitors}</p>
          <p className="text-sm opacity-90">Currently browsing</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">Conversion Rate</h3>
          <p className="text-3xl font-bold">{metrics.conversionRate.toFixed(1)}%</p>
          <p className="text-sm opacity-90">Last 30 days</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">Lead Quality Score</h3>
          <p className="text-3xl font-bold">{metrics.leadQuality.toFixed(0)}</p>
          <p className="text-sm opacity-90">Average score</p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">Performance Score</h3>
          <p className="text-3xl font-bold">{metrics.performanceScore}%</p>
          <p className="text-sm opacity-90">Site optimization</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Conversion Funnel */}
        <div className="bg-[#1a1a1a] p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-[#F3E3C3] mb-4">Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionFunnelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="journey_stage" stroke="#F3E3C3" />
              <YAxis stroke="#F3E3C3" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#262626', 
                  border: '1px solid #F3E3C3',
                  color: '#F3E3C3'
                }} 
              />
              <Bar dataKey="sessions" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trends */}
        <div className="bg-[#1a1a1a] p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-[#F3E3C3] mb-4">Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#F3E3C3" />
              <YAxis stroke="#F3E3C3" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#262626', 
                  border: '1px solid #F3E3C3',
                  color: '#F3E3C3'
                }} 
              />
              <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Advanced Features based on A/B test variant */}
      {dashboardVariant === 'variant_a' && (
        <div className="bg-[#1a1a1a] p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-[#F3E3C3] mb-4">AI Insights (Beta)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#262626] p-4 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-2">Best Converting Time</h4>
              <p className="text-[#F3E3C3]">Tuesdays 2-4 PM</p>
            </div>
            <div className="bg-[#262626] p-4 rounded-lg">
              <h4 className="font-semibold text-blue-400 mb-2">Top Lead Source</h4>
              <p className="text-[#F3E3C3]">Instagram Stories</p>
            </div>
            <div className="bg-[#262626] p-4 rounded-lg">
              <h4 className="font-semibold text-purple-400 mb-2">Recommended Action</h4>
              <p className="text-[#F3E3C3]">Follow up on 3 leads</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProAnalyticsDashboard;
