import type { FC } from 'react';

const Header: FC = () => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 px-6 sm:px-10 py-4 bg-white shadow-sm">
      <div className="flex items-center gap-3 text-primary">
        <div className="w-6 h-6">
          <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_6_535)">
              <path 
                clipRule="evenodd" 
                d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" 
                fill="currentColor" 
                fillRule="evenodd"
              />
            </g>
            <defs>
              <clipPath id="clip0_6_535">
                <rect fill="white" height="48" width="48" />
              </clipPath>
            </defs>
          </svg>
        </div>
        <h2 className="text-xl font-bold leading-tight tracking-tight text-primary">
          PDF 压缩工具
        </h2>
      </div>
      <div className="flex items-center gap-6">
        <nav className="hidden sm:flex items-center gap-6">
          <a 
            className="text-sm font-medium leading-normal text-text-secondary hover:text-primary transition-colors" 
            href="#features"
          >
            功能特色
          </a>
          <a 
            className="text-sm font-medium leading-normal text-text-secondary hover:text-primary transition-colors" 
            href="#how-it-works"
          >
            工作原理
          </a>
          <a 
            className="text-sm font-medium leading-normal text-text-secondary hover:text-primary transition-colors" 
            href="https://github.com/your-repo"
            target="_blank"
            rel="noopener noreferrer"
          >
            开源代码
          </a>
        </nav>
        <button className="btn-primary">
          <span className="truncate">开始使用</span>
        </button>
      </div>
    </header>
  );
};

export default Header; 