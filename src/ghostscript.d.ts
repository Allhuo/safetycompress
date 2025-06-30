declare module '@jspawn/ghostscript-wasm' {
  function Module(): Promise<{
    FS: any;
    callMain: (args: string[]) => number;
  }>;
  export default Module;
} 