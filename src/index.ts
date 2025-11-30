import { jsPDF, type jsPDFOptions } from "jspdf";
import { toPng, toJpeg } from "html-to-image";

/**
 * PDF 预设尺寸类型
 */
export type PageSizePreset = "a4" | "letter" | "legal" | "a3" | "a5";

/**
 * 自定义尺寸接口
 */
export interface CustomPageSize {
  width: number;
  height: number;
}

/**
 * 核心配置选项
 */
export interface Options {
  fileName?: string;
  imageFormat?: "jpeg" | "png";
  quality?: number;
  backgroundColor?: string;
  /**
   * 页面尺寸设置
   * - 'auto': PDF 页面大小自动适应内容大小
   * - string: 标准尺寸 (如 'a4')，内容将按宽度缩放
   * - object: 自定义宽高 { width, height }
   */
  pageSize?: "auto" | PageSizePreset | CustomPageSize;
  /**
   * 多页模式
   * - true: 每个直接子元素为一页
   * - false: 整体为一页
   */
  multipage?: boolean;
  onClone?: (element: HTMLElement) => void;
}

// 浏览器 Canvas 安全限制
const MAX_CANVAS_PIXELS = 16000;

function createSandbox(
  sourceElement: HTMLElement,
  onClone?: (el: HTMLElement) => void
) {
  const sandbox = document.createElement("div");
  sandbox.style.position = "fixed";
  sandbox.style.top = "0";
  sandbox.style.left = "0";
  sandbox.style.opacity = "0";
  sandbox.style.pointerEvents = "none";
  sandbox.style.zIndex = "-9999";

  // 保持原始宽度，避免文字重排
  sandbox.style.width = `${sourceElement.clientWidth}px`;

  const clone = sourceElement.cloneNode(true) as HTMLElement;

  if (onClone) {
    onClone(clone);
  }

  sandbox.appendChild(clone);
  document.body.appendChild(sandbox);

  return { sandbox, clone };
}

function destroySandbox(sandbox: HTMLElement) {
  if (document.body.contains(sandbox)) {
    document.body.removeChild(sandbox);
  }
}

async function captureElement(
  element: HTMLElement,
  format: "jpeg" | "png",
  quality: number,
  bgColor: string
) {
  const width = element.offsetWidth;
  const height = element.offsetHeight;

  // 忽略空元素
  if (width === 0 || height === 0) {
    return null;
  }

  if (width > MAX_CANVAS_PIXELS || height > MAX_CANVAS_PIXELS) {
    throw new Error(
      `Canvas limit exceeded: Element dimensions (${width}x${height}) exceed the safety limit of ${MAX_CANVAS_PIXELS}px.`
    );
  }

  const opts = {
    quality,
    backgroundColor: bgColor,
    // 强制重置 margin，防止截图时产生偏移
    style: {
      margin: "0",
      transform: "none", // 防止父级 transform 影响
    },
    // 确保截图完整包含
    width: width,
    height: height,
  };

  let dataUrl: string;
  if (format === "png") {
    dataUrl = await toPng(element, opts);
  } else {
    dataUrl = await toJpeg(element, opts);
  }

  return { dataUrl, width, height };
}

export async function htmlToPdf(
  element: HTMLElement,
  options: Options = {}
): Promise<jsPDF> {
  const {
    fileName = "document.pdf",
    imageFormat = "png",
    quality = 1.0,
    backgroundColor = "#ffffff",
    pageSize = "auto",
    multipage = false,
    onClone,
  } = options;

  const { sandbox, clone } = createSandbox(element, onClone);

  try {
    let targets: HTMLElement[] = [];
    if (multipage) {
      targets = Array.from(clone.children).filter(
        (node) => node.nodeType === Node.ELEMENT_NODE
      ) as HTMLElement[];
      if (targets.length === 0) targets = [clone];
    } else {
      targets = [clone];
    }

    let pdf: jsPDF | null = null;

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      const imgData = await captureElement(
        target,
        imageFormat,
        quality,
        backgroundColor
      );

      if (!imgData) continue; // 跳过空元素

      // --- PDF 页面初始化与添加逻辑 ---

      if (pageSize === "auto") {
        // [Auto Mode]: 页面尺寸严格等于图片尺寸
        const orientation = imgData.width > imgData.height ? "l" : "p";
        const format = [imgData.width, imgData.height];

        if (!pdf) {
          // 初始化第一页
          pdf = new jsPDF({ orientation, unit: "px", format });
        } else {
          // 添加后续页
          pdf.addPage(format, orientation);
        }

        // 绘制：1:1 铺满
        pdf.addImage(
          imgData.dataUrl,
          imageFormat.toUpperCase(),
          0,
          0,
          imgData.width,
          imgData.height
        );
      } else {
        // [Fixed Mode]: 使用预设尺寸 (A4 等)
        // 1. 解析目标尺寸
        let targetFormat: string | number[] =
          typeof pageSize === "string"
            ? pageSize
            : [pageSize.width, pageSize.height];

        // 2. 智能判断方向：如果图片宽 > 高，则建议页面横向，否则纵向
        // 注意：如果你希望强制纵向，可以将此处改为固定 'p'
        const orientation = imgData.width > imgData.height ? "l" : "p";

        if (!pdf) {
          // 初始化第一页
          pdf = new jsPDF({
            orientation,
            unit: "px",
            format: targetFormat as any,
          });
        } else {
          // 添加后续页
          pdf.addPage(targetFormat as any, orientation);
        }

        // 3. 计算绘制尺寸 (Fit Width)
        const pdfPageWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();

        // 计算缩放比例：让图片宽度撑满 PDF 宽度
        const ratio = pdfPageWidth / imgData.width;
        const scaledHeight = imgData.height * ratio;

        // 绘制图片
        // 注意：这里仅按宽度缩放，如果 scaledHeight > pdfPageHeight，内容会延伸到页面外（适合长图打印）
        // 如果需要强行缩放到一页内（Fit Page），需要再比较高度比例，但通常需求是看清内容。
        pdf.addImage(
          imgData.dataUrl,
          imageFormat.toUpperCase(),
          0,
          0,
          pdfPageWidth,
          scaledHeight
        );
      }
    }

    if (!pdf) {
      // 如果所有元素都是空的，创建一个空白 PDF 防止报错
      pdf = new jsPDF();
      console.warn("[html-img-pdf] No visible content found to render.");
    }

    pdf.save(fileName);
    return pdf;
  } finally {
    destroySandbox(sandbox);
  }
}
