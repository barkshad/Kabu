import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { mockSupabase } from '../services/mockSupabase';
import { VoteResult, Position } from '../types';

const Admin: React.FC = () => {
  const [results, setResults] = useState<VoteResult[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
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

    checkAdmin();
    // Poll for updates every 5 seconds
    const interval = setInterval(checkAdmin, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  if (loading) return <div className="p-10 text-center">Loading Admin Panel...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
           <h2 className="text-3xl font-bold text-gray-900">Election Results</h2>
           <p className="text-gray-500">Live counting updates</p>
        </div>
        <div className="bg-kabarak-green text-white px-4 py-2 rounded-lg text-sm font-mono">
          <i className="fas fa-circle text-red-500 text-xs mr-2 animate-pulse"></i>
          Live Connection
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {positions.map(pos => {
          const posResults = results.filter(r => r.positionTitle === pos.title);
          return (
            <div key={pos.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">{pos.title}</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={posResults}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="candidateName" type="category" width={100} tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="votes" fill="#006400" radius={[0, 4, 4, 0]} barSize={30}>
                        {posResults.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#006400' : '#FFD700'} />
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