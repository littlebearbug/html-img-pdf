function F(t,p){let c=t.querySelectorAll("input, textarea"),s=p.querySelectorAll("input, textarea");c.forEach((r,f)=>{let l=s[f];l&&(r.tagName==="TEXTAREA"?(l.innerHTML=r.value,l.value=r.value):(l.setAttribute("value",r.value),l.value=r.value))});let e=t.querySelectorAll("select"),i=p.querySelectorAll("select");e.forEach((r,f)=>{let l=i[f];if(l){l.value=r.value;let d=l.querySelector(`option[value="${r.value}"]`);d&&d.setAttribute("selected","true")}});let n=t.querySelectorAll("input[type=checkbox], input[type=radio]"),o=p.querySelectorAll("input[type=checkbox], input[type=radio]"),a=Math.random().toString(36).substring(7);n.forEach((r,f)=>{let l=o[f],d=r;l&&(d.type==="radio"&&d.name&&(l.name=`${d.name}__pdf_${a}`),l.checked=d.checked,d.checked&&l.setAttribute("checked","checked"))})}function N(t,p){let c=t.querySelectorAll("canvas"),s=p.querySelectorAll("canvas");c.forEach((e,i)=>{let n=s[i];if(n)try{if(e.width>0&&e.height>0){n.width=e.width,n.height=e.height;let o=n.getContext("2d");o&&o.drawImage(e,0,0)}}catch(o){console.warn("[html-img-pdf] Failed to copy canvas:",o)}})}function O(t,p){let c=t.querySelectorAll("video"),s=p.querySelectorAll("video");c.forEach((e,i)=>{let n=s[i];if(n&&!(e.readyState<2))try{let o=document.createElement("canvas");o.width=e.videoWidth||e.clientWidth,o.height=e.videoHeight||e.clientHeight;let a=o.getContext("2d");if(a){a.drawImage(e,0,0,o.width,o.height);let r=document.createElement("img");r.src=o.toDataURL("image/png"),r.style.cssText="width:100%; object-fit:contain;",n.parentNode&&n.parentNode.replaceChild(r,n)}}catch{}})}function D(t){t.querySelectorAll("*").forEach(c=>{let s=window.getComputedStyle(c);if(["auto","scroll"].includes(s.overflowY)||["auto","scroll"].includes(s.overflow)){let e=c;e.style.setProperty("overflow","visible","important"),e.style.setProperty("overflow-y","visible","important"),e.style.setProperty("height","auto","important"),e.style.setProperty("max-height","none","important")}})}function S(t,p){let{onClone:c,autoScroll:s=!0,debug:e=!1}=p,i=document.createElement("div"),n=window.getComputedStyle(document.body),o=`
    position: fixed; 
    width: ${t.clientWidth}px; 
    font-family: ${n.fontFamily};
    font-size: ${n.fontSize};
    color: ${n.color};
    line-height: ${n.lineHeight};
    text-align: ${n.textAlign};
  `;if(e?(console.log("[html-img-pdf] Debug mode active: Sandbox is visible."),o+=`
        top: 20px;
        left: 20px;
        z-index: 99999;
        background: rgba(255, 255, 255, 0.95);
        border: 5px solid red;
        box-shadow: 0 0 20px rgba(0,0,0,0.5);
        pointer-events: auto; /* \u5141\u8BB8\u5BA1\u67E5\u5143\u7D20 */
        overflow: auto;
        max-height: 90vh; /* \u9632\u6B62\u592A\u957F\u8D85\u51FA\u5C4F\u5E55 */
      `):o+=`
        top: -10000px; 
        left: -10000px; 
        z-index: -9999;
        opacity: 0;
        pointer-events: none; /* \u9632\u6B62\u5F71\u54CD\u9875\u9762\u4EA4\u4E92 */
      `,i.style.cssText=o,i.id="html-img-pdf-sandbox",e){let r=document.createElement("button");r.textContent="\u2715",r.style.cssText=`
      position: absolute;
      top: 0;
      right: 0;
      z-index: 100000;
      width: 40px;
      height: 40px;
      padding: 10px;
      background: transparent;
      color: black;
      border: none;
      font-weight: bold;
      cursor: pointer;
      text-align: center;
      outline: none;
    `,r.onclick=()=>b(i),i.appendChild(r)}let a=t.cloneNode(!0);i.appendChild(a),document.body.appendChild(i);try{F(t,a),N(t,a),O(t,a),s&&D(a),c&&c(a,i)}catch(r){console.error("[html-img-pdf] Clone enhancement error:",r)}return{sandbox:i,clone:a}}function b(t){document.body.contains(t)&&document.body.removeChild(t)}async function A(t,p=2e3){try{await document.fonts.ready}catch{}let s=Array.from(t.querySelectorAll("img")).map(e=>(e.getAttribute("loading")==="lazy"&&e.setAttribute("loading","eager"),e.complete||!e.src?Promise.resolve():new Promise(i=>{e.onload=()=>i(),e.onerror=()=>i(),setTimeout(()=>i(),p)})));await Promise.all(s),await new Promise(e=>setTimeout(e,100))}async function H(t,p){let{format:c,quality:s,backgroundColor:e,pixelRatio:i,ignoreElements:n}=p,o=t.offsetWidth,a=t.offsetHeight;if(o===0||a===0)return null;if(o>16e3||a>16e3)return console.error(`[html-img-pdf] Element too large (${o}x${a}). Skipped to prevent crash.`),null;let{toPng:r,toJpeg:f}=await import("html-to-image"),l={quality:s,backgroundColor:e,pixelRatio:i,width:o,height:a,cacheBust:!0,style:{margin:"0",transform:"none"},filter:n};try{let d;try{c==="png"?d=await r(t,l):d=await f(t,l)}catch(E){if(i>1)console.warn("[html-img-pdf] High-res capture failed, retrying with 1x ratio..."),l.pixelRatio=1,c==="png"?d=await r(t,l):d=await f(t,l);else throw E}return{dataUrl:d,width:o,height:a}}catch(d){return console.error("[html-img-pdf] Capture failed:",d),null}}async function $(t,p,c){let s=[],e=t.length,i=0;for(let n=0;n<e;n+=p){let o=t.slice(n,n+p),a=await Promise.all(o.map(r=>r()));s.push(...a),i+=o.length,c&&c(Math.round(i/e*100),i,e)}return s}async function B(t,p={}){let{fileName:c="document.pdf",imageFormat:s="png",quality:e=.95,backgroundColor:i="#ffffff",pageSize:n="auto",pageOrientation:o,multipage:a=!1,pixelRatio:r=window.devicePixelRatio||2,concurrency:f=3,debug:l=!1,autoScroll:d=!0,onClone:E,onProgress:M,resourceTimeout:L=2e3,ignoreElements:P}=p,{sandbox:k,clone:x}=S(t,{onClone:E,autoScroll:d,debug:l});try{await A(x,L);let h=[];a?(h=Array.from(x.children).filter(u=>u.nodeType===Node.ELEMENT_NODE),h.length===0&&(h=[x])):h=[x];let q=h.map(u=>()=>H(u,{format:s,quality:e,backgroundColor:i,pixelRatio:r,ignoreElements:P})),T=(await $(q,f,M)).filter(u=>u!==null),{jsPDF:w}=await import("jspdf");if(T.length===0)return console.warn("[html-img-pdf] No content captured."),new w;let m=null;for(let u of T)if(n==="auto"){let y=o==="portrait"||o==="landscape"?o==="portrait"?"p":"l":u.width>u.height?"l":"p",g=[u.width,u.height];m?m.addPage(g,y):m=new w({orientation:y,unit:"px",format:g}),m.addImage(u.dataUrl,s.toUpperCase(),0,0,u.width,u.height)}else{let y=o||"portrait",g;y==="auto"?g=u.width>u.height?"l":"p":g=y==="landscape"?"l":"p";let v=typeof n=="string"?n:[n.width,n.height];m?m.addPage(v,g):m=new w({orientation:g,unit:"pt",format:v});let C=m.internal.pageSize.getWidth(),I=C/u.width,R=u.height*I;m.addImage(u.dataUrl,s.toUpperCase(),0,0,C,R)}if(!m)throw new Error("PDF generation failed: No pages rendered.");return l?console.log("[html-img-pdf] Debug mode: PDF generated but not saved. Check the sandbox on screen."):m.save(c),m}catch(h){throw console.error("[html-img-pdf] Export failed:",h),h}finally{l||b(k)}}export{B as htmlToPdf};
//# sourceMappingURL=index.mjs.map