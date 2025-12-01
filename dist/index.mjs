import{jsPDF as b}from"jspdf";function F(e,c){let l=e.querySelectorAll("input, textarea"),o=c.querySelectorAll("input, textarea");l.forEach((r,f)=>{let p=o[f];p&&(r.tagName==="TEXTAREA"?(p.innerHTML=r.value,p.value=r.value):(p.setAttribute("value",r.value),p.value=r.value))});let t=e.querySelectorAll("select"),a=c.querySelectorAll("select");t.forEach((r,f)=>{let p=a[f];if(p){p.value=r.value;let m=p.querySelector(`option[value="${r.value}"]`);m&&m.setAttribute("selected","true")}});let n=e.querySelectorAll("input[type=checkbox], input[type=radio]"),i=c.querySelectorAll("input[type=checkbox], input[type=radio]"),s=Math.random().toString(36).substring(7);n.forEach((r,f)=>{let p=i[f],m=r;p&&(m.type==="radio"&&m.name&&(p.name=`${m.name}__pdf_${s}`),p.checked=m.checked,m.checked&&p.setAttribute("checked","checked"))})}function N(e,c){let l=e.querySelectorAll("canvas"),o=c.querySelectorAll("canvas");l.forEach((t,a)=>{let n=o[a];if(n)try{if(t.width>0&&t.height>0){n.width=t.width,n.height=t.height;let i=n.getContext("2d");i&&i.drawImage(t,0,0)}}catch(i){console.warn("[html-img-pdf] Failed to copy canvas:",i)}})}function $(e,c){let l=e.querySelectorAll("video"),o=c.querySelectorAll("video");l.forEach((t,a)=>{let n=o[a];if(n&&!(t.readyState<2))try{let i=document.createElement("canvas");i.width=t.videoWidth||t.clientWidth,i.height=t.videoHeight||t.clientHeight;let s=i.getContext("2d");if(s){s.drawImage(t,0,0,i.width,i.height);let r=document.createElement("img");r.src=i.toDataURL("image/png"),r.style.cssText="width:100%; object-fit:contain;",n.parentNode&&n.parentNode.replaceChild(r,n)}}catch{}})}function D(e){e.querySelectorAll("*").forEach(l=>{let o=window.getComputedStyle(l);if(["auto","scroll"].includes(o.overflowY)||["auto","scroll"].includes(o.overflow)){let t=l;t.style.setProperty("overflow","visible","important"),t.style.setProperty("overflow-y","visible","important"),t.style.setProperty("height","auto","important"),t.style.setProperty("max-height","none","important")}})}function C(e,c){let{onClone:l,autoScroll:o=!0,debug:t=!1}=c,a=document.createElement("div"),n=window.getComputedStyle(document.body),i=`
    position: fixed; 
    width: ${e.clientWidth}px; 
    font-family: ${n.fontFamily};
    font-size: ${n.fontSize};
    color: ${n.color};
    line-height: ${n.lineHeight};
    text-align: ${n.textAlign};
  `;if(t?(console.log("[html-img-pdf] Debug mode active: Sandbox is visible."),i+=`
        top: 20px;
        left: 20px;
        z-index: 99999;
        background: rgba(255, 255, 255, 0.95);
        border: 5px solid red;
        box-shadow: 0 0 20px rgba(0,0,0,0.5);
        pointer-events: auto; /* \u5141\u8BB8\u5BA1\u67E5\u5143\u7D20 */
        overflow: auto;
        max-height: 90vh; /* \u9632\u6B62\u592A\u957F\u8D85\u51FA\u5C4F\u5E55 */
      `):i+=`
        top: -10000px; 
        left: -10000px; 
        z-index: -9999;
        opacity: 0;
        pointer-events: none; /* \u9632\u6B62\u5F71\u54CD\u9875\u9762\u4EA4\u4E92 */
      `,a.style.cssText=i,a.id="html-img-pdf-sandbox",t){let r=document.createElement("button");r.textContent="\u2715",r.style.cssText=`
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
    `,r.onclick=()=>w(a),a.appendChild(r)}let s=e.cloneNode(!0);a.appendChild(s),document.body.appendChild(a);try{F(e,s),N(e,s),$(e,s),o&&D(s),l&&l(s,a)}catch(r){console.error("[html-img-pdf] Clone enhancement error:",r)}return{sandbox:a,clone:s}}function w(e){document.body.contains(e)&&document.body.removeChild(e)}async function S(e){try{await document.fonts.ready}catch{}let l=Array.from(e.querySelectorAll("img")).map(o=>(o.getAttribute("loading")==="lazy"&&o.setAttribute("loading","eager"),o.complete||!o.src?Promise.resolve():new Promise(t=>{o.onload=()=>t(),o.onerror=()=>t(),setTimeout(()=>t(),2e3)})));await Promise.all(l),await new Promise(o=>setTimeout(o,100))}import{toPng as H,toJpeg as L}from"html-to-image";var M=16e3;async function A(e,c){let{format:l,quality:o,backgroundColor:t,pixelRatio:a}=c,n=e.offsetWidth,i=e.offsetHeight;if(n===0||i===0)return null;if(n>M||i>M)return console.error(`[html-img-pdf] Element too large (${n}x${i}). Skipped to prevent crash.`),null;let s={quality:o,backgroundColor:t,pixelRatio:a,width:n,height:i,cacheBust:!0,style:{margin:"0",transform:"none"}};try{let r;try{l==="png"?r=await H(e,s):r=await L(e,s)}catch(f){if(a>1)console.warn("[html-img-pdf] High-res capture failed, retrying with 1x ratio..."),s.pixelRatio=1,l==="png"?r=await H(e,s):r=await L(e,s);else throw f}return{dataUrl:r,width:n,height:i}}catch(r){return console.error("[html-img-pdf] Capture failed:",r),null}}async function O(e,c){let l=[];for(let o=0;o<e.length;o+=c){let t=e.slice(o,o+c),a=await Promise.all(t.map(n=>n()));l.push(...a)}return l}async function Y(e,c={}){let{fileName:l="document.pdf",imageFormat:o="png",quality:t=.95,backgroundColor:a="#ffffff",pageSize:n="auto",pageOrientation:i,multipage:s=!1,pixelRatio:r=window.devicePixelRatio||2,concurrency:f=3,debug:p=!1,autoScroll:m=!0,onClone:P}=c,{sandbox:k,clone:x}=C(e,{onClone:P,autoScroll:m,debug:p});try{await S(x);let h=[];s?(h=Array.from(x.children).filter(d=>d.nodeType===Node.ELEMENT_NODE),h.length===0&&(h=[x])):h=[x];let q=h.map(d=>()=>A(d,{format:o,quality:t,backgroundColor:a,pixelRatio:r})),E=(await O(q,f)).filter(d=>d!==null);if(E.length===0)return console.warn("[html-img-pdf] No content captured."),new b;let u=null;for(let d of E)if(n==="auto"){let y=i==="portrait"||i==="landscape"?i==="portrait"?"p":"l":d.width>d.height?"l":"p",g=[d.width,d.height];u?u.addPage(g,y):u=new b({orientation:y,unit:"px",format:g}),u.addImage(d.dataUrl,o.toUpperCase(),0,0,d.width,d.height)}else{let y=i||"portrait",g;y==="auto"?g=d.width>d.height?"l":"p":g=y==="landscape"?"l":"p";let T=typeof n=="string"?n:[n.width,n.height];u?u.addPage(T,g):u=new b({orientation:g,unit:"pt",format:T});let v=u.internal.pageSize.getWidth(),R=v/d.width,I=d.height*R;u.addImage(d.dataUrl,o.toUpperCase(),0,0,v,I)}if(!u)throw new Error("PDF generation failed: No pages rendered.");return p?console.log("[html-img-pdf] Debug mode: PDF generated but not saved. Check the sandbox on screen."):u.save(l),u}catch(h){throw console.error("[html-img-pdf] Export failed:",h),h}finally{p||w(k)}}export{Y as htmlToPdf};
//# sourceMappingURL=index.mjs.map