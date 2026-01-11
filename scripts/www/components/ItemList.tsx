import React from 'react';
import { ShoppingItem, PurchaseStatus, UsageStatus } from '../types';
import { STATUS_LABELS, USAGE_STATUS_LABELS } from '../constants';
import { Edit2, ExternalLink, Calendar, Tag, ChevronRight } from 'lucide-react';

interface ItemListProps {
  items: ShoppingItem[];
  filterStatus: PurchaseStatus;
  onEdit: (item: ShoppingItem) => void;
  onDelete: (id: string) => void;
}

const ItemList: React.FC<ItemListProps> = ({ items, filterStatus, onEdit, onDelete }) => {
  const filteredItems = items.filter(item => item.status === filterStatus);

  if (filteredItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
        <div className="w-16 h-16 bg-[#E5E5EA] rounded-full flex items-center justify-center mb-4 text-[#8E8E93]">
            <Tag size={24} />
        </div>
        <p className="text-[#8E8E93] text-[15px]">暂无内容</p>
      </div>
    );
  }

  const displayItems = [...filteredItems].reverse();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {displayItems.map((item, index) => (
        <div 
          key={item.id} 
          onClick={() => onEdit(item)}
          className="bg-white rounded-[18px] p-4 shadow-sm active:scale-[0.98] transition-transform duration-200 cursor-pointer relative animate-fadeIn"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="bg-[#F2F2F7] px-2 py-0.5 rounded-md">
                <span className="text-[11px] font-semibold text-[#8E8E93]">{item.category}</span>
            </div>
            {item.discountRate > 0 && (
                <span className="text-[11px] font-bold text-[#FF2D55]">-{Math.round(item.discountRate)}%</span>
            )}
          </div>

          <div className="flex justify-between items-center mb-1">
             <h3 className="text-[17px] font-semibold text-black truncate pr-4">{item.name}</h3>
          </div>

          <div className="flex items-baseline gap-2 mb-3">
             <span className="text-[20px] font-bold text-black">¥{item.actualPrice}</span>
             {item.listPrice > item.actualPrice && (
                 <span className="text-[13px] text-[#8E8E93] line-through">¥{item.listPrice}</span>
             )}
          </div>

          <div className="flex items-center justify-between text-[13px] text-[#8E8E93]">
             <div className="flex items-center gap-2">
                 {item.status === PurchaseStatus.BOUGHT ? (
                     <span>{item.purchaseDate}</span>
                 ) : (
                    <span>计划中</span>
                 )}
             </div>
             {item.link && (
                 <div onClick={(e) => { e.stopPropagation(); window.open(item.link, '_blank'); }} className="p-1.5 bg-[#F2F2F7] rounded-full text-[#007AFF]">
                     <ExternalLink size={14} />
                 </div>
             )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ItemList;