import type { FC } from 'react';

const Footer: FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-100 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-10">
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <a 
              className="text-text-secondary text-sm font-normal leading-normal hover:text-primary transition-colors" 
              href="#privacy"
            >
              隐私政策
            </a>
            <a 
              className="text-text-secondary text-sm font-normal leading-normal hover:text-primary transition-colors" 
              href="#terms"
            >
              使用条款
            </a>
            <a 
              className="text-text-secondary text-sm font-normal leading-normal hover:text-primary transition-colors" 
              href="https://github.com/your-repo"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a 
              className="text-text-secondary text-sm font-normal leading-normal hover:text-primary transition-colors" 
              href="#contact"
            >
              联系我们
            </a>
          </div>
          <p className="text-text-secondary text-sm font-normal leading-normal text-center sm:text-right">
            © 2024 PDF 压缩工具. 保留所有权利。
          </p>
        </div>
        
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="text-center">
            <div className="mb-4">
              <p className="text-xs text-text-secondary leading-relaxed max-w-2xl mx-auto">
                "不相信我们？没关系。您可以亲自检查我们的每一行代码。项目已在GitHub开源。"
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-xs text-text-secondary">
              <span className="inline-flex items-center gap-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                完全开源
              </span>
              <span className="inline-flex items-center gap-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                隐私优先
              </span>
              <span className="inline-flex items-center gap-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                用户至上
              </span>
              <span className="inline-flex items-center gap-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                高性能
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 