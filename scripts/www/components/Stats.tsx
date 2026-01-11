import React, { useMemo } from 'react';
import { ShoppingItem, PurchaseStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface StatsProps {
  items: ShoppingItem[];
}

const COLORS = ['#007AFF', '#FF2D55', '#5856D6', '#FF9500', '#5AC8FA', '#4CD964', '#FFCC00', '#8E8E93'];

const Stats: React.FC<StatsProps> = ({ items }) => {
  const boughtItems = useMemo(() => items.filter(i => i.status === PurchaseStatus.BOUGHT), [items]);
  
  const totalSpent = useMemo(() => boughtItems.reduce((acc, curr) => acc + (curr.actualPrice || 0), 0), [boughtItems]);
  const totalSaved = useMemo(() => boughtItems.reduce((acc, curr) => {
    if (curr.listPrice && curr.actualPrice) {
      return acc + Math.max(0, curr.listPrice - curr.actualPrice);
    }
    return acc;
  }, 0), [boughtItems]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    boughtItems.forEach(item => {
      const current = map.get(item.category) || 0;
      map.set(item.category, current + item.actualPrice);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [boughtItems]);

  const monthlyData = useMemo(() => {
     const map = new Map<string, number>();
     boughtItems.forEach(item => {
         const date = new Date(item.purchaseDate);
         const key = `${date.getMonth() + 1}月`;
         map.set(key, (map.get(key) || 0) + item.actualPrice);
     });
     return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [boughtItems]);

  if (boughtItems.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      {/* Summary Widget */}
      <div className="bg-white rounded-[22px] p-5 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden">
        <div className="z-10">
            <p className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wide">总支出</p>
            <h2 className="text-[34px] font-bold text-black mt-0.5">¥{totalSpent.toLocaleString('zh-CN')}</h2>
        </div>
        <div className="z-10">
            <span className="inline-flex items-center gap-1 bg-[#F2F2F7] px-2.5 py-1 rounded-full text-[12px] font-medium text-[#007AFF]">
                {boughtItems.length} 笔订单
            </span>
        </div>
      </div>

      <div className="bg-white rounded-[22px] p-5 shadow-sm flex flex-col justify-between h-40">
        <div>
            <p className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wide">累计节省</p>
            <h2 className="text-[34px] font-bold text-[#34C759] mt-0.5">¥{totalSaved.toLocaleString('zh-CN')}</h2>
        </div>
        <p className="text-[13px] text-[#8E8E93]">积少成多</p>
      </div>

      {/* Chart Widget */}
      <div className="md:col-span-2 bg-white rounded-[22px] p-5 shadow-sm">
        <h3 className="text-[17px] font-bold text-black mb-4">支出分布</h3>
        <div className="h-48 w-full flex">
             <div className="flex-1 h-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `¥${value}`} contentStyle={{borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                    </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="w-1/3 flex flex-col justify-center gap-2">
                {categoryData.slice(0, 4).map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length]}}></div>
                        <span className="text-[11px] text-[#3C3C43]/60 truncate">{entry.name}</span>
                    </div>
                ))}
             </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;