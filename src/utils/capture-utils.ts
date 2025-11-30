import { toPng, toJpeg } from "html-to-image";
import type { CaptureResult } from "../types";

// 安全限制：防止生成导致浏览器崩溃的超大 Canvas
// 15000px 是 iOS Safari 的硬限制附近，保留安全余量
const MAX_DIMENSION = 15000;

interface CaptureOptions {
  format: "jpeg" | "png";
  quality: number;
  backgroundColor: string;
  pixelRatio: number;
}

export async function captureElement(
  element: HTMLElement,
  options: CaptureOptions
): Promise<CaptureResult | null> {
  const { format, quality, backgroundColor, pixelRatio } = options;
  const width = element.offsetWidth;
  const height = element.offsetHeight;

  if (width === 0 || height === 0) return null;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    console.error(
      `[html-img-pdf] Element too large (${width}x${height}). Skipped to prevent crash.`
    );
    return null;
  }

  const libOptions = {
    quality,
    backgroundColor,
    pixelRatio,
    width,
    height,
    // 关键配置：尝试绕过 CORS 问题
    cacheBust: true,
    style: {
      margin: "0",
      transform: "none",
    },
  };

  try {
    let dataUrl: string;
    // 重试机制：如果高清截图失败（可能是 OOM），尝试降低 pixelRatio 重试
    try {
      if (format === "png") {
        dataUrl = await toPng(element, libOptions);
      } else {
        dataUrl = await toJpeg(element, libOptions);
      }
    } catch (firstErr) {
      if (pixelRatio > 1) {
        console.warn(
          "[html-img-pdf] High-res capture failed, retrying with 1x ratio..."
        );
        libOptions.pixelRatio = 1;
        if (format === "png") {
          dataUrl = await toPng(element, libOptions);
        } else {
          dataUrl = await toJpeg(element, libOptions);
        }
      } else {
        throw firstErr;
      }
    }

    return { dataUrl, width, height };
  } catch (error) {
    console.error("[html-img-pdf] Capture failed:", error);
    return null;
  }
}
