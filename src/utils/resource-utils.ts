export async function waitForResources(element: HTMLElement): Promise<void> {
  // 1. 字体
  try {
    await document.fonts.ready;
  } catch (e) {
    // 忽略旧浏览器错误
  }

  // 2. 图片
  const imgs = Array.from(element.querySelectorAll("img"));
  const promises = imgs.map((img) => {
    // 如果有 loading="lazy"，将其改为 eager 以便立即加载
    if (img.getAttribute("loading") === "lazy") {
      img.setAttribute("loading", "eager");
    }

    if (img.complete) return Promise.resolve();
    if (!img.src) return Promise.resolve();

    return new Promise<void>((resolve) => {
      // 成功或失败都 resolve，防止死锁
      img.onload = () => resolve();
      img.onerror = () => resolve();
      // 超时保护：如果图片 2秒内没加载完，强行继续
      setTimeout(() => resolve(), 2000);
    });
  });

  await Promise.all(promises);

  // 3. 额外缓冲，等待布局重排
  await new Promise((r) => setTimeout(r, 100));
}
