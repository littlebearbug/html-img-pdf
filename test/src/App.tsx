import { useRef, useState } from "react";
import { htmlToPdf } from "html-img-pdf";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const handleExport = async (multipage: boolean) => {
    if (!contentRef.current) return;
    setLoading(true);
    try {
      await htmlToPdf(contentRef.current, {
        fileName: multipage ? "multipage-test.pdf" : "singlepage-test.pdf",
        multipage: multipage,
        pageSize: multipage ? "a4" : "auto",
        imageFormat: "jpeg",
        quality: 0.9,
        concurrency: 3, // 测试并发
        pixelRatio: 2, // 测试高清
        autoScroll: false,
        debug: true,
        onClone: (doc) => {
          console.log("Clone created for debugging:", doc);
        },
      });
    } catch (e) {
      console.error(e);
      alert("导出失败，请看控制台");
    } finally {
      setLoading(false);
    }
  };

  // --- 测试数据配置 ---
  const chartData = {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    datasets: [
      {
        label: "# of Votes",
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "Arial, sans-serif",
        background: "#f0f0f0",
      }}
    >
      <div
        style={{
          marginBottom: 20,
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "#eee",
          padding: 10,
        }}
      >
        <h1>HTML-IMG-PDF 压力测试面板</h1>
        <div style={{ gap: 10, display: "flex" }}>
          <button
            disabled={loading}
            onClick={() => handleExport(false)}
            style={{ padding: "10px 20px" }}
          >
            {loading ? "处理中..." : "导出长图 (Auto Size)"}
          </button>
          <button
            disabled={loading}
            onClick={() => handleExport(true)}
            style={{ padding: "10px 20px" }}
          >
            {loading ? "处理中..." : "导出多页 (A4)"}
          </button>
        </div>
      </div>

      {/* --- 核心测试区域 --- */}
      <div
        ref={contentRef}
        style={{
          background: "white",
          width: "794px", // 模拟 A4 宽度
          margin: "0 auto",
          minHeight: "100vh",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        {/* Page 1: 复杂表单与 Canvas */}
        <div
          className="pdf-page"
          style={{ padding: 40, borderBottom: "2px dashed #ccc" }}
        >
          <h2 style={{ color: "navy" }}>1. Canvas 与 表单还原测试</h2>

          <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
            <div style={{ flex: 1, border: "1px solid #ddd", padding: 10 }}>
              <h4>Canvas (Chart.js)</h4>
              {/* 这个组件内部是一个 Canvas，测试能否被 copyCanvasContent 捕获 */}
              <Bar data={chartData} />
            </div>

            <div style={{ flex: 1, border: "1px solid #ddd", padding: 10 }}>
              <h4>Form States</h4>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <input
                  type="text"
                  defaultValue="测试文本输入值保留"
                  placeholder="Text Input"
                />
                <textarea
                  defaultValue="测试 Textarea 内容保留&#10;换行也能保留吗？"
                  rows={3}
                ></textarea>

                <label>
                  <input type="checkbox" defaultChecked /> 选中状态测试
                </label>

                <div style={{ background: "#eef", padding: 5 }}>
                  <p style={{ margin: 0, fontSize: 12 }}>
                    Radio Group A (测试冲突)
                  </p>
                  <label>
                    <input type="radio" name="groupA" defaultChecked /> Option 1
                  </label>
                  <label>
                    <input type="radio" name="groupA" /> Option 2
                  </label>
                </div>

                <select defaultValue="b">
                  <option value="a">Option A</option>
                  <option value="b">Option B (Selected)</option>
                  <option value="c">Option C</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Page 2: 滚动溢出与视频 */}
        <div
          className="pdf-page"
          style={{ padding: 40, borderBottom: "2px dashed #ccc" }}
        >
          <h2 style={{ color: "darkred" }}>2. 滚动展开 & 视频截图</h2>

          <div style={{ display: "flex", gap: 20 }}>
            {/* Scroll Testing */}
            <div style={{ flex: 1 }}>
              <h4>内部滚动区域 (Overflow: auto)</h4>
              <p style={{ fontSize: 12, color: "#666" }}>
                导出时应自动展开全部内容，不显示滚动条。
              </p>
              <div
                style={{
                  height: "150px",
                  overflowY: "auto",
                  border: "2px solid red",
                  padding: 10,
                  background: "#fff0f0",
                }}
              >
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    style={{ padding: "5px 0", borderBottom: "1px solid #eee" }}
                  >
                    滚动列表项 Item #{i + 1} - 只有展开才能看到我
                  </div>
                ))}
              </div>
            </div>

            {/* Video Testing */}
            <div style={{ flex: 1 }}>
              <h4>Video 标签 (转 Image)</h4>
              <video
                controls
                width="100%"
                src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
                crossOrigin="anonymous"
                style={{ borderRadius: 8 }}
              />
              <p style={{ fontSize: 12 }}>
                PDF中应显示视频当前帧截图，而非空白或黑块。
              </p>
            </div>
          </div>
        </div>

        {/* Page 3: 图片加载与布局 */}
        <div className="pdf-page" style={{ padding: 40 }}>
          <h2 style={{ color: "green" }}>3. 外部资源与排版</h2>
          <div
            style={{
              float: "left",
              width: "150px",
              height: "150px",
              margin: "0 20px 10px 0",
              background: "#333",
            }}
          >
            <img
              src="https://picsum.photos/200/200"
              alt="Random"
              crossOrigin="anonymous"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <p>
            这是一段环绕图片的文字。测试复杂的 CSS
            浮动布局在截图时是否保持原样。 Lorem ipsum dolor sit amet,
            consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua.
            <b>这里有加粗文字</b>，<i>这里有斜体</i>，
            <span style={{ color: "red", textDecoration: "underline" }}>
              这里有红色下划线
            </span>
            。
          </p>
          <p>
            这是为了增加页面长度的占位符...
            <br />
            <br />
            (底部内容)
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
