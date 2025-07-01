import type { FC } from 'react';
import type { ProcessingState } from '../App';

interface ProcessingStatusProps {
  processing: ProcessingState;
}

const ProcessingStatus: FC<ProcessingStatusProps> = ({ processing }) => {
  return (
    <div className="max-w-md mx-auto">
      <div className="feature-card text-center">
        <div className="w-16 h-16 mx-auto mb-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
            <div 
              className="absolute top-0 left-0 w-16 h-16 border-4 border-primary rounded-full border-t-transparent animate-spin"
              style={{
                animationDuration: '1s',
              }}
            ></div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-text-primary mb-2">
          正在处理中...
        </h2>
        
        <p className="text-text-secondary mb-4">
          {processing.status}
        </p>

        <div className="progress-bar mb-2">
          <div 
            className="progress-fill"
            style={{ width: `${processing.progress}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-text-secondary">
          {processing.progress}% 完成
        </p>

        {processing.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              ❌ {processing.error}
            </p>
          </div>
        )}

        <div className="mt-6 text-xs text-text-secondary">
          <p>🔒 您的文件始终保存在本地浏览器中</p>
        </div>
      </div>
    </div>
  );
};

export default ProcessingStatus; 