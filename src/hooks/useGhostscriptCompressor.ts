import { useState, useEffect, useCallback } from 'react';
import type { 
  PreloaderState, 
  CompressionResult, 
  CompressionProgress 
} from '../wasm/types';
import { 
  compressPDFWithGhostscript, 
  validatePDFFile,
  getModuleLoadState
} from '../wasm/ghostscript-compressor';

/**
 * Ghostscript压缩器的Hook
 */
export function useGhostscriptCompressor() {
  // 预加载状态
  const [preloaderState, setPreloaderState] = useState<PreloaderState>({
    isLoaded: false,
    isLoading: false,
    progress: 0,
    error: null,
    retryCount: 0
  });

  // 压缩状态
  const [compressionProgress, setCompressionProgress] = useState<CompressionProgress | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  /**
   * 开始预加载Ghostscript
   */
  const startPreload = useCallback(async () => {
    // 检查WebAssembly支持
    if (typeof WebAssembly === 'undefined') {
      setPreloaderState(prev => ({
        ...prev,
        error: '当前浏览器不支持WebAssembly，请使用现代浏览器'
      }));
      return;
    }

    // 检查是否已经加载或正在加载
    const { isLoaded } = getModuleLoadState();
    if (isLoaded || preloaderState.isLoading) {
      return;
    }

    setPreloaderState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      // 直接加载gs.js脚本进行预加载
      const script = document.createElement('script');
      script.src = '/gs.js';
      
      script.onload = async () => {
        try {
          setPreloaderState(prev => ({
            ...prev,
            progress: 50
          }));

          // 初始化模块
          if ((window as any).Module) {
            await (window as any).Module();
            
            setPreloaderState(prev => ({
              ...prev,
              isLoaded: true,
              isLoading: false,
              progress: 100
            }));
          } else {
            throw new Error('Module不可用');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '初始化失败';
          setPreloaderState(prev => ({
            ...prev,
            isLoading: false,
            error: errorMessage,
            retryCount: prev.retryCount + 1
          }));
        }
      };
      
      script.onerror = () => {
        setPreloaderState(prev => ({
          ...prev,
          isLoading: false,
          error: '无法加载Ghostscript脚本',
          retryCount: prev.retryCount + 1
        }));
      };

      // 检查脚本是否已经加载
      const existingScript = document.querySelector('script[src="/gs.js"]');
      if (!existingScript) {
        document.head.appendChild(script);
      } else {
        // 脚本已存在，直接检查Module是否可用
        if ((window as any).Module) {
          setPreloaderState(prev => ({
            ...prev,
            isLoaded: true,
            isLoading: false,
            progress: 100
          }));
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '预加载失败';
      
      setPreloaderState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        retryCount: prev.retryCount + 1
      }));
    }
  }, [preloaderState.isLoading]);

  /**
   * 重试预加载
   */
  const retryPreload = useCallback(() => {
    if (preloaderState.retryCount < 3) {
      startPreload();
    }
  }, [startPreload, preloaderState.retryCount]);

  /**
   * 压缩PDF文件
   */
  const compressPDF = useCallback(async (
    file: File,
    quality: 'high-efficiency' | 'balanced' | 'high-quality' = 'balanced'
  ): Promise<CompressionResult> => {
    
    setIsCompressing(true);
    setCompressionProgress(null);

    try {
      // 读取文件
      const arrayBuffer = await file.arrayBuffer();
      
      // 验证PDF文件
      if (!validatePDFFile(arrayBuffer)) {
        throw new Error('选择的文件不是有效的PDF格式');
      }

      // 执行压缩
      const result = await compressPDFWithGhostscript(
        arrayBuffer,
        quality,
        (progress) => {
          setCompressionProgress(progress);
        }
      );

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '压缩过程中发生未知错误';
      
      return {
        success: false,
        error: errorMessage,
        originalSize: file.size,
        compressedSize: 0,
        compressionRatio: 0
      };
    } finally {
      setIsCompressing(false);
      setCompressionProgress(null);
    }
  }, []);

  /**
   * 获取压缩状态信息
   */
  const getStatus = useCallback(() => {
    const loadState = getModuleLoadState();
    
    return {
      // 引擎状态
      engineReady: loadState.isLoaded || preloaderState.isLoaded,
      engineLoading: preloaderState.isLoading,
      engineError: preloaderState.error,
      
      // 压缩状态
      isCompressing,
      compressionProgress,
      
      // 重试信息
      canRetry: preloaderState.retryCount < 3 && !!preloaderState.error,
      retryCount: preloaderState.retryCount,
      
      // 预加载进度
      preloadProgress: preloaderState.progress
    };
  }, [preloaderState, isCompressing, compressionProgress]);

  /**
   * 检查是否可以开始压缩
   */
  const canCompress = useCallback((file?: File) => {
    const status = getStatus();
    
    if (!file) return false;
    if (!status.engineReady) return false;
    if (status.isCompressing) return false;
    if (file.type !== 'application/pdf') return false;
    if (file.size > 100 * 1024 * 1024) return false; // 100MB 限制
    
    return true;
  }, [getStatus]);

  /**
   * 页面加载时自动开始预加载
   */
  useEffect(() => {
    // 延迟1秒开始预加载，让页面先渲染完成
    const timer = setTimeout(() => {
      startPreload();
    }, 1000);

    return () => clearTimeout(timer);
  }, [startPreload]);

  /**
   * 监听模块加载状态变化
   */
  useEffect(() => {
    const { isLoaded } = getModuleLoadState();
    if (isLoaded && !preloaderState.isLoaded) {
      setPreloaderState(prev => ({
        ...prev,
        isLoaded: true,
        isLoading: false,
        progress: 100
      }));
    }
  }, [preloaderState.isLoaded]);

  return {
    // 主要功能
    compressPDF,
    
    // 状态信息
    getStatus,
    canCompress,
    
    // 控制方法
    startPreload,
    retryPreload,
    
    // 实时状态（用于UI展示）
    isEngineReady: preloaderState.isLoaded || getModuleLoadState().isLoaded,
    isEngineLoading: preloaderState.isLoading,
    engineError: preloaderState.error,
    preloadProgress: preloaderState.progress,
    isCompressing,
    compressionProgress
  };
}

/**
 * 简化版Hook，只用于检查引擎状态
 */
export function useGhostscriptStatus() {
  const [status, setStatus] = useState(() => getModuleLoadState());

  useEffect(() => {
    const interval = setInterval(() => {
      const currentState = getModuleLoadState();
      setStatus(currentState);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    isReady: status.isLoaded,
    isLoading: false, // 简化版不跟踪加载状态
    module: status.module
  };
} 