// WebWorker for WASM loading with real progress tracking
let wasmData = null;
let isLoading = false;

self.onmessage = async (e) => {
  const { action, url } = e.data;
  
  if (action === 'preload' && !isLoading && !wasmData) {
    isLoading = true;
    
    try {
      // 发送开始信号
      self.postMessage({
        type: 'progress',
        percent: 0,
        message: '开始下载WASM文件...',
        status: 'downloading'
      });
      
      // 使用fetch下载WASM文件，监听真实进度
      const response = await fetch(url || '/gs.wasm');
      
      if (!response.ok) {
        throw new Error(`下载失败: ${response.status} ${response.statusText}`);
      }
      
      // 网络诊断信息
      const contentLength = +response.headers.get('Content-Length');
      const contentType = response.headers.get('Content-Type');
      const acceptRanges = response.headers.get('Accept-Ranges');
      
      console.log('网络诊断信息:', {
        contentLength,
        contentType,
        acceptRanges,
        hasContentLength: !!contentLength,
        headers: Array.from(response.headers.entries())
      });
      
      self.postMessage({
        type: 'debug',
        info: {
          hasContentLength: !!contentLength,
          contentLength,
          contentType,
          acceptRanges,
          message: contentLength ? 
            `服务器提供了Content-Length: ${(contentLength / 1024 / 1024).toFixed(1)}MB` : 
            '服务器未提供Content-Length，将使用估算进度'
        }
      });
      
      if (!contentLength) {
        // 即使没有Content-Length，也基于实际数据量显示进度
        const chunks = [];
        const reader = response.body.getReader();
        let totalLength = 0;
        let lastProgressTime = Date.now();
        let estimatedTotal = 11 * 1024 * 1024; // 估算总大小11MB作为参考
        
        self.postMessage({
          type: 'progress', 
          percent: 0,
          message: '正在下载WASM文件（基于数据量估算）...',
          status: 'downloading'
        });
        
        // 读取数据，基于实际接收的字节数显示进度
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          chunks.push(value);
          totalLength += value.length;
          
          // 基于实际接收的数据量计算进度
          const now = Date.now();
          if (now - lastProgressTime > 200) { // 每200ms更新一次进度
            const estimatedPercent = Math.min(Math.round((totalLength / estimatedTotal) * 90), 95); // 最多到95%
            const mbReceived = (totalLength / 1024 / 1024).toFixed(1);
            
            self.postMessage({
              type: 'progress',
              percent: estimatedPercent,
              message: `正在下载WASM文件... ${mbReceived}MB (估算进度)`,
              status: 'downloading',
              received: totalLength,
              estimated: estimatedTotal
            });
            lastProgressTime = now;
          }
        }
        
        // 合并数据
        wasmData = new Uint8Array(totalLength);
        let position = 0;
        for (const chunk of chunks) {
          wasmData.set(chunk, position);
          position += chunk.length;
        }
        
        self.postMessage({
          type: 'progress',
          percent: 100,
          message: `WASM文件下载完成 (${(wasmData.byteLength / 1024 / 1024).toFixed(1)}MB)`,
          status: 'completed'
        });
      } else {
        // 有Content-Length，可以显示真实进度
        const reader = response.body.getReader();
        const chunks = [];
        let receivedLength = 0;
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          chunks.push(value);
          receivedLength += value.length;
          
          // 计算并发送真实下载进度
          const percent = Math.round((receivedLength / contentLength) * 100);
          const mbReceived = (receivedLength / 1024 / 1024).toFixed(1);
          const mbTotal = (contentLength / 1024 / 1024).toFixed(1);
          
          self.postMessage({
            type: 'progress',
            percent,
            message: `正在下载WASM文件... ${mbReceived}MB / ${mbTotal}MB`,
            status: 'downloading',
            received: receivedLength,
            total: contentLength
          });
        }
        
        // 合并所有chunks
        wasmData = new Uint8Array(receivedLength);
        let position = 0;
        for (const chunk of chunks) {
          wasmData.set(chunk, position);
          position += chunk.length;
        }
        
        self.postMessage({
          type: 'progress',
          percent: 100,
          message: `WASM文件下载完成 (${(wasmData.byteLength / 1024 / 1024).toFixed(1)}MB)`,
          status: 'completed'
        });
      }
      
      // 发送完成信号，包含数据
      self.postMessage({
        type: 'complete',
        data: wasmData.buffer,
        size: wasmData.byteLength
      });
      
    } catch (error) {
      self.postMessage({
        type: 'error',
        error: error.message || '下载WASM文件失败'
      });
    } finally {
      isLoading = false;
    }
  } else if (action === 'getStatus') {
    // 返回当前状态
    self.postMessage({
      type: 'status',
      isLoading,
      hasData: !!wasmData,
      dataSize: wasmData ? wasmData.byteLength : 0
    });
  } else if (action === 'getData' && wasmData) {
    // 返回已下载的数据
    self.postMessage({
      type: 'complete',
      data: wasmData.buffer,
      size: wasmData.byteLength
    });
  } else if (action === 'clear') {
    // 清除缓存数据
    wasmData = null;
    isLoading = false;
    self.postMessage({
      type: 'cleared'
    });
  }
}; 