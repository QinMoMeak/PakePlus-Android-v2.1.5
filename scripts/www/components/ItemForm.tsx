import React, { useState, useEffect } from 'react';
import { ShoppingItemFormData, PurchaseStatus, UnitCostType } from '../types';
import { CATEGORIES, STATUS_LABELS, USAGE_STATUS_LABELS, UNIT_COST_TYPE_LABELS, DEFAULT_FORM_DATA } from '../constants';
import { ChevronRight } from 'lucide-react';

interface ItemFormProps {
  initialData?: Partial<ShoppingItemFormData>;
  onSubmit: (data: ShoppingItemFormData) => void;
  onCancel: () => void;
}

const ItemForm: React.FC<ItemFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<ShoppingItemFormData>({ ...DEFAULT_FORM_DATA, ...initialData });
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (formData.listPrice > 0 && formData.actualPrice > 0) {
      const discount = ((formData.listPrice - formData.actualPrice) / formData.listPrice) * 100;
      setFormData(prev => ({ ...prev, discountRate: parseFloat(discount.toFixed(1)) }));
    }
  }, [formData.listPrice, formData.actualPrice]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Price') || name === 'discountRate' || name === 'unitCost' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onCancel, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`} 
        onClick={handleClose}
      ></div>
      
      {/* Modal Sheet */}
      <div 
        className={`
            bg-[#F2F2F7] w-full sm:max-w-md h-[92vh] sm:h-auto sm:max-h-[85vh] 
            rounded-t-[20px] sm:rounded-[20px] shadow-2xl overflow-hidden flex flex-col
            transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${isClosing ? 'translate-y-full sm:scale-95 sm:opacity-0' : 'translate-y-0 animate-slideUpModal sm:animate-scaleIn'}
        `}
      >
        {/* Header (iOS Navigation Bar) */}
        <div className="bg-[#F2F2F7]/80 backdrop-blur-xl border-b border-[#3C3C43]/10 h-14 flex items-center justify-between px-4 shrink-0 z-10">
          <button onClick={handleClose} type="button" className="text-[17px] text-[#007AFF] font-normal active:opacity-50">
            取消
          </button>
          <span className="text-[17px] font-semibold text-black">
            {initialData && Object.keys(initialData).length > 0 ? '编辑' : '新项目'}
          </span>
          <button onClick={handleSubmit} type="button" className="text-[17px] text-[#007AFF] font-semibold active:opacity-50">
            完成
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-4 pb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Name & Category */}
            <div className="bg-white rounded-[12px] overflow-hidden">
                <div className="flex items-center px-4 py-3 border-b border-[#E5E5EA]">
                    <label className="w-20 text-[16px] text-black">名称</label>
                    <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="flex-1 text-[16px] outline-none text-right bg-transparent placeholder:text-[#C7C7CC]"
                        placeholder="商品名称"
                    />
                </div>
                <div className="flex items-center px-4 py-3 relative">
                    <label className="w-20 text-[16px] text-black">类别</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="flex-1 text-[16px] outline-none text-right bg-transparent appearance-none pr-5 text-[#8E8E93]"
                    >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronRight size={16} className="absolute right-3 text-[#C7C7CC] pointer-events-none" />
                </div>
            </div>

            {/* Section 2: Status */}
            <div className="bg-white rounded-[12px] p-1">
                 <div className="flex bg-[#767680]/15 p-0.5 rounded-[9px]">
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <button
                        key={key}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, status: key as PurchaseStatus }))}
                        className={`flex-1 py-1.5 text-[13px] font-medium rounded-[7px] transition-all ${
                            formData.status === key ? 'bg-white shadow-sm text-black' : 'text-black/60'
                        }`}
                        >
                        {label}
                        </button>
                    ))}
                 </div>
            </div>

            {/* Section 3: Pricing */}
            <div>
                <h4 className="text-[13px] text-[#8E8E93] uppercase ml-4 mb-2">价格</h4>
                <div className="bg-white rounded-[12px] overflow-hidden">
                    <div className="flex items-center px-4 py-3 border-b border-[#E5E5EA]">
                        <label className="flex-1 text-[16px] text-black">实际价格</label>
                        <input
                            type="number"
                            name="actualPrice"
                            required
                            min="0"
                            step="0.01"
                            value={formData.actualPrice}
                            onChange={handleChange}
                            className="w-24 text-[16px] text-[#007AFF] font-semibold outline-none text-right bg-transparent"
                            placeholder="0"
                        />
                        <span className="ml-1 text-black">¥</span>
                    </div>
                    <div className="flex items-center px-4 py-3 border-b border-[#E5E5EA]">
                        <label className="flex-1 text-[16px] text-black">原价/标价</label>
                        <input
                            type="number"
                            name="listPrice"
                            min="0"
                            step="0.01"
                            value={formData.listPrice}
                            onChange={handleChange}
                            className="w-24 text-[16px] outline-none text-right bg-transparent"
                            placeholder="0"
                        />
                         <span className="ml-1 text-black">¥</span>
                    </div>
                </div>
            </div>

            {/* Section 4: Details (Conditional) */}
            {formData.status === PurchaseStatus.BOUGHT && (
                <div className="animate-fadeIn">
                     <h4 className="text-[13px] text-[#8E8E93] uppercase ml-4 mb-2">购买详情</h4>
                     <div className="bg-white rounded-[12px] overflow-hidden">
                        <div className="flex items-center px-4 py-3 border-b border-[#E5E5EA]">
                            <label className="w-24 text-[16px] text-black">日期</label>
                            <input
                                type="date"
                                name="purchaseDate"
                                value={formData.purchaseDate}
                                onChange={handleChange}
                                className="flex-1 text-[16px] outline-none text-right bg-transparent text-[#8E8E93]"
                            />
                        </div>
                        <div className="flex items-center px-4 py-3 border-b border-[#E5E5EA] relative">
                            <label className="w-24 text-[16px] text-black">使用状态</label>
                            <select
                                name="usageStatus"
                                value={formData.usageStatus}
                                onChange={handleChange}
                                className="flex-1 text-[16px] outline-none text-right bg-transparent appearance-none pr-5 text-[#8E8E93]"
                            >
                                {Object.entries(USAGE_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                            <ChevronRight size={16} className="absolute right-3 text-[#C7C7CC] pointer-events-none" />
                        </div>
                        <div className="flex items-center px-4 py-3 border-b border-[#E5E5EA]">
                            <label className="w-24 text-[16px] text-black">单位类型</label>
                            <select
                                name="unitCostType"
                                value={formData.unitCostType}
                                onChange={handleChange}
                                className="flex-1 text-[16px] outline-none text-right bg-transparent appearance-none text-[#8E8E93] pr-2"
                            >
                                {Object.entries(UNIT_COST_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                         <div className="flex items-center px-4 py-3">
                            <label className="flex-1 text-[16px] text-black">单位成本</label>
                            <input
                                type="number"
                                name="unitCost"
                                min="0"
                                step="0.01"
                                value={formData.unitCost}
                                onChange={handleChange}
                                className="w-24 text-[16px] outline-none text-right bg-transparent text-[#8E8E93]"
                                placeholder="0"
                            />
                        </div>
                     </div>
                </div>
            )}

            {/* Section 5: Extra */}
            <div className="bg-white rounded-[12px] overflow-hidden">
                <div className="flex items-center px-4 py-3 border-b border-[#E5E5EA]">
                    <label className="w-20 text-[16px] text-black">链接</label>
                    <input
                        type="url"
                        name="link"
                        value={formData.link}
                        onChange={handleChange}
                        placeholder="https://"
                        className="flex-1 text-[16px] outline-none text-right bg-transparent placeholder:text-[#C7C7CC]"
                    />
                </div>
                 <div className="p-3">
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        placeholder="备注..."
                        className="w-full text-[16px] outline-none bg-transparent resize-none placeholder:text-[#C7C7CC]"
                    />
                </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ItemForm;