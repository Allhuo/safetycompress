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
import { 
  preloadGhostscript, 
  getLoadState,
  cleanup 
} from '../utils/wasm-loader';

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
   * 开始预加载Ghostscript（使用WebWorker）
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
    const { isLoaded, isLoading, hasPreloadedData } = getLoadState();
    
    // 如果已经有预加载数据或模块已加载，更新状态并返回
    if (isLoaded || hasPreloadedData) {
      setPreloaderState(prev => ({
        ...prev,
        isLoaded: true,
        isLoading: false,
        progress: 100,
        error: null
      }));
      return;
    }
    
    // 如果正在加载或本地状态显示正在加载，不重复启动
    if (isLoading || preloaderState.isLoading) {
      return;
    }

    setPreloaderState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      progress: 0
    }));

    try {
      // 使用WebWorker预加载
      await preloadGhostscript({}, (progress) => {
        setPreloaderState(prev => ({
          ...prev,
          progress: progress.percentage,
          message: progress.message
        }));
      });

      setPreloaderState(prev => ({
        ...prev,
        isLoaded: true,
        isLoading: false,
        progress: 100
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '预加载失败';
      
      setPreloaderState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        retryCount: prev.retryCount + 1
      }));
    }
  }, []);

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
    const loadState = getLoadState();
    const moduleState = getModuleLoadState();
    
    return {
      // 引擎状态
      engineReady: moduleState.isLoaded || loadState.isLoaded || loadState.hasPreloadedData,
      engineLoading: preloaderState.isLoading || loadState.isLoading,
      engineError: preloaderState.error,
      
      // 压缩状态
      isCompressing,
      compressionProgress,
      
      // 重试信息
      canRetry: preloaderState.retryCount < 3 && !!preloaderState.error,
      retryCount: preloaderState.retryCount,
      
      // 预加载进度
      preloadProgress: preloaderState.progress,
      
      // 新增：预加载数据信息
      hasPreloadedData: loadState.hasPreloadedData,
      preloadedSize: loadState.preloadedSize
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
    // 检查是否已经有数据，避免重复加载
    const { isLoaded, isLoading, hasPreloadedData } = getLoadState();
    
    if (isLoaded || isLoading || hasPreloadedData) {
      // 如果已经有数据，更新本地状态
      if (isLoaded || hasPreloadedData) {
        setPreloaderState(prev => ({
          ...prev,
          isLoaded: true,
          isLoading: false,
          progress: 100,
          error: null
        }));
      }
      return;
    }
    
    // 延迟500ms开始预加载，让页面先渲染完成
    const timer = setTimeout(() => {
      // 再次检查状态，确保没有重复加载
      const currentState = getLoadState();
      if (!currentState.isLoaded && !currentState.isLoading && !currentState.hasPreloadedData) {
        startPreload();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []); // 空依赖数组，只在组件挂载时执行一次

  /**
   * 组件卸载时清理资源
   */
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  /**
   * 监听全局模块加载状态变化（用于同步状态）
   */
  useEffect(() => {
    // 定期检查全局状态，但不触发加载
    const interval = setInterval(() => {
      const { isLoaded } = getModuleLoadState();
      const { hasPreloadedData } = getLoadState();
      
      if ((isLoaded || hasPreloadedData) && !preloaderState.isLoaded) {
        setPreloaderState(prev => ({
          ...prev,
          isLoaded: true,
          isLoading: false,
          progress: 100,
          error: null
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []); // 空依赖数组，避免重复创建定时器

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
    isEngineReady: getStatus().engineReady,
    isEngineLoading: getStatus().engineLoading,
    engineError: preloaderState.error,
    preloadProgress: preloaderState.progress,
    isCompressing,
    compressionProgress,
    
    // 新增：详细状态信息
    hasPreloadedData: getStatus().hasPreloadedData,
    preloadedSize: getStatus().preloadedSize
  };
}

/**
 * 简化的状态Hook（仅状态查询）
 */
export function useGhostscriptStatus() {
  const [status, setStatus] = useState(() => {
    const loadState = getLoadState();
    const moduleState = getModuleLoadState();
    
    return {
      isReady: moduleState.isLoaded || loadState.hasPreloadedData,
      isLoading: loadState.isLoading,
      hasPreloadedData: loadState.hasPreloadedData,
      preloadedSize: loadState.preloadedSize
    };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const loadState = getLoadState();
      const moduleState = getModuleLoadState();
      
      setStatus({
        isReady: moduleState.isLoaded || loadState.hasPreloadedData,
        isLoading: loadState.isLoading,
        hasPreloadedData: loadState.hasPreloadedData,
        preloadedSize: loadState.preloadedSize
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return status;
} 