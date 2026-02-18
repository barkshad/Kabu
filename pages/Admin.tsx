import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { mockSupabase } from '../services/mockSupabase';
import { VoteResult, Position } from '../types';
import { LayoutDashboard, Users, RefreshCw, Lock } from 'lucide-react';

const Admin: React.FC = () => {
  const [results, setResults] = useState<VoteResult[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    const user = mockSupabase.getCurrentUser();
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    
    const [resData, posData] = await Promise.all([
      mockSupabase.getResults(),
      mockSupabase.getPositions()
    ]);
    
    setResults(resData);
    setPositions(posData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [navigate]);

  if (loading) return (
    <div className="flex justify-center items-center h-[50vh]">
      <div className="text-center">
        <Lock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Verifying Admin Privileges...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center mb-4 md:mb-0">
           <div className="p-3 bg-kabarak-green/10 rounded-xl mr-4">
             <LayoutDashboard className="w-8 h-8 text-kabarak-green" />
           </div>
           <div>
             <h2 className="text-2xl font-bold text-gray-900">Election Control Center</h2>
             <p className="text-gray-500 text-sm">Real-time vote tabulation</p>
           </div>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={fetchData} className="p-2 text-gray-500 hover:text-kabarak-green hover:bg-green-50 rounded-full transition-colors" title="Refresh Data">
            <RefreshCw className="w-5 h-5" />
          </button>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-semibold flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            System Active
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {positions.map(pos => {
          const posResults = results.filter(r => r.positionTitle === pos.title);
          const totalVotes = posResults.reduce((sum, curr) => sum + curr.votes, 0);
          
          return (
            <div key={pos.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[400px]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{pos.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Users className="w-3 h-3 mr-1" />
                    {totalVotes} Votes Cast
                  </p>
                </div>
              </div>

              <div className="flex-grow w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={posResults}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                    <XAxis type="number" allowDecimals={false} hide />
                    <YAxis 
                      dataKey="candidateName" 
                      type="category" 
                      width={120} 
                      tick={{fontSize: 12, fill: '#4b5563', fontWeight: 500}} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{fill: '#f9fafb'}} 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="votes" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1000}>
                        {posResults.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={index === 0 ? '#006400' : '#FFD700'} />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Admin;
