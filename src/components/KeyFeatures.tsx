import type { FC } from 'react';

const KeyFeatures: FC = () => {
  const features = [
    {
      icon: (
        <svg fill="currentColor" height="32px" viewBox="0 0 256 256" width="32px" xmlns="http://www.w3.org/2000/svg">
          <path d="M208,40H48A16,16,0,0,0,32,56v58.78c0,89.61,75.82,119.34,91,124.39a15.53,15.53,0,0,0,10,0c15.2-5.05,91-34.78,91-124.39V56A16,16,0,0,0,208,40Zm0,74.79c0,78.42-66.35,104.62-80,109.18-13.53-4.51-80-30.69-80-109.18V56H208ZM82.34,141.66a8,8,0,0,1,11.32-11.32L112,148.68l50.34-50.34a8,8,0,0,1,11.32,11.32l-56,56a8,8,0,0,1-11.32,0Z" />
        </svg>
      ),
      title: '客户端处理',
      description: '您的文件在浏览器中直接处理，确保最大程度的隐私和安全。任何内容都不会上传到服务器。',
      highlight: 'client-side'
    },
    {
      icon: (
        <svg fill="currentColor" height="32px" viewBox="0 0 256 256" width="32px" xmlns="http://www.w3.org/2000/svg">
          <path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-68-56a12,12,0,1,1-12-12A12,12,0,0,1,140,152Z" />
        </svg>
      ),
      title: '隐私保护',
      description: '我们优先考虑您的数据隐私。由于处理是在客户端完成的，您的文件永远不会离开您的计算机。',
      highlight: 'privacy'
    },
    {
      icon: (
        <svg fill="currentColor" height="32px" viewBox="0 0 256 256" width="32px" xmlns="http://www.w3.org/2000/svg">
          <path d="M160,40A88.09,88.09,0,0,0,81.29,88.67,64,64,0,1,0,72,216h88a88,88,0,0,0,0-176Zm0,160H72a48,48,0,0,1,0-96c1.1,0,2.2,0,3.29.11A88,88,0,0,0,72,128a8,8,0,0,0,16,0,72,72,0,1,1,72,72Z" />
        </svg>
      ),
      title: '无需注册',
      description: '立即开始压缩您的PDF，无需创建账户或注册。简单快捷，即用即走。',
      highlight: 'no-registration'
    },
    {
      icon: (
        <svg fill="currentColor" height="32px" viewBox="0 0 256 256" width="32px" xmlns="http://www.w3.org/2000/svg">
          <path d="M232,112a8,8,0,0,1-8,8H206.71l-3.35,34.92-21,36.88A8,8,0,0,1,176,200H139.57l-6.3,34.64A8,8,0,0,1,128,240a7.87,7.87,0,0,1-5.27-1.92l-96-81.69a7.94,7.94,0,0,1-2.79-4.29,7.84,7.84,0,0,1,.4-6.23l14.87-34.58A8,8,0,0,1,46.5,104H72a8,8,0,0,1,0,16H52.63L39.29,151.48l87.68,74.49l5.67-31.21A8,8,0,0,1,140.42,184H176a7.91,7.91,0,0,0,6.73-3.76l20.86-36.76A8,8,0,0,1,214.31,136H232a8,8,0,0,1,8-8V112Z" />
        </svg>
      ),
      title: '快速处理',
      description: '基于先进的WebAssembly技术，实现秒级压缩处理，无需等待漫长的上传和下载时间。',
      highlight: 'fast'
    },
    {
      icon: (
        <svg fill="currentColor" height="32px" viewBox="0 0 256 256" width="32px" xmlns="http://www.w3.org/2000/svg">
          <path d="M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24ZM40,40H216V216H40Z" />
        </svg>
      ),
      title: '开源透明',
      description: '100%开源项目，我们邀请全世界来审查我们的代码。透明度是建立信任最强大的武器。',
      highlight: 'open-source'
    },
    {
      icon: (
        <svg fill="currentColor" height="32px" viewBox="0 0 256 256" width="32px" xmlns="http://www.w3.org/2000/svg">
          <path d="M231.82,120l-42.14-42.13a32,32,0,0,0-45.26,0L78.05,144.25,51.31,117.52a8,8,0,0,0-11.32,11.31L67,155.87a8,8,0,0,0,11.32,0L144.69,89.55a16,16,0,0,1,22.62,0L209.44,131.7A48,48,0,0,1,233.44,177,8,8,0,0,0,248,181.42,64.23,64.23,0,0,0,231.82,120ZM103.62,195.9a47.56,47.56,0,0,1-3.62,5.65A48,48,0,0,1,66.34,176L155.09,87.24a32,32,0,0,1,45.26,0l42.14,42.13A32,32,0,0,1,242.49,174a8,8,0,0,1,15.31,4.69,48,48,0,0,0-5.8-31.12L209.86,105.44a48,48,0,0,0-67.89,0L65.61,182a64,64,0,0,0,65.2,74.86,8,8,0,0,1-1.19-15.91A47.8,47.8,0,0,1,103.62,195.9Z" />
        </svg>
      ),
      title: '多种压缩模式',
      description: '提供平衡、高效压缩和高质量三种模式，可根据具体需求调整压缩级别以达到最佳效果。',
      highlight: 'customizable'
    }
  ];

  return (
    <section id="features" className="key-features bg-secondary rounded-xl p-6 sm:p-10 mx-4 sm:mx-10 mb-12 sm:mb-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-6 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-text-primary max-w-2xl mx-auto sm:mx-0">
            强大功能，高效PDF压缩体验
          </h2>
          <p className="text-base font-normal leading-relaxed text-text-secondary max-w-2xl mx-auto sm:mx-0">
            我们的PDF压缩工具提供一系列功能，旨在为寻求减小PDF文件大小的用户提供无缝且安全的体验。
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {features.map((feature, index) => (
            <div key={index} className="feature-card bg-white">
              <div className="icon-accent mb-4">
                {feature.icon}
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="text-sm font-normal leading-relaxed text-text-secondary">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex flex-wrap gap-3 justify-center">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-700">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              WebAssembly 驱动
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-xs text-green-700">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 13l4 4L19 7" />
              </svg>
              MIT 开源许可
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-xs text-purple-700">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12 6V4a2 2 0 00-2-2H8a2 2 0 00-2 2v2H4a1 1 0 000 2h1v6a2 2 0 002 2h6a2 2 0 002-2V8h1a1 1 0 100-2h-2z" />
              </svg>
              零数据收集
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KeyFeatures; 