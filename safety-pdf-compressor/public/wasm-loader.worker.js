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
      
      const contentLength = +response.headers.get('Content-Length');
      
      if (!contentLength) {
        // 如果没有Content-Length，回退到简单下载
        self.postMessage({
          type: 'progress', 
          percent: 50,
          message: '正在下载WASM文件（大小未知）...',
          status: 'downloading'
        });
        
        wasmData = await response.arrayBuffer();
        
        self.postMessage({
          type: 'progress',
          percent: 100,
          message: 'WASM文件下载完成',
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
      type: 'data',
      data: wasmData.buffer,
      size: wasmData.byteLength
    });
  }
}; 