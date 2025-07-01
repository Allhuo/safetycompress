// Ghostscript WASM 类型定义

export interface GhostscriptModule {
  FS: any;
  Module: any;
  callMain?: (args: string[]) => number;
  arguments: string[];
  preRun: (() => void)[];
  postRun: (() => void)[];
  print: (text: string) => void;
  printErr: (text: string) => void;
  setStatus: (text: string) => void;
  totalDependencies: number;
}

export interface CompressionOptions {
  quality: 'high-efficiency' | 'balanced' | 'high-quality';
  inputFile: string;
  outputFile: string;
}

export interface CompressionProgress {
  stage: string;
  progress: number;
  message: string;
}

export interface CompressionResult {
  success: boolean;
  data?: Uint8Array;
  error?: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export interface GhostscriptConfig {
  wasmPath: string;
  jsPath: string;
  preloadEnabled: boolean;
  fallbackEnabled: boolean;
}

export interface PreloaderState {
  isLoaded: boolean;
  isLoading: boolean;
  progress: number;
  error: string | null;
  retryCount: number;
}

export interface WSAMLoadProgress {
  loaded: number;
  total: number;
  percentage: number;
  message?: string;
  status?: string;
} 