import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingItem, PurchaseStatus, ShoppingItemFormData } from './types';
import { getItems, saveItem, deleteItem, generateId } from './services/storageService';
import { suggestSpendingAdvice } from './services/geminiService';
import ItemList from './components/ItemList';
import ItemForm from './components/ItemForm';
import Stats from './components/Stats';
import SmartAdd from './components/SmartAdd';
import { Plus, BarChart2, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const App: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [activeTab, setActiveTab] = useState<PurchaseStatus>(PurchaseStatus.BOUGHT);
  const [showStats, setShowStats] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [smartParsedData, setSmartParsedData] = useState<Partial<ShoppingItemFormData> | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    setItems(getItems());
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleSave = (data: ShoppingItemFormData) => {
    const newItem: ShoppingItem = {
      ...data,
      id: editingItem ? editingItem.id : generateId(),
      createdAt: editingItem ? editingItem.createdAt : Date.now(),
    };
    const updatedItems = saveItem(newItem);
    setItems(updatedItems);
    setIsModalOpen(false);
    setEditingItem(null);
    setSmartParsedData(null);
    showToast(editingItem ? '已更新' : '已添加');
  };

  const handleDelete = (id: string) => {
    // Using native iOS style confirm is better for mobile, but custom UI is requested.
    // We stick to native window.confirm for simplicity or could build a sheet.
    if (window.confirm('删除此项目？')) {
      const updatedItems = deleteItem(id);
      setItems(updatedItems);
      showToast('已删除', 'info');
    }
  };

  const handleEdit = (item: ShoppingItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingItem(null);
    setSmartParsedData(null);
    setIsModalOpen(true);
  };

  const handleSmartParsed = (data: Partial<ShoppingItemFormData>) => {
    setSmartParsedData(data);
    setIsModalOpen(true);
    showToast('AI 已识别', 'success');
  };

  const getAdvice = useCallback(async () => {
    if (items.length === 0) return;
    setLoadingAdvice(true);
    try {
      const simpleItems = items.map(i => ({ n: i.name, p: i.actualPrice, c: i.category, s: i.status }));
      const advice = await suggestSpendingAdvice(JSON.stringify(simpleItems));
      setAiAdvice(advice);
      showToast('建议已更新', 'success');
    } catch (e) {
      showToast('获取失败', 'error');
    } finally {
      setLoadingAdvice(false);
    }
  }, [items]);

  return (
    <div className="min-h-screen pb-24 bg-[#F2F2F7]">
      {/* Toast (Dynamic Island Style) */}
      <div className="toast-container space-y-2 pointer-events-none flex flex-col items-center">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg bg-black text-white animate-scaleIn backdrop-blur-md"
          >
            {toast.type === 'success' && <CheckCircle size={16} className="text-green-400" />}
            {toast.type === 'error' && <AlertCircle size={16} className="text-red-400" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Header (iOS Navigation Bar Style) */}
      <header className="ios-glass border-b border-black/5 sticky top-0 z-30 transition-all duration-300">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-[17px] font-semibold text-black">
            智购追踪
          </h1>
          <button 
            onClick={openNewModal}
            className="text-[17px] text-[#007AFF] font-normal active:opacity-50 transition-opacity"
          >
            <Plus size={24} />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* Large Title Area */}
        <div className="mb-2">
            <h2 className="text-[34px] font-bold text-black tracking-tight leading-tight">概览</h2>
        </div>

        {/* Smart Add Section */}
        <SmartAdd onParsed={handleSmartParsed} />

        {/* Action Toggles (iOS Pill Buttons) */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button 
                onClick={() => setShowStats(!showStats)}
                className={`
                flex items-center gap-2 text-[15px] font-medium px-4 py-2 rounded-full transition-all active:scale-95
                ${showStats 
                    ? 'bg-black text-white shadow-md' 
                    : 'bg-white text-black shadow-sm'}
                `}
            >
                <BarChart2 size={16} />
                {showStats ? '隐藏报表' : '显示报表'}
            </button>
            <button
                onClick={getAdvice}
                disabled={loadingAdvice || items.length === 0}
                className={`
                    flex items-center gap-2 text-[15px] font-medium px-4 py-2 rounded-full transition-all active:scale-95
                    bg-white text-black shadow-sm disabled:opacity-50
                `}
            >
                <Lightbulb size={16} className={loadingAdvice ? 'animate-pulse text-[#FF9500]' : 'text-[#FF9500]'} />
                {loadingAdvice ? '思考中...' : 'AI 建议'}
            </button>
        </div>

        {/* AI Advice Box (iOS Widget Style) */}
        {aiAdvice && (
            <div className="bg-white p-5 rounded-[20px] shadow-sm flex items-start gap-3 animate-scaleIn relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FF9500]"></div>
                <div className="flex-1">
                    <h4 className="font-semibold text-black text-[15px] mb-2">AI 建议</h4>
                    <p className="text-[15px] text-[#3C3C43]/80 leading-relaxed">{aiAdvice}</p>
                </div>
                <button onClick={() => setAiAdvice('')} className="bg-[#F2F2F7] p-1.5 rounded-full text-[#8E8E93]">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        )}

        {/* Stats Dashboard */}
        {showStats && (
          <div className="animate-fadeIn">
            <Stats items={items} />
          </div>
        )}

        {/* Segmented Control (Tabs) */}
        <div className="bg-[#767680]/15 p-1 rounded-[9px] flex font-medium text-[13px] relative z-0">
          <div 
             className="absolute top-1 bottom-1 bg-white rounded-[7px] shadow-sm transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] z-[-1]"
             style={{ 
                 left: activeTab === PurchaseStatus.BOUGHT ? '4px' : '50%', 
                 width: 'calc(50% - 4px)' 
             }}
          ></div>
          <button
            onClick={() => setActiveTab(PurchaseStatus.BOUGHT)}
            className={`flex-1 py-1.5 text-center transition-colors rounded-[7px] ${activeTab === PurchaseStatus.BOUGHT ? 'text-black font-semibold' : 'text-black/60'}`}
          >
            已购买 ({items.filter(i => i.status === PurchaseStatus.BOUGHT).length})
          </button>
          <button
            onClick={() => setActiveTab(PurchaseStatus.PLANNED)}
            className={`flex-1 py-1.5 text-center transition-colors rounded-[7px] ${activeTab === PurchaseStatus.PLANNED ? 'text-black font-semibold' : 'text-black/60'}`}
          >
            待购买 ({items.filter(i => i.status === PurchaseStatus.PLANNED).length})
          </button>
        </div>

        {/* List */}
        <div className="min-h-[300px]">
          <ItemList 
              items={items} 
              filterStatus={activeTab} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
          />
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <ItemForm
          initialData={editingItem || smartParsedData || {}}
          onSubmit={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;