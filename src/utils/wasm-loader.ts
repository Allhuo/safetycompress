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
let wasmWorker: Worker | null = null;
let preloadedWasmData: ArrayBuffer | null = null;
let workerPromise: Promise<ArrayBuffer> | null = null;

/**
 * 检查WebAssembly支持
 */
export function isWebAssemblySupported(): boolean {
  return typeof WebAssembly === 'object' && 
         typeof WebAssembly.instantiate === 'function';
}

/**
 * 检查WebWorker支持
 */
export function isWebWorkerSupported(): boolean {
  return typeof Worker !== 'undefined';
}

/**
 * 使用WebWorker预加载WASM文件
 */
async function preloadWasmWithWorker(
  wasmPath: string,
  onProgress?: (progress: WSAMLoadProgress) => void
): Promise<ArrayBuffer> {
  
  if (preloadedWasmData) {
    if (onProgress) {
      onProgress({
        loaded: 100,
        total: 100,
        percentage: 100,
        message: 'WASM数据已预加载完成'
      });
    }
    return preloadedWasmData;
  }

  if (workerPromise) {
    return workerPromise;
  }

  workerPromise = new Promise((resolve, reject) => {
    if (!isWebWorkerSupported()) {
      reject(new Error('WebWorker不受支持，回退到主线程加载'));
      return;
    }

    try {
      if (!wasmWorker) {
        wasmWorker = new Worker('/wasm-loader.worker.js');
        
        wasmWorker.onmessage = (e) => {
          const { type, percent, message, data, error, size, info } = e.data;
          
          switch (type) {
            case 'progress':
              if (onProgress) {
                onProgress({
                  loaded: percent,
                  total: 100,
                  percentage: percent,
                  message,
                  status: e.data.status
                });
              }
              break;
              
            case 'debug':
              console.log('WASM下载诊断:', info);
              if (onProgress && info.message) {
                onProgress({
                  loaded: 0,
                  total: 100,
                  percentage: 0,
                  message: info.message,
                  status: 'debug'
                });
              }
              break;
              
            case 'complete':
              preloadedWasmData = data;
              workerPromise = null;
              if (onProgress) {
                onProgress({
                  loaded: 100,
                  total: 100,
                  percentage: 100,
                  message: `WASM预加载完成 (${(size / 1024 / 1024).toFixed(1)}MB)`
                });
              }
              resolve(data);
              break;
              
            case 'error':
              workerPromise = null;
              reject(new Error(error));
              break;
          }
        };
        
        wasmWorker.onerror = (error) => {
          workerPromise = null;
          reject(new Error(`WebWorker错误: ${error.message}`));
        };
      }
      
      wasmWorker.postMessage({ action: 'getStatus' });
      
      const statusHandler = (e: MessageEvent) => {
        if (e.data.type === 'status') {
          if (e.data.hasData) {
            wasmWorker!.postMessage({ action: 'getData' });
          } else if (!e.data.isLoading) {
            wasmWorker!.postMessage({ action: 'preload', url: wasmPath });
          }
          wasmWorker!.removeEventListener('message', statusHandler);
        }
      };
      
      wasmWorker.addEventListener('message', statusHandler);
      
    } catch (error) {
      workerPromise = null;
      reject(error);
    }
  });

  return workerPromise;
}

/**
 * 回退：主线程加载WASM（带进度监听）
 */
async function loadWasmWithProgress(
  wasmPath: string,
  onProgress?: (progress: WSAMLoadProgress) => void
): Promise<ArrayBuffer> {
  
  if (onProgress) {
    onProgress({
      loaded: 0,
      total: 100,
      percentage: 0,
      message: '开始下载WASM文件...'
    });
  }

  const response = await fetch(wasmPath);
  
  if (!response.ok) {
    throw new Error(`下载WASM失败: ${response.status}`);
  }
  
  const contentLength = +response.headers.get('Content-Length')!;
  
  if (!contentLength) {
    // 简单下载，无进度
    if (onProgress) {
      onProgress({
        loaded: 50,
        total: 100,
        percentage: 50,
        message: '正在下载WASM文件...'
      });
    }
    
    const arrayBuffer = await response.arrayBuffer();
    
    if (onProgress) {
      onProgress({
        loaded: 100,
        total: 100,
        percentage: 100,
        message: 'WASM下载完成'
      });
    }
    
    return arrayBuffer;
  }
  
  // 带进度的下载
  const reader = response.body!.getReader();
  const chunks = [];
  let receivedLength = 0;
  
  while (true) {
    const { done, value } = await reader.read();
    
    if (done) break;
    
    chunks.push(value);
    receivedLength += value.length;
    
    const percent = Math.round((receivedLength / contentLength) * 100);
    const mbReceived = (receivedLength / 1024 / 1024).toFixed(1);
    const mbTotal = (contentLength / 1024 / 1024).toFixed(1);
    
    if (onProgress) {
      onProgress({
        loaded: receivedLength,
        total: contentLength,
        percentage: percent,
        message: `正在下载WASM文件... ${mbReceived}MB / ${mbTotal}MB`
      });
    }
  }
  
  // 合并chunks
  const uint8Array = new Uint8Array(receivedLength);
  let position = 0;
  for (const chunk of chunks) {
    uint8Array.set(chunk, position);
    position += chunk.length;
  }
  
  return uint8Array.buffer;
}

/**
 * 加载Ghostscript JS脚本
 */
async function loadGhostscriptScript(jsPath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // 检查是否已经加载
    if ((window as any).Module) {
      resolve((window as any).Module);
      return;
    }

    const script = document.createElement('script');
    script.src = jsPath;
    script.onload = () => {
      if ((window as any).Module) {
        resolve((window as any).Module);
      } else {
        reject(new Error('Ghostscript脚本加载失败'));
      }
    };
    script.onerror = () => reject(new Error('无法加载Ghostscript脚本'));
    
    document.head.appendChild(script);
  });
}

/**
 * 初始化Ghostscript模块（使用预加载的WASM数据）
 */
async function initializeGhostscript(
  config: GhostscriptConfig,
  onProgress?: (progress: WSAMLoadProgress) => void
): Promise<GhostscriptModule> {
  
  // 阶段1：加载JS脚本
  if (onProgress) {
    onProgress({ 
      loaded: 0, 
      total: 100, 
      percentage: 0,
      message: '正在加载Ghostscript脚本...' 
    });
  }
  
  const ModuleFactory = await loadGhostscriptScript(config.jsPath);
  
  // 阶段2：获取WASM数据（优先使用预加载的）
  let wasmData: ArrayBuffer;
  
  if (preloadedWasmData) {
    if (onProgress) {
      onProgress({
        loaded: 50,
        total: 100,
        percentage: 50,
        message: '使用预加载的WASM数据...'
      });
    }
    wasmData = preloadedWasmData;
  } else {
    // 回退到主线程下载
    if (onProgress) {
      onProgress({
        loaded: 20,
        total: 100,
        percentage: 20,
        message: '开始下载WASM文件...'
      });
    }
    
    wasmData = await loadWasmWithProgress(config.wasmPath, (progress) => {
      if (onProgress) {
        // 将WASM下载进度映射到总进度的20%-80%
        onProgress({
          loaded: 20 + (progress.percentage * 0.6),
          total: 100,
          percentage: 20 + (progress.percentage * 0.6),
          message: progress.message
        });
      }
    });
  }
  
  // 阶段3：初始化模块
  if (onProgress) {
    onProgress({
      loaded: 90,
      total: 100,
      percentage: 90,
      message: '正在初始化WASM模块...'
    });
  }

  const moduleConfig = {
    wasmBinary: wasmData, // 直接使用预加载的数据
    locateFile: (path: string) => {
      if (path.endsWith('.wasm')) {
        return config.wasmPath;
      }
      return path;
    },
  };

  // 初始化模块
  const module = await ModuleFactory(moduleConfig);
  
  // 等待模块准备就绪
  if (module.ready) {
    await module.ready;
  }

  if (onProgress) {
    onProgress({
      loaded: 100,
      total: 100,
      percentage: 100,
      message: 'Ghostscript引擎初始化完成'
    });
  }

  // 创建包装器对象
  const wrapper: GhostscriptModule = {
    FS: module.FS,
    Module: module,
    callMain: module.callMain?.bind(module) || (() => { throw new Error('callMain not available'); }),
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
 * 预加载Ghostscript WASM（后台WebWorker）
 */
export async function preloadGhostscript(
  config: Partial<GhostscriptConfig> = {},
  onProgress?: (progress: WSAMLoadProgress) => void
): Promise<void> {
  
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    await preloadWasmWithWorker(finalConfig.wasmPath, onProgress);
  } catch (error) {
    console.warn('WebWorker预加载失败，将在需要时回退到主线程:', error);
    // 不抛出错误，而是在实际使用时回退
  }
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
 * 获取当前加载状态
 */
export function getLoadState() {
  return {
    isLoaded,
    isLoading,
    module: ghostscriptModule,
    hasPreloadedData: !!preloadedWasmData,
    preloadedSize: preloadedWasmData ? preloadedWasmData.byteLength : 0
  };
}

/**
 * 清理资源
 */
export function cleanup() {
  if (wasmWorker) {
    // 清除WebWorker中的缓存数据
    wasmWorker.postMessage({ action: 'clear' });
    wasmWorker.terminate();
    wasmWorker = null;
  }
  
  // 重置所有全局状态
  preloadedWasmData = null;
  workerPromise = null;
  
  // 注意：这里不重置 ghostscriptModule、isLoaded、isLoading、loadPromise
  // 因为这些用于 Ghostscript 模块本身的状态，而不是预加载状态
}

// 类型声明
declare global {
  interface Window {
    Module: any;
  }
} 