"use strict";var D=Object.create;var E=Object.defineProperty;var $=Object.getOwnPropertyDescriptor;var _=Object.getOwnPropertyNames;var j=Object.getPrototypeOf,z=Object.prototype.hasOwnProperty;var V=(e,n)=>{for(var i in n)E(e,i,{get:n[i],enumerable:!0})},A=(e,n,i,s)=>{if(n&&typeof n=="object"||typeof n=="function")for(let t of _(n))!z.call(e,t)&&t!==i&&E(e,t,{get:()=>n[t],enumerable:!(s=$(n,t))||s.enumerable});return e};var H=(e,n,i)=>(i=e!=null?D(j(e)):{},A(n||!e||!e.__esModule?E(i,"default",{value:e,enumerable:!0}):i,e)),X=e=>A(E({},"__esModule",{value:!0}),e);var K={};V(K,{htmlToPdf:()=>G});module.exports=X(K);function U(e,n){let i=e.querySelectorAll("input, textarea"),s=n.querySelectorAll("input, textarea");i.forEach((l,f)=>{let c=s[f];c&&(l.tagName==="TEXTAREA"?(c.innerHTML=l.value,c.value=l.value):(c.setAttribute("value",l.value),c.value=l.value))});let t=e.querySelectorAll("select"),a=n.querySelectorAll("select");t.forEach((l,f)=>{let c=a[f];if(c){c.value=l.value;let d=c.querySelector(`option[value="${l.value}"]`);d&&d.setAttribute("selected","true")}});let r=e.querySelectorAll("input[type=checkbox], input[type=radio]"),o=n.querySelectorAll("input[type=checkbox], input[type=radio]"),p=Math.random().toString(36).substring(7);r.forEach((l,f)=>{let c=o[f],d=l;c&&(d.type==="radio"&&d.name&&(c.name=`${d.name}__pdf_${p}`),c.checked=d.checked,d.checked&&c.setAttribute("checked","checked"))})}function W(e,n){let i=e.querySelectorAll("canvas"),s=n.querySelectorAll("canvas");i.forEach((t,a)=>{let r=s[a];if(r)try{if(t.width>0&&t.height>0){r.width=t.width,r.height=t.height;let o=r.getContext("2d");o&&o.drawImage(t,0,0)}}catch(o){console.warn("[html-img-pdf] Failed to copy canvas:",o)}})}function B(e,n){let i=e.querySelectorAll("video"),s=n.querySelectorAll("video");i.forEach((t,a)=>{let r=s[a];if(r&&!(t.readyState<2))try{let o=document.createElement("canvas");o.width=t.videoWidth||t.clientWidth,o.height=t.videoHeight||t.clientHeight;let p=o.getContext("2d");if(p){p.drawImage(t,0,0,o.width,o.height);let l=document.createElement("img");l.src=o.toDataURL("image/png"),l.style.cssText="width:100%; object-fit:contain;",r.parentNode&&r.parentNode.replaceChild(l,r)}}catch{}})}function J(e){e.querySelectorAll("*").forEach(i=>{let s=window.getComputedStyle(i);if(["auto","scroll"].includes(s.overflowY)||["auto","scroll"].includes(s.overflow)){let t=i;t.style.setProperty("overflow","visible","important"),t.style.setProperty("overflow-y","visible","important"),t.style.setProperty("height","auto","important"),t.style.setProperty("max-height","none","important")}})}function M(e,n){let{onClone:i,autoScroll:s=!0,debug:t=!1}=n,a=document.createElement("div"),r=window.getComputedStyle(document.body),o=`
    position: fixed; 
    width: ${e.clientWidth}px; 
    font-family: ${r.fontFamily};
    font-size: ${r.fontSize};
    color: ${r.color};
    line-height: ${r.lineHeight};
    text-align: ${r.textAlign};
  `;if(t?(console.log("[html-img-pdf] Debug mode active: Sandbox is visible."),o+=`
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
      `,a.style.cssText=o,a.id="html-img-pdf-sandbox",t){let l=document.createElement("button");l.textContent="\u2715",l.style.cssText=`
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
    `,l.onclick=()=>T(a),a.appendChild(l)}let p=e.cloneNode(!0);a.appendChild(p),document.body.appendChild(a);try{U(e,p),W(e,p),B(e,p),s&&J(p),i&&i(p,a)}catch(l){console.error("[html-img-pdf] Clone enhancement error:",l)}return{sandbox:a,clone:p}}function T(e){document.body.contains(e)&&document.body.removeChild(e)}async function L(e,n=2e3){try{await document.fonts.ready}catch{}let s=Array.from(e.querySelectorAll("img")).map(t=>(t.getAttribute("loading")==="lazy"&&t.setAttribute("loading","eager"),t.complete||!t.src?Promise.resolve():new Promise(a=>{t.onload=()=>a(),t.onerror=()=>a(),setTimeout(()=>a(),n)})));await Promise.all(s),await new Promise(t=>setTimeout(t,100))}async function P(e,n){let{format:i,quality:s,backgroundColor:t,pixelRatio:a,ignoreElements:r}=n,o=e.offsetWidth,p=e.offsetHeight;if(o===0||p===0)return null;if(o>16e3||p>16e3)return console.error(`[html-img-pdf] Element too large (${o}x${p}). Skipped to prevent crash.`),null;let{toPng:l,toJpeg:f}=await import("html-to-image"),c={quality:s,backgroundColor:t,pixelRatio:a,width:o,height:p,cacheBust:!0,style:{margin:"0",transform:"none"},filter:r};try{let d;try{i==="png"?d=await l(e,c):d=await f(e,c)}catch(w){if(a>1)console.warn("[html-img-pdf] High-res capture failed, retrying with 1x ratio..."),c.pixelRatio=1,i==="png"?d=await l(e,c):d=await f(e,c);else throw w}return{dataUrl:d,width:o,height:p}}catch(d){return console.error("[html-img-pdf] Capture failed:",d),null}}async function Y(e,n,i){let s=[],t=e.length,a=0;for(let r=0;r<t;r+=n){let o=e.slice(r,r+n),p=await Promise.all(o.map(l=>l()));s.push(...p),a+=o.length,i&&i(Math.round(a/t*100),a,t)}return s}async function G(e,n={}){let{fileName:i="document.pdf",imageFormat:s="png",quality:t=.95,backgroundColor:a="#ffffff",pageSize:r="auto",pageOrientation:o,multipage:p=!1,pixelRatio:l=window.devicePixelRatio||2,concurrency:f=3,debug:c=!1,autoScroll:d=!0,onClone:w,onProgress:k,resourceTimeout:q=2e3,ignoreElements:I}=n,{sandbox:R,clone:x}=M(e,{onClone:w,autoScroll:d,debug:c});try{await L(x,q);let h=[];p?(h=Array.from(x.children).filter(u=>u.nodeType===Node.ELEMENT_NODE),h.length===0&&(h=[x])):h=[x];let F=h.map(u=>()=>P(u,{format:s,quality:t,backgroundColor:a,pixelRatio:l,ignoreElements:I})),v=(await Y(F,f,k)).filter(u=>u!==null),{jsPDF:b}=await import("jspdf");if(v.length===0)return console.warn("[html-img-pdf] No content captured."),new b;let m=null;for(let u of v)if(r==="auto"){let y=o==="portrait"||o==="landscape"?o==="portrait"?"p":"l":u.width>u.height?"l":"p",g=[u.width,u.height];m?m.addPage(g,y):m=new b({orientation:y,unit:"px",format:g}),m.addImage(u.dataUrl,s.toUpperCase(),0,0,u.width,u.height)}else{let y=o||"portrait",g;y==="auto"?g=u.width>u.height?"l":"p":g=y==="landscape"?"l":"p";let C=typeof r=="string"?r:[r.width,r.height];m?m.addPage(C,g):m=new b({orientation:g,unit:"pt",format:C});let S=m.internal.pageSize.getWidth(),N=S/u.width,O=u.height*N;m.addImage(u.dataUrl,s.toUpperCase(),0,0,S,O)}if(!m)throw new Error("PDF generation failed: No pages rendered.");return c?console.log("[html-img-pdf] Debug mode: PDF generated but not saved. Check the sandbox on screen."):m.save(i),m}catch(h){throw console.error("[html-img-pdf] Export failed:",h),h}finally{c||T(R)}}0&&(module.exports={htmlToPdf});
//# sourceMappingURL=index.js.map