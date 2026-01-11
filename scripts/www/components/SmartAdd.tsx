import React, { useState, useRef } from 'react';
import { parseShoppingText, parseShoppingImage } from '../services/geminiService';
import { ShoppingItemFormData } from '../types';
import { Sparkles, Loader2, Image as ImageIcon, X, ArrowUpCircle } from 'lucide-react';

interface SmartAddProps {
  onParsed: (data: Partial<ShoppingItemFormData>) => void;
}

const SmartAdd: React.FC<SmartAddProps> = ({ onParsed }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError('图片过大');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      const mimeType = result.split(';')[0].split(':')[1];
      setSelectedImage({ data: base64Data, mimeType, preview: result });
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSmartParse = async () => {
    if (!text.trim() && !selectedImage) return;
    setLoading(true);
    setError('');
    
    try {
      let result;
      if (selectedImage) {
        result = await parseShoppingImage(selectedImage.data, selectedImage.mimeType, text);
      } else {
        result = await parseShoppingText(text);
      }

      if (result) {
        onParsed(result);
        setText('');
        setSelectedImage(null);
      } else {
        setError('未能识别内容');
      }
    } catch (e) {
      setError('服务暂时不可用');
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-[20px] p-5 shadow-sm animate-fadeIn relative overflow-hidden">
      {/* Background Gradient Mesh Effect (Subtle) */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -z-10 opacity-50"></div>
      
      <div className="flex items-center gap-2 mb-3">
         <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600">
             <Sparkles size={16} />
         </div>
         <span className="text-[15px] font-semibold text-black">智能录入</span>
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="描述或粘贴图片 (例如: MacBook Pro, 12999元)..."
          className={`w-full bg-[#F2F2F7] rounded-[14px] p-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all resize-none placeholder:text-gray-400 ${selectedImage ? 'h-24 pb-10' : 'h-20'}`}
          disabled={loading}
        />

        {/* Image Preview Overlay */}
        {selectedImage && (
          <div className="absolute bottom-3 left-3 z-10">
            <div className="relative inline-block">
              <img 
                src={selectedImage.preview} 
                alt="preview" 
                className="h-10 w-10 object-cover rounded-[8px] border border-black/5"
              />
              <button 
                onClick={clearImage}
                className="absolute -top-1.5 -right-1.5 bg-gray-500 text-white rounded-full p-0.5"
              >
                <X size={10} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-3">
         <div className="flex items-center">
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="text-[#007AFF] text-[13px] font-medium flex items-center gap-1 active:opacity-50"
            >
                <ImageIcon size={16} />
                添加图片
            </button>
         </div>

         <button
            onClick={handleSmartParse}
            disabled={loading || (!text.trim() && !selectedImage)}
            className={`
                rounded-full p-2 transition-all
                ${(text.trim() || selectedImage) && !loading ? 'bg-[#007AFF] text-white shadow-md' : 'bg-gray-100 text-gray-400'}
            `}
         >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowUpCircle size={20} />}
         </button>
      </div>

      {error && <p className="text-[#FF3B30] text-[13px] mt-2 font-medium">{error}</p>}
    </div>
  );
};

export default SmartAdd;