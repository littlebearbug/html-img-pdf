/**
 * 深度同步 Form 状态并解决 Radio 冲突
 */
export function syncFormStates(source: HTMLElement, clone: HTMLElement) {
  // 1. Text Inputs & Textarea
  const srcInputs = source.querySelectorAll("input, textarea");
  const cloneInputs = clone.querySelectorAll("input, textarea");

  srcInputs.forEach((src, i) => {
    const dst = cloneInputs[i] as HTMLInputElement | HTMLTextAreaElement;
    if (!dst) return;

    // 必须显式设置 attribute，否则 html-to-image 可能会遗漏
    if (src.tagName === "TEXTAREA") {
      dst.innerHTML = (src as HTMLTextAreaElement).value;
      dst.value = (src as HTMLTextAreaElement).value;
    } else {
      dst.setAttribute("value", (src as HTMLInputElement).value);
      dst.value = (src as HTMLInputElement).value;
    }
  });

  // 2. Select
  const srcSelects = source.querySelectorAll("select");
  const cloneSelects = clone.querySelectorAll("select");
  srcSelects.forEach((src, i) => {
    const dst = cloneSelects[i];
    if (dst) {
      dst.value = src.value;
      const option = dst.querySelector(`option[value="${src.value}"]`);
      if (option) option.setAttribute("selected", "true");
    }
  });

  // 3. Checkbox & Radio (关键修复：Radio Name Isolation)
  const srcChecks = source.querySelectorAll(
    "input[type=checkbox], input[type=radio]"
  );
  const cloneChecks = clone.querySelectorAll(
    "input[type=checkbox], input[type=radio]"
  );

  // 生成一个随机后缀，防止克隆的 radio 组与原始页面冲突
  const uniqueSuffix = Math.random().toString(36).substring(7);

  srcChecks.forEach((src, i) => {
    const dst = cloneChecks[i] as HTMLInputElement;
    const srcInput = src as HTMLInputElement;

    if (!dst) return;

    if (srcInput.type === "radio" && srcInput.name) {
      // 修改 name，使克隆的 radio 形成独立的组
      dst.name = `${srcInput.name}__pdf_${uniqueSuffix}`;
    }

    dst.checked = srcInput.checked;
    if (srcInput.checked) {
      dst.setAttribute("checked", "checked");
    }
  });
}

/**
 * 复制 Canvas (修复：增加容错)
 */
export function copyCanvasContent(source: HTMLElement, clone: HTMLElement) {
  const srcCanvases = source.querySelectorAll("canvas");
  const cloneCanvases = clone.querySelectorAll("canvas");

  srcCanvases.forEach((src, i) => {
    const dst = cloneCanvases[i];
    if (!dst) return;

    try {
      // 避免宽高为 0 导致报错
      if (src.width > 0 && src.height > 0) {
        dst.width = src.width;
        dst.height = src.height;
        const ctx = dst.getContext("2d");
        if (ctx) ctx.drawImage(src, 0, 0);
      }
    } catch (e) {
      console.warn("[html-img-pdf] Failed to copy canvas:", e);
    }
  });
}

/**
 * 视频转图片 (修复：检查 readyState)
 */
export function convertVideoToImage(source: HTMLElement, clone: HTMLElement) {
  const srcVideos = source.querySelectorAll("video");
  const cloneVideos = clone.querySelectorAll("video");

  srcVideos.forEach((video, i) => {
    const cloneVideo = cloneVideos[i];
    if (!cloneVideo) return;

    // 如果视频没加载数据，直接跳过
    if (video.readyState < 2) return;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || video.clientWidth;
      canvas.height = video.videoHeight || video.clientHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = document.createElement("img");
        img.src = canvas.toDataURL("image/png");
        img.style.cssText = "width:100%; height:100%; object-fit:contain;";

        if (cloneVideo.parentNode) {
          cloneVideo.parentNode.replaceChild(img, cloneVideo);
        }
      }
    } catch (e) {
      // 跨域视频可能会导致 tainted canvas，忽略错误
    }
  });
}

/**
 * 滚动展开 (修复：处理 max-height)
 */
export function expandScrollableElements(clone: HTMLElement) {
  const elements = clone.querySelectorAll("*");
  elements.forEach((el) => {
    const style = window.getComputedStyle(el);
    if (
      ["auto", "scroll"].includes(style.overflowY) ||
      ["auto", "scroll"].includes(style.overflow)
    ) {
      const element = el as HTMLElement;
      element.style.setProperty("overflow", "visible", "important");
      element.style.setProperty("overflow-y", "visible", "important");
      element.style.setProperty("height", "auto", "important");
      element.style.setProperty("max-height", "none", "important"); // 关键修复
    }
  });
}

export function createEnhancedClone(
  source: HTMLElement,
  onClone?: (el: HTMLElement) => void
): { sandbox: HTMLElement; clone: HTMLElement } {
  const sandbox = document.createElement("div");

  // 1. 样式隔离与上下文继承
  // 复制 body 的关键样式，防止克隆体失去字体等上下文
  const bodyStyle = window.getComputedStyle(document.body);
  sandbox.style.cssText = `
    position: absolute; 
    top: -10000px; 
    left: -10000px;
    opacity: 0;
    pointer-events: none;
    width: ${source.clientWidth}px; 
    font-family: ${bodyStyle.fontFamily};
    font-size: ${bodyStyle.fontSize};
    color: ${bodyStyle.color};
    line-height: ${bodyStyle.lineHeight};
    text-align: ${bodyStyle.textAlign};
    z-index: -999999;
  `;

  const clone = source.cloneNode(true) as HTMLElement;

  sandbox.appendChild(clone);
  document.body.appendChild(sandbox);

  try {
    syncFormStates(source, clone);
    copyCanvasContent(source, clone);
    convertVideoToImage(source, clone);
    expandScrollableElements(clone);
    if (onClone) onClone(clone);
  } catch (e) {
    console.error("[html-img-pdf] Clone enhancement error:", e);
  }

  return { sandbox, clone };
}

export function destroySandbox(sandbox: HTMLElement) {
  if (document.body.contains(sandbox)) {
    document.body.removeChild(sandbox);
  }
}
