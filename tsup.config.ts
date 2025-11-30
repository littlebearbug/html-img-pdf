import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"], // 同时支持 CommonJS 和 ES Module
  dts: true, // 生成类型定义文件
  clean: true,
  minify: true,
  sourcemap: true,
});
