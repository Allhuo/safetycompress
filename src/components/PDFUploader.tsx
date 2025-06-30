import { useState, useCallback } from 'react';
import type { FC } from 'react';

interface PDFUploaderProps {
  onFileSelect: (file: File) => void;
}

const PDFUploader: FC<PDFUploaderProps> = ({ onFileSelect }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      onFileSelect(pdfFile);
    } else {
      alert('请选择PDF文件');
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    } else {
      alert('请选择PDF文件');
    }
  }, [onFileSelect]);

  return (
    <div id="pdf-uploader" className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-text-primary mb-4">
          选择PDF文件开始压缩
        </h2>
        <p className="text-base font-normal leading-relaxed text-text-secondary">
          支持拖拽上传或点击选择文件。您的文件将在浏览器中直接处理，绝不上传到服务器。
        </p>
      </div>

      <div
        className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileInput}
          className="hidden"
          id="pdf-file-input"
        />
        
        <label
          htmlFor="pdf-file-input"
          className="cursor-pointer flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 text-primary">
            <svg fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
              <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z" />
            </svg>
          </div>
          
          <div className="text-center">
            <p className="text-lg font-semibold text-text-primary mb-2">
              拖拽PDF文件到此处，或点击选择
            </p>
            <p className="text-sm text-text-secondary">
              支持最大 100MB 的PDF文件
            </p>
          </div>
        </label>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            100% 本地处理
          </span>
          <span className="mx-2">•</span>
          <span className="inline-flex items-center gap-1">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            绝不上传
          </span>
          <span className="mx-2">•</span>
          <span className="inline-flex items-center gap-1">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            开源透明
          </span>
        </p>
      </div>
    </div>
  );
};

export default PDFUploader; 