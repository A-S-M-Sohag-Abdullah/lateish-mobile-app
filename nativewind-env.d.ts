/// <reference types="nativewind/types" />

// Metro turns `import "./global.css"` into a side effect; TypeScript needs to be
// told the module exists.
declare module "*.css";
