import { type jsPDFOptions } from "jspdf";

export type PageSizePreset = "a4" | "letter" | "legal" | "a3" | "a5";

export interface CustomPageSize {
  width: number;
  height: number;
}

export type PageOrientation = "portrait" | "landscape" | "auto";

export interface Options {
  fileName?: string;
  imageFormat?: "jpeg" | "png";
  quality?: number;
  backgroundColor?: string;
  /**
   * Canvas 像素比，默认为 window.devicePixelRatio
   * 调大该数值可提高清晰度，但会增加文件体积
   */
  pixelRatio?: number;

  /**
   * 页面尺寸设置
   * - 'auto': PDF 页面大小自动适应内容大小
   * - string: 标准尺寸 (如 'a4')
   * - object: 自定义宽高 { width, height }
   */
  pageSize?: "auto" | PageSizePreset | CustomPageSize;

  /**
   * 页面方向
   * - 'portrait': 纵向 (默认，适用于 A4 等文档)
   * - 'landscape': 横向
   * - 'auto': 根据内容宽高比自动决定 (会导致页面大小不一)
   */
  pageOrientation?: PageOrientation;

  /**
   * 多页模式
   * - true: 每个直接子元素为一页
   * - false: 整体为一页
   */
  multipage?: boolean;

  /**
   * 并发处理数量，默认为 3
   * 数值越大速度越快，但内存占用越高，过高会导致浏览器崩溃
   */
  concurrency?: number;
  /**
   * 是否开启调试模式
   * - true: 生成结束后不销毁沙箱，并将其显示在页面左上角供审查 DOM
   * - false: (默认) 生成结束后自动销毁沙箱
   */
  debug?: boolean;

  /**
   * 是否自动展开滚动区域
   * - true: (默认) 将 overflow: auto/scroll 的元素强制展开，height: auto
   * - false: 保留滚动条，截取可视区域
   */
  autoScroll?: boolean;

  /**
   * 克隆完成后的回调
   * @param clone - 克隆后的内容节点
   * @param sandbox - 包裹克隆节点的沙箱容器 (div)
   */
  onClone?: (clone: HTMLElement, sandbox?: HTMLElement) => void;
}

export interface CaptureResult {
  dataUrl: string;
  width: number;
  height: number;
}
