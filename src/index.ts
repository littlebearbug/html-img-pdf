import { jsPDF } from "jspdf";
import type { Options, CaptureResult } from "./types";
import { createEnhancedClone, destroySandbox } from "./utils/clone-utils";
import { waitForResources } from "./utils/resource-utils";
import { captureElement } from "./utils/capture-utils";

export * from "./types";

async function runBatches<T>(
  tasks: (() => Promise<T>)[],
  batchSize: number
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((task) => task()));
    results.push(...batchResults);
  }
  return results;
}

export async function htmlToPdf(
  element: HTMLElement,
  options: Options = {}
): Promise<jsPDF> {
  const {
    fileName = "document.pdf",
    imageFormat = "png",
    quality = 0.95,
    backgroundColor = "#ffffff",
    pageSize = "auto",
    pageOrientation,
    multipage = false,
    pixelRatio = window.devicePixelRatio || 2,
    concurrency = 3,
    onClone,
  } = options;

  const { sandbox, clone } = createEnhancedClone(element, onClone);

  try {
    await waitForResources(clone);

    let targetElements: HTMLElement[] = [];
    if (multipage) {
      targetElements = Array.from(clone.children).filter(
        (node) => node.nodeType === Node.ELEMENT_NODE
      ) as HTMLElement[];
      if (targetElements.length === 0) targetElements = [clone];
    } else {
      targetElements = [clone];
    }

    const captureTasks = targetElements.map(
      (target) => () =>
        captureElement(target, {
          format: imageFormat,
          quality,
          backgroundColor,
          pixelRatio,
        })
    );

    const results = await runBatches(captureTasks, concurrency);
    const validResults = results.filter((r): r is CaptureResult => r !== null);

    if (validResults.length === 0) {
      console.warn("[html-img-pdf] No content captured.");
      return new jsPDF();
    }

    let pdf: jsPDF | null = null;

    for (const imgData of validResults) {
      // ---------------------------------------------------------
      // 场景 1: Auto Mode (完全适应图片大小)
      // ---------------------------------------------------------
      if (pageSize === "auto") {
        // 在 Auto 模式下，方向默认由图片形状决定
        const orientation =
          pageOrientation === "portrait" || pageOrientation === "landscape"
            ? pageOrientation === "portrait"
              ? "p"
              : "l"
            : imgData.width > imgData.height
            ? "l"
            : "p";

        const format = [imgData.width, imgData.height];

        if (!pdf) {
          pdf = new jsPDF({ orientation, unit: "px", format });
        } else {
          pdf.addPage(format, orientation);
        }

        // 1:1 绘制，填满页面
        pdf.addImage(
          imgData.dataUrl,
          imageFormat.toUpperCase(),
          0,
          0,
          imgData.width,
          imgData.height
        );
      }

      // ---------------------------------------------------------
      // 场景 2: Fixed Mode (A4, Letter 等)
      // ---------------------------------------------------------
      else {
        // 1. 确定方向：默认强制纵向 (Portrait)，除非用户显式要求 auto 或 landscape
        // 这样可以保证多页 A4 文档整齐划一，不会一页横一页竖
        const userOrientation = pageOrientation || "portrait";
        let orientation: "p" | "l";

        if (userOrientation === "auto") {
          orientation = imgData.width > imgData.height ? "l" : "p";
        } else {
          orientation = userOrientation === "landscape" ? "l" : "p";
        }

        let targetFormat =
          typeof pageSize === "string"
            ? pageSize
            : [pageSize.width, pageSize.height];

        // 2. 初始化 PDF
        // 使用 point (pt) 是 PDF 的标准做法，确保 "a4" 无论在什么屏幕 DPI 下都是标准的物理 A4 纸大小
        if (!pdf) {
          // @ts-ignore
          pdf = new jsPDF({ orientation, unit: "pt", format: targetFormat });
        } else {
          // @ts-ignore
          pdf.addPage(targetFormat, orientation);
        }

        const pdfPageWidth = pdf.internal.pageSize.getWidth();
        // const pdfPageHeight = pdf.internal.pageSize.getHeight();

        // 3. 计算缩放 (Fit Width Strategy)
        // 将像素单位的图片，缩放到点单位的 PDF 页面宽度
        const ratio = pdfPageWidth / imgData.width;
        const scaledHeight = imgData.height * ratio;

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

    pdf!.save(fileName);
    return pdf!;
  } catch (err) {
    console.error("[html-img-pdf] Export failed:", err);
    throw err;
  } finally {
    destroySandbox(sandbox);
  }
}
