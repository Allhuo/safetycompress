import type { 
  CompressionResult, 
  CompressionProgress
} from './types';

// 使用正确的Ghostscript WASM包
let ghostscriptModule: any = null;
let isModuleLoaded = false;

// 压缩质量到Ghostscript参数的映射
const QUALITY_MAPPING = {
  'high-efficiency': {
    setting: '/screen',
    dpi: 72,
    description: '最大压缩 (72 DPI, 适合网络查看)'
  },
  'balanced': {
    setting: '/ebook',
    dpi: 150, 
    description: '平衡模式 (150 DPI, 通用推荐)'
  },
  'high-quality': {
    setting: '/printer',
    dpi: 300,
    description: '高质量 (300 DPI, 适合打印)'
  }
} as const;

/**
 * 动态加载Ghostscript脚本
 */
async function loadGhostscriptScript(): Promise<any> {
  return new Promise((resolve, reject) => {
    // 检查是否已经有全局的Module函数
    if ((window as any).Module) {
      resolve((window as any).Module);
      return;
    }

    const script = document.createElement('script');
    script.src = '/gs.js';  // 从public目录加载
    script.onload = () => {
      // gs.js会在全局设置Module
      if ((window as any).Module) {
        resolve((window as any).Module);
      } else {
        reject(new Error('Ghostscript模块加载失败'));
      }
    };
    script.onerror = () => reject(new Error('无法加载Ghostscript脚本'));
    
    document.head.appendChild(script);
  });
}

/**
 * 加载Ghostscript WASM模块
 */
async function loadGhostscriptModule(onProgress?: (progress: any) => void): Promise<any> {
  if (isModuleLoaded && ghostscriptModule) {
    return ghostscriptModule;
  }

  try {
    if (onProgress) {
      onProgress({ percentage: 10, message: '正在加载Ghostscript脚本...' });
    }

    // 直接加载gs.js脚本
    const ModuleFactory = await loadGhostscriptScript();
    
    if (onProgress) {
      onProgress({ percentage: 50, message: '正在初始化Ghostscript引擎...' });
    }

    // 调用Module工厂函数
    ghostscriptModule = await ModuleFactory();
    isModuleLoaded = true;

    if (onProgress) {
      onProgress({ percentage: 100, message: 'Ghostscript引擎就绪' });
    }

    return ghostscriptModule;
  } catch (error) {
    console.error('Failed to load Ghostscript module:', error);
    throw new Error(`无法加载Ghostscript引擎: ${error}`);
  }
}

/**
 * 核心PDF压缩功能
 */
export async function compressPDFWithGhostscript(
  fileBuffer: ArrayBuffer,
  quality: 'high-efficiency' | 'balanced' | 'high-quality' = 'balanced',
  onProgress?: (progress: CompressionProgress) => void
): Promise<CompressionResult> {
  
  const originalSize = fileBuffer.byteLength;
  
  try {
    // 更新进度：准备阶段
    if (onProgress) {
      onProgress({
        stage: 'preparation',
        progress: 5,
        message: '正在准备压缩环境...'
      });
    }

    // 加载Ghostscript模块
    const gs = await loadGhostscriptModule((loadProgress) => {
      if (onProgress) {
        onProgress({
          stage: 'loading',
          progress: 5 + (loadProgress.percentage * 0.3), // 5-35%
          message: loadProgress.message || `正在加载压缩引擎... ${Math.round(loadProgress.percentage)}%`
        });
      }
    });

    if (onProgress) {
      onProgress({
        stage: 'file-setup',
        progress: 40,
        message: '正在设置工作目录...'
      });
    }

    // 设置工作目录（模仿测试文件中的做法）
    const working = "/working";
    
    // 确保工作目录存在
    try {
      gs.FS.mkdir(working);
    } catch (e) {
      // 目录可能已存在，忽略错误
    }
    
    // 切换到工作目录
    gs.FS.chdir(working);

    // 将输入文件写入Ghostscript文件系统
    const inputFileName = 'input.pdf';
    const outputFileName = 'output.pdf';
    
    const inputBytes = new Uint8Array(fileBuffer);
    gs.FS.writeFile(inputFileName, inputBytes);

    if (onProgress) {
      onProgress({
        stage: 'compression',
        progress: 50,
        message: `开始${QUALITY_MAPPING[quality].description}压缩...`
      });
    }

    // 构建Ghostscript命令参数（按照测试文件的方式）
    const qualitySettings = QUALITY_MAPPING[quality];
    const args = [
      '-dSAFER',
      '-dBATCH',
      '-dNOPAUSE',
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.4',
      `-dPDFSETTINGS=${qualitySettings.setting}`,
      '-dAutoRotatePages=/None',
      '-dColorImageDownsampleType=/Bicubic',
      '-dGrayImageDownsampleType=/Bicubic',
      '-dMonoImageDownsampleType=/Bicubic',
      `-sOutputFile=${outputFileName}`,
      inputFileName
    ];

    if (onProgress) {
      onProgress({
        stage: 'compression',
        progress: 70,
        message: '正在执行PDF压缩...'
      });
    }

    // 执行Ghostscript命令（使用测试文件中的方式）
    const result = gs.callMain(args);

    if (result !== 0) {
      throw new Error(`Ghostscript压缩失败，退出代码: ${result}`);
    }

    if (onProgress) {
      onProgress({
        stage: 'compression',
        progress: 90,
        message: '压缩完成，正在读取结果...'
      });
    }

    // 读取压缩后的文件
    let compressedData: Uint8Array;
    try {
      compressedData = gs.FS.readFile(outputFileName);
    } catch (error) {
      throw new Error('压缩完成但无法读取输出文件。可能是输入文件格式不受支持。');
    }
    
    // 清理文件系统
    try {
      gs.FS.unlink(inputFileName);
      gs.FS.unlink(outputFileName);
    } catch (error) {
      console.warn('清理临时文件失败:', error);
    }
    
    const compressedSize = compressedData.byteLength;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;
    
    if (onProgress) {
      onProgress({
        stage: 'complete',
        progress: 100,
        message: `压缩完成！文件大小减少了 ${compressionRatio.toFixed(1)}%`
      });
    }

    return {
      success: true,
      data: compressedData,
      originalSize,
      compressedSize,
      compressionRatio
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '压缩过程中发生未知错误';
    
    if (onProgress) {
      onProgress({
        stage: 'error',
        progress: 0,
        message: errorMessage
      });
    }
    
    return {
      success: false,
      error: errorMessage,
      originalSize,
      compressedSize: 0,
      compressionRatio: 0
    };
  }
}

/**
 * 验证文件是否为有效的PDF
 */
export function validatePDFFile(fileBuffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(fileBuffer);
  
  // 检查PDF文件头
  const pdfHeader = '%PDF-';
  const headerBytes = bytes.slice(0, 5);
  const headerString = Array.from(headerBytes).map(b => String.fromCharCode(b)).join('');
  
  return headerString === pdfHeader;
}

/**
 * 获取支持的压缩质量选项
 */
export function getCompressionQualities() {
  return Object.entries(QUALITY_MAPPING).map(([key, value]) => ({
    id: key as keyof typeof QUALITY_MAPPING,
    name: key === 'high-efficiency' ? '高效压缩' : 
          key === 'balanced' ? '平衡模式' : '高质量',
    description: value.description,
    dpi: value.dpi
  }));
}

/**
 * 估算压缩后的文件大小（基于经验值）
 */
export function estimateCompressionRatio(
  quality: 'high-efficiency' | 'balanced' | 'high-quality'
): number {
  const estimatedRatios = {
    'high-efficiency': 0.65, // 通常能压缩35%
    'balanced': 0.75,        // 通常能压缩25%
    'high-quality': 0.85     // 通常能压缩15%
  };
  
  return estimatedRatios[quality];
}

/**
 * 获取模块加载状态
 */
export function getModuleLoadState() {
  return {
    isLoaded: isModuleLoaded,
    module: ghostscriptModule
  };
} 