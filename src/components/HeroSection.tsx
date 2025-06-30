import type { FC } from 'react';

const HeroSection: FC = () => {
  const scrollToUploader = () => {
    const uploaderElement = document.querySelector('#pdf-uploader');
    if (uploaderElement) {
      uploaderElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section container mx-auto mb-12 sm:mb-16 px-4 sm:px-10">
      <div className="p-4">
        <div className="flex min-h-[400px] sm:min-h-[480px] flex-col gap-6 rounded-xl bg-gradient-to-br from-primary to-blue-700 gap-8 items-center justify-center p-6 sm:p-10 text-center shadow-xl relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute inset-0 bg-black/20"></div>
          
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                安全压缩，本地完成
              </h1>
              <h2 className="text-slate-100 text-sm sm:text-base font-normal leading-relaxed max-w-2xl mx-auto">
                永不上传文件的安全压缩工具。所有处理都在您的浏览器中直接完成，100%保障隐私。减小PDF文件大小，提升分享和存储效率。
              </h2>
            </div>
            <button 
              onClick={scrollToUploader}
              className="btn-primary h-12 px-6 text-base bg-accent hover:bg-amber-500 mx-auto"
            >
              <span className="truncate">立即压缩</span>
            </button>
          </div>

          {/* 装饰元素 */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-sm"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-lg"></div>
          <div className="absolute top-1/2 right-20 w-16 h-16 bg-white/10 rounded-full blur-sm"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 