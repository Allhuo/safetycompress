import type { 
  GhostscriptModule, 
  GhostscriptConfig, 
  WSAMLoadProgress 
} from '../wasm/types';

// 默认配置
const DEFAULT_CONFIG: GhostscriptConfig = {
  wasmPath: '/gs.wasm',
  jsPath: '/gs.js',
  preloadEnabled: true,
  fallbackEnabled: true,
};

// 全局状态管理
let ghostscriptModule: GhostscriptModule | null = null;
let isLoaded = false;
let isLoading = false;
let loadPromise: Promise<GhostscriptModule> | null = null;

/**
 * 检查WebAssembly支持
 */
export function isWebAssemblySupported(): boolean {
  return typeof WebAssembly === 'object' && 
         typeof WebAssembly.instantiate === 'function';
}

/**
 * 动态加载Ghostscript JS脚本
 */
async function loadGhostscriptScript(jsPath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // 检查是否已经加载
    if (window.Module && typeof window.Module === 'function') {
      resolve(window.Module);
      return;
    }

    const script = document.createElement('script');
    script.src = jsPath;
    script.onload = () => {
      // Ghostscript WASM 模块加载后，window.Module 应该可用
      if (window.Module && typeof window.Module === 'function') {
        resolve(window.Module);
      } else {
        reject(new Error('Ghostscript module not found after script load'));
      }
    };
    script.onerror = () => reject(new Error(`Failed to load ${jsPath}`));
    
    document.head.appendChild(script);
  });
}

/**
 * 初始化Ghostscript模块
 */
async function initializeGhostscript(
  config: GhostscriptConfig,
  onProgress?: (progress: WSAMLoadProgress) => void
): Promise<GhostscriptModule> {
  
  // 加载JS脚本
  if (onProgress) {
    onProgress({ loaded: 0, total: 100, percentage: 10 });
  }
  
  const ModuleFactory = await loadGhostscriptScript(config.jsPath);
  
  if (onProgress) {
    onProgress({ loaded: 30, total: 100, percentage: 30 });
  }

  // 创建模块实例
  const moduleConfig = {
    locateFile: (path: string) => {
      if (path.endsWith('.wasm')) {
        return config.wasmPath;
      }
      return path;
    },
    
    // 进度回调
    ...(onProgress && {
      onRuntimeInitialized: () => {
        onProgress({ loaded: 100, total: 100, percentage: 100 });
      }
    })
  };

  // 初始化模块
  const module = await ModuleFactory(moduleConfig);
  
  // 等待模块准备就绪
  await module.ready;

  // 创建我们的包装器对象
  const wrapper: GhostscriptModule = {
    FS: module.FS,
    Module: module,
    arguments: [],
    preRun: [],
    postRun: [],
    print: (text: string) => console.log('[Ghostscript]', text),
    printErr: (text: string) => console.error('[Ghostscript Error]', text),
    setStatus: (text: string) => console.log('[Ghostscript Status]', text),
    totalDependencies: 0,
  };

  return wrapper;
}

/**
 * 加载Ghostscript WASM模块
 */
export async function loadGhostscript(
  config: Partial<GhostscriptConfig> = {},
  onProgress?: (progress: WSAMLoadProgress) => void
): Promise<GhostscriptModule> {
  
  // 检查WebAssembly支持
  if (!isWebAssemblySupported()) {
    throw new Error('WebAssembly is not supported in this browser');
  }

  // 如果已经加载，直接返回
  if (isLoaded && ghostscriptModule) {
    return ghostscriptModule;
  }

  // 如果正在加载，返回现有的Promise
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // 开始加载
  isLoading = true;
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  loadPromise = initializeGhostscript(finalConfig, onProgress)
    .then((module) => {
      ghostscriptModule = module;
      isLoaded = true;
      isLoading = false;
      return module;
    })
    .catch((error) => {
      isLoading = false;
      loadPromise = null;
      throw error;
    });

  return loadPromise;
}

/**
 * 预加载Ghostscript（后台加载）
 */
export function preloadGhostscript(
  config: Partial<GhostscriptConfig> = {},
  onProgress?: (progress: WSAMLoadProgress) => void
): Promise<GhostscriptModule> {
  return loadGhostscript(config, onProgress).catch((error) => {
    console.warn('Ghostscript preload failed:', error);
    throw error;
  });
}

/**
 * 获取当前加载状态
 */
export function getLoadState() {
  return {
    isLoaded,
    isLoading,
    module: ghostscriptModule
  };
}

/**
 * 重置加载状态（用于测试或重新加载）
 */
export function resetLoadState() {
  ghostscriptModule = null;
  isLoaded = false;
  isLoading = false;
  loadPromise = null;
}

// 类型声明
declare global {
  interface Window {
    Module: any;
  }
} 