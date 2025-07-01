import { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import PDFUploader from './components/PDFUploader';
import CompressionOptions from './components/CompressionOptions';
import ProcessingStatus from './components/ProcessingStatus';
import HowItWorks from './components/HowItWorks';
import KeyFeatures from './components/KeyFeatures';
import Footer from './components/Footer';
import { useGhostscriptCompressor } from './hooks/useGhostscriptCompressor';
import { getCompressionQualities } from './wasm/ghostscript-compressor';

export interface CompressionLevel {
  id: 'balanced' | 'high-efficiency' | 'high-quality';
  name: string;
  description: string;
  quality: number;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  status: string;
  error?: string;
}

// 基于Ghostscript质量映射的压缩等级
const COMPRESSION_LEVELS: CompressionLevel[] = getCompressionQualities().map(quality => ({
  id: quality.id,
  name: quality.name,
  description: quality.description,
  quality: quality.dpi / 300 // 将DPI转换为质量分数
}));

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>(COMPRESSION_LEVELS[0]);
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    status: '',
  });
  const [compressedFile, setCompressedFile] = useState<Uint8Array | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);

  // 使用Ghostscript压缩Hook
  const {
    compressPDF: compressPDFWithGhostscript,
    isEngineReady,
    isEngineLoading,
    engineError,
    preloadProgress,
    isCompressing,
    compressionProgress,
    canCompress,
    retryPreload
  } = useGhostscriptCompressor();

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setOriginalSize(file.size);
    setCompressedFile(null);
    setCompressedSize(0);
    setProcessing({
      isProcessing: false,
      progress: 0,
      status: '',
    });
  }, []);

  const compressPDF = useCallback(async () => {
    if (!selectedFile || !canCompress(selectedFile)) return;

    setProcessing({
      isProcessing: true,
      progress: 0,
      status: '准备开始压缩...',
    });

    try {
      const result = await compressPDFWithGhostscript(selectedFile, compressionLevel.id);
      
      if (result.success && result.data) {
        setCompressedFile(result.data);
        setCompressedSize(result.compressedSize);
        setProcessing({
          isProcessing: false,
          progress: 100,
          status: '压缩完成！',
        });
      } else {
        setProcessing({
          isProcessing: false,
          progress: 0,
          status: '',
          error: result.error || '压缩失败，请重试。',
        });
      }

    } catch (error) {
      console.error('PDF compression error:', error);
      setProcessing({
        isProcessing: false,
        progress: 0,
        status: '',
        error: '压缩过程中发生错误，请重试。',
      });
    }
  }, [selectedFile, compressionLevel, compressPDFWithGhostscript, canCompress]);

  const downloadCompressed = useCallback(() => {
    if (!compressedFile || !selectedFile) return;

    const blob = new Blob([compressedFile], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name.replace('.pdf', '_compressed.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [compressedFile, selectedFile]);

  const resetProcess = useCallback(() => {
    setSelectedFile(null);
    setCompressedFile(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setProcessing({
      isProcessing: false,
      progress: 0,
      status: '',
    });
  }, []);

  // 同步压缩进度到本地状态
  useEffect(() => {
    if (compressionProgress && isCompressing) {
      setProcessing(prev => ({
        ...prev,
        progress: compressionProgress.progress,
        status: compressionProgress.message,
      }));
    }
  }, [compressionProgress, isCompressing]);

  // 显示引擎状态的提示信息
  const getEngineStatusMessage = () => {
    if (engineError) {
      return {
        type: 'error' as const,
        message: `压缩引擎加载失败: ${engineError}`,
        action: '重试加载',
        onAction: retryPreload
      };
    }
    
    if (isEngineLoading) {
      return {
        type: 'loading' as const,
        message: `正在后台加载压缩引擎... ${Math.round(preloadProgress)}%`,
        progress: preloadProgress
      };
    }
    
    if (!isEngineReady) {
      return {
        type: 'warning' as const,
        message: '压缩引擎尚未就绪，功能可能受限'
      };
    }
    
    return null;
  };

  const engineStatus = getEngineStatusMessage();

  return (
    <div className="min-h-screen bg-slate-50 text-text-primary">
      <Header />
      
      {/* 引擎状态提示条 */}
      {engineStatus && (
        <div className={`py-2 px-4 text-center text-sm ${
          engineStatus.type === 'error' ? 'bg-red-100 text-red-700' :
          engineStatus.type === 'loading' ? 'bg-blue-100 text-blue-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-4">
            <span>{engineStatus.message}</span>
            {engineStatus.type === 'loading' && (
              <div className="w-32 bg-white rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${engineStatus.progress || 0}%` }}
                />
              </div>
            )}
            {engineStatus.type === 'error' && engineStatus.onAction && (
              <button
                onClick={engineStatus.onAction}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
              >
                {engineStatus.action}
              </button>
            )}
          </div>
        </div>
      )}
      
      <main className="flex flex-1 flex-col">
        {!selectedFile && !processing.isProcessing && !compressedFile && (
          <>
            <HeroSection />
            <HowItWorks />
            <KeyFeatures />
          </>
        )}

        {/* PDF 处理区域 */}
        <section className="flex-1 py-8 sm:py-12 px-4 sm:px-10">
          <div className="max-w-4xl mx-auto">
            {!selectedFile && !processing.isProcessing && !compressedFile && (
              <PDFUploader onFileSelect={handleFileSelect} />
            )}

            {selectedFile && !processing.isProcessing && !compressedFile && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-text-primary mb-2">
                    已选择文件
                  </h2>
                  <p className="text-text-secondary">
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>

                <CompressionOptions
                  levels={COMPRESSION_LEVELS}
                  selected={compressionLevel}
                  onSelect={setCompressionLevel}
                />

                {/* 压缩准备状态提示 */}
                {!canCompress(selectedFile) && (
                  <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-700 text-sm">
                      {!isEngineReady ? '等待压缩引擎准备完成...' :
                       selectedFile.size > 100 * 1024 * 1024 ? '文件过大（限制100MB）' :
                       '文件格式不支持或文件损坏'}
                    </p>
                  </div>
                )}

                <div className="flex justify-center gap-4">
                  <button
                    onClick={resetProcess}
                    className="px-6 py-3 border border-slate-300 text-text-secondary rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    重新选择
                  </button>
                  <button
                    onClick={compressPDF}
                    disabled={!canCompress(selectedFile)}
                    className={`btn-primary flex items-center gap-2 ${
                      !canCompress(selectedFile) 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-primary-dark'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {isEngineReady ? '开始压缩' : '等待引擎就绪...'}
                  </button>
                </div>
              </div>
            )}

            {processing.isProcessing && (
              <ProcessingStatus processing={processing} />
            )}

            {compressedFile && !processing.isProcessing && (
              <div className="text-center space-y-6">
                <div className="feature-card max-w-md mx-auto">
                  <h2 className="text-2xl font-bold text-text-primary mb-4">
                    压缩完成！
                  </h2>
                  <div className="space-y-2 text-text-secondary">
                    <p>原始大小: {(originalSize / 1024 / 1024).toFixed(2)} MB</p>
                    <p>压缩后大小: {(compressedSize / 1024 / 1024).toFixed(2)} MB</p>
                    <p className="font-semibold text-accent">
                      节省空间: {((1 - compressedSize / originalSize) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-text-secondary mt-2">
                      使用 {compressionLevel.name} 压缩模式
                    </p>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={resetProcess}
                    className="px-6 py-3 border border-slate-300 text-text-secondary rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    压缩新文件
                  </button>
                  <button
                    onClick={downloadCompressed}
                    className="btn-primary flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    下载压缩文件
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
