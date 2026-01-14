import type { jsPDF } from "jspdf";
import type { Options, CaptureResult } from "./types";
import { createEnhancedClone, destroySandbox } from "./utils/clone-utils";
import { waitForResources } from "./utils/resource-utils";
import { captureElement } from "./utils/capture-utils";

export * from "./types";

async function runBatches<T>(
  tasks: (() => Promise<T>)[],
  batchSize: number,
  onProgress?: (val: number, current: number, total: number) => void
): Promise<T[]> {
  const results: T[] = [];
  const total = tasks.length;
  let completed = 0;

  for (let i = 0; i < total; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((task) => task()));
    results.push(...batchResults);

    completed += batch.length;
    if (onProgress) {
      onProgress(Math.round((completed / total) * 100), completed, total);
    }
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
    debug = false, // 新增
    autoScroll = true, // 新增
    onClone,
    onProgress,
    resourceTimeout = 2000,
    ignoreElements,
  } = options;

  // 传入新的配置项到 Clone 工具
  const { sandbox, clone } = createEnhancedClone(element, {
    onClone,
    autoScroll,
    debug,
  });

  try {
    await waitForResources(clone, resourceTimeout);

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
          ignoreElements,
        })
    );

    const results = await runBatches(captureTasks, concurrency, onProgress);
    const validResults = results.filter((r): r is CaptureResult => r !== null);

    // 动态导入 jsPDF
    const { jsPDF } = await import("jspdf");

    if (validResults.length === 0) {
      console.warn("[html-img-pdf] No content captured.");
      return new jsPDF();
    }

    let pdf: jsPDF | null = null;

    for (const imgData of validResults) {
      if (pageSize === "auto") {
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
        pdf.addImage(
          imgData.dataUrl,
          imageFormat.toUpperCase(),
          0,
          0,
          imgData.width,
          imgData.height
        );
      } else {
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

        if (!pdf) {
          // @ts-ignore
          pdf = new jsPDF({ orientation, unit: "pt", format: targetFormat });
        } else {
          // @ts-ignore
          pdf.addPage(targetFormat, orientation);
        }

        const pdfPageWidth = pdf.internal.pageSize.getWidth();
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

    if (!pdf) {
      throw new Error("PDF generation failed: No pages rendered.");
    }

    if (!debug) {
      pdf.save(fileName);
    } else {
      console.log(
        "[html-img-pdf] Debug mode: PDF generated but not saved. Check the sandbox on screen."
      );
      // 在 debug 模式下，也可以选择 save，看你需求，通常保留 save 方便对比
      // pdf.save("debug-" + fileName);
    }

    return pdf;
  } catch (err) {
    console.error("[html-img-pdf] Export failed:", err);
    throw err;
  } finally {
    // Debug 模式下不销毁沙箱
    if (!debug) {
      destroySandbox(sandbox);
    }
  }
}
