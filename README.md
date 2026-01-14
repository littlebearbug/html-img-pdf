# html-img-pdf

[![npm version](https://img.shields.io/npm/v/html-img-pdf.svg)](https://www.npmjs.com/package/html-img-pdf)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

**html-img-pdf** 是一个现代化、基于 TypeScript 的 HTML 转 PDF 工具。

它结合了 [html-to-image](https://github.com/bubkoo/html-to-image) 的渲染能力与 [jsPDF](https://github.com/parallax/jsPDF) 的 PDF 生成能力，解决了传统 `html2canvas` 截图模糊、样式丢失等问题。支持**所见即所得**的自动尺寸导出，也支持标准的 **A4/Letter 分页**导出。

- **📦 按需加载 (Turbo Loading)**: `jspdf` 与 `html-to-image` 等重型依赖采用动态导入，大幅减小初始加载体积。
- **📊 进度监听**: 支持 `onProgress` 回调，实时获取导出进度。
- **⏱️ 资源加载控制**: 支持 `resourceTimeout`，防止因某张图片加载失败导致任务永久挂起。
- **🧹 元素过滤**: 支持 `ignoreElements` 逻辑，可在克隆阶段排除特定元素。
- **TS**: 完整的 TypeScript 类型定义。

## 📦 安装

```bash
npm install html-img-pdf
# 或者
yarn add html-img-pdf
# 或者
pnpm add html-img-pdf
```

## 🚀 快速上手

### 1. 基础用法：自动尺寸 (默认)

最简单的用法，PDF 页面大小会自动适应 HTML 元素的宽高。非常适合导出长截图或不规则大小的组件。

```typescript
import { htmlToPdf } from "html-img-pdf";

const element = document.getElementById("my-content");

// 导出 PDF
await htmlToPdf(element, {
  fileName: "my-report.pdf",
});
```

### 2. 导出为 A4 格式 (标准文档)

将内容放入 A4 页面中，内容会等比缩放以适应页面宽度。

```typescript
await htmlToPdf(element, {
  fileName: "contract.pdf",
  pageSize: "a4", // 设置为 A4
  imageFormat: "jpeg", // 使用 JPEG 压缩体积
  quality: 0.95, // 图片质量
});
```

### 3. 多页模式 (PPT/幻灯片风格)

如果你有一个列表或多个幻灯片容器，希望每个子元素占 PDF 的一页：

```typescript
// 假设 HTML 结构如下:
// <div id="slides-container">
//   <div class="slide">Page 1</div>
//   <div class="slide">Page 2</div>
//   <div class="slide">Page 3</div>
// </div>

const container = document.getElementById("slides-container");

await htmlToPdf(container, {
  fileName: "presentation.pdf",
  multipage: true,
  pageSize: "auto",
});
```

### 4. 调试或在页面上查看沙箱

开启 `debug: true`，库将在页面上保留并显示沙箱（左上角）以便你审查克隆后的 DOM；同时默认不会自动保存文件，方便人工检查。

```typescript
await htmlToPdf(document.body, {
  debug: true,
  fileName: "debug.pdf",
});
```

## 📖 API 文档

### `htmlToPdf(element, options)`

#### 参数

- `element`: `HTMLElement` - 需要导出的 DOM 节点。
- `options`: `Options` (可选) - 配置对象。

#### Options 配置项

| 属性名            | 类型                                                       | 默认值                    | 说明                                                                                                                                                  |
| :---------------- | :--------------------------------------------------------- | :------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fileName`        | `string`                                                   | `"document.pdf"`          | 导出的文件名。                                                                                                                                        |
| `pageSize`        | `'auto'` \| `'a4'` \| `'letter'`... \| `{ width, height }` | `'auto'`                  | **'auto'**: 页面尺寸等于截图尺寸。<br>**标准纸张**: 使用标准纸张尺寸（如 `a4`）。<br>**{width, height}**: 自定义 PDF 页面宽高（pt/px 视上下文而定）。 |
| `pageOrientation` | `'portrait'` \| `'landscape'` \| `'auto'`                  | `'portrait'`              | 页面方向；设置为 `auto` 或在 `pageSize: 'auto'` 时库会根据内容宽高比自动判断。                                                                        |
| `multipage`       | `boolean`                                                  | `false`                   | 是否开启多页模式。开启后，`element` 的每个直接子元素将生成一页 PDF（若没有直接子元素，则整个克隆作为一页）。                                          |
| `imageFormat`     | `'png'` \| `'jpeg'`                                        | `'png'`                   | 截图生成的图片格式。JPEG 体积更小，PNG 支持透明。                                                                                                     |
| `quality`         | `number`                                                   | `0.95`                    | 图片质量 (0 - 1)，仅对 JPEG 有效。                                                                                                                    |
| `pixelRatio`      | `number`                                                   | `window.devicePixelRatio` | 渲染像素比。调高该数值可提高清晰度，但会增加内存与文件体积。默认使用 `window.devicePixelRatio`。                                                      |
| `concurrency`     | `number`                                                   | `3`                       | 并发处理页数。数值越大速度越快，但内存占用越高。                                                                                                      |
| `backgroundColor` | `string`                                                   | `"#ffffff"`               | PDF 页面的背景颜色（当导出 PNG 并且需透明时可设为 `transparent`）。                                                                                   |
| `debug`           | `boolean`                                                  | `false`                   | 是否开启调试模式。`true` 时会在页面上显示沙箱并且默认不自动销毁与不自动保存文件，便于调试。                                                           |
| `autoScroll`      | `boolean`                                                  | `true`                    | 是否自动展开带滚动的容器以截取全部内容。`true` 会尝试将 `overflow` 展开，`false` 则只截取可视区域。                                                   |
| `onClone`         | `(clone: HTMLElement, sandbox?: HTMLElement) => void`      | `undefined`               | 在截图前修改克隆 DOM 的回调。可用于隐藏按钮、调整样式等。                                                                                             |
| `onProgress`      | `(progress, current, total) => void`                       | `undefined`               | **(New)** 进度回调。`progress`: 0-100 的整数；`current`: 当前处理的页数；`total`: 总页数。                                                            |
| `resourceTimeout` | `number`                                                   | `2000`                    | **(New)** 图片、字体等资源的加载超时时间（ms）。                                                                                                      |
| `ignoreElements`  | `(element: Element) => boolean`                            | `undefined`               | **(New)** 元素过滤器。返回 `true` 的元素将不会被渲染到 PDF 中。                                                                                       |

## 💡 常见问题与技巧

### 1. 跨域图片问题 (CORS)

如果你的 HTML 中包含跨域图片（如 CDN 图片），截图可能会空白或报错。
**解决方案**：

1. 确保图片服务器配置了 `Access-Control-Allow-Origin: *`。
2. 在 `img` 标签上添加 `crossorigin="anonymous"` 属性。

### 2. 导出内容被截断？

本库包含了一个安全限制 `MAX_CANVAS_PIXELS = 16000` (像素)，这是为了防止浏览器 Canvas 过大导致崩溃。如果你的页面极长（例如超过 16000px），建议使用 `multipage` 模式将内容切分为多个 DOM 节点。

### 3. `onClone` 的妙用

在克隆完成后会回调 `onClone(clone, sandbox)`，你可以在克隆的 DOM 中做任何不会影响真实页面的改动，例如隐藏按钮、替换图片地址、强制字体颜色等：

```typescript
htmlToPdf(document.body, {
  onClone: (clone, sandbox) => {
    const btn = clone.querySelector(".print-btn");
    if (btn) btn.style.display = "none";
  },
  // 过滤掉所有带 .skip-in-pdf 类的元素
  ignoreElements: (el) => el.classList.contains("skip-in-pdf"),
  // 超时控制
  resourceTimeout: 5000,
  // 进度监听
  onProgress: (p) => console.log(`已成功生成 ${p}%`),
});
```

### 4. Debug 与沙箱

开启 `debug: true` 会在页面左上角显示沙箱，你可以在浏览器开发者工具中检查克隆后的 DOM。如果你想同时保存 PDF 以便比较，调试时也可以手动调用返回的 `jsPDF.save()`。

## 📄 License

MIT
