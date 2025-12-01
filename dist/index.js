"use strict";var E=Object.defineProperty;var F=Object.getOwnPropertyDescriptor;var N=Object.getOwnPropertyNames;var $=Object.prototype.hasOwnProperty;var D=(e,l)=>{for(var a in l)E(e,a,{get:l[a],enumerable:!0})},O=(e,l,a,o)=>{if(l&&typeof l=="object"||typeof l=="function")for(let t of N(l))!$.call(e,t)&&t!==a&&E(e,t,{get:()=>l[t],enumerable:!(o=F(l,t))||o.enumerable});return e};var z=e=>O(E({},"__esModule",{value:!0}),e);var X={};D(X,{htmlToPdf:()=>B});module.exports=z(X);var b=require("jspdf");function U(e,l){let a=e.querySelectorAll("input, textarea"),o=l.querySelectorAll("input, textarea");a.forEach((r,f)=>{let p=o[f];p&&(r.tagName==="TEXTAREA"?(p.innerHTML=r.value,p.value=r.value):(p.setAttribute("value",r.value),p.value=r.value))});let t=e.querySelectorAll("select"),s=l.querySelectorAll("select");t.forEach((r,f)=>{let p=s[f];if(p){p.value=r.value;let m=p.querySelector(`option[value="${r.value}"]`);m&&m.setAttribute("selected","true")}});let n=e.querySelectorAll("input[type=checkbox], input[type=radio]"),i=l.querySelectorAll("input[type=checkbox], input[type=radio]"),c=Math.random().toString(36).substring(7);n.forEach((r,f)=>{let p=i[f],m=r;p&&(m.type==="radio"&&m.name&&(p.name=`${m.name}__pdf_${c}`),p.checked=m.checked,m.checked&&p.setAttribute("checked","checked"))})}function W(e,l){let a=e.querySelectorAll("canvas"),o=l.querySelectorAll("canvas");a.forEach((t,s)=>{let n=o[s];if(n)try{if(t.width>0&&t.height>0){n.width=t.width,n.height=t.height;let i=n.getContext("2d");i&&i.drawImage(t,0,0)}}catch(i){console.warn("[html-img-pdf] Failed to copy canvas:",i)}})}function _(e,l){let a=e.querySelectorAll("video"),o=l.querySelectorAll("video");a.forEach((t,s)=>{let n=o[s];if(n&&!(t.readyState<2))try{let i=document.createElement("canvas");i.width=t.videoWidth||t.clientWidth,i.height=t.videoHeight||t.clientHeight;let c=i.getContext("2d");if(c){c.drawImage(t,0,0,i.width,i.height);let r=document.createElement("img");r.src=i.toDataURL("image/png"),r.style.cssText="width:100%; object-fit:contain;",n.parentNode&&n.parentNode.replaceChild(r,n)}}catch{}})}function j(e){e.querySelectorAll("*").forEach(a=>{let o=window.getComputedStyle(a);if(["auto","scroll"].includes(o.overflowY)||["auto","scroll"].includes(o.overflow)){let t=a;t.style.setProperty("overflow","visible","important"),t.style.setProperty("overflow-y","visible","important"),t.style.setProperty("height","auto","important"),t.style.setProperty("max-height","none","important")}})}function H(e,l){let{onClone:a,autoScroll:o=!0,debug:t=!1}=l,s=document.createElement("div"),n=window.getComputedStyle(document.body),i=`
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
      `,s.style.cssText=i,s.id="html-img-pdf-sandbox",t){let r=document.createElement("button");r.textContent="\u2715",r.style.cssText=`
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
    `,r.onclick=()=>T(s),s.appendChild(r)}let c=e.cloneNode(!0);s.appendChild(c),document.body.appendChild(s);try{U(e,c),W(e,c),_(e,c),o&&j(c),a&&a(c,s)}catch(r){console.error("[html-img-pdf] Clone enhancement error:",r)}return{sandbox:s,clone:c}}function T(e){document.body.contains(e)&&document.body.removeChild(e)}async function L(e){try{await document.fonts.ready}catch{}let a=Array.from(e.querySelectorAll("img")).map(o=>(o.getAttribute("loading")==="lazy"&&o.setAttribute("loading","eager"),o.complete||!o.src?Promise.resolve():new Promise(t=>{o.onload=()=>t(),o.onerror=()=>t(),setTimeout(()=>t(),2e3)})));await Promise.all(a),await new Promise(o=>setTimeout(o,100))}var y=require("html-to-image"),M=16e3;async function A(e,l){let{format:a,quality:o,backgroundColor:t,pixelRatio:s}=l,n=e.offsetWidth,i=e.offsetHeight;if(n===0||i===0)return null;if(n>M||i>M)return console.error(`[html-img-pdf] Element too large (${n}x${i}). Skipped to prevent crash.`),null;let c={quality:o,backgroundColor:t,pixelRatio:s,width:n,height:i,cacheBust:!0,style:{margin:"0",transform:"none"}};try{let r;try{a==="png"?r=await(0,y.toPng)(e,c):r=await(0,y.toJpeg)(e,c)}catch(f){if(s>1)console.warn("[html-img-pdf] High-res capture failed, retrying with 1x ratio..."),c.pixelRatio=1,a==="png"?r=await(0,y.toPng)(e,c):r=await(0,y.toJpeg)(e,c);else throw f}return{dataUrl:r,width:n,height:i}}catch(r){return console.error("[html-img-pdf] Capture failed:",r),null}}async function V(e,l){let a=[];for(let o=0;o<e.length;o+=l){let t=e.slice(o,o+l),s=await Promise.all(t.map(n=>n()));a.push(...s)}return a}async function B(e,l={}){let{fileName:a="document.pdf",imageFormat:o="png",quality:t=.95,backgroundColor:s="#ffffff",pageSize:n="auto",pageOrientation:i,multipage:c=!1,pixelRatio:r=window.devicePixelRatio||2,concurrency:f=3,debug:p=!1,autoScroll:m=!0,onClone:P}=l,{sandbox:k,clone:w}=H(e,{onClone:P,autoScroll:m,debug:p});try{await L(w);let h=[];c?(h=Array.from(w.children).filter(d=>d.nodeType===Node.ELEMENT_NODE),h.length===0&&(h=[w])):h=[w];let q=h.map(d=>()=>A(d,{format:o,quality:t,backgroundColor:s,pixelRatio:r})),v=(await V(q,f)).filter(d=>d!==null);if(v.length===0)return console.warn("[html-img-pdf] No content captured."),new b.jsPDF;let u=null;for(let d of v)if(n==="auto"){let x=i==="portrait"||i==="landscape"?i==="portrait"?"p":"l":d.width>d.height?"l":"p",g=[d.width,d.height];u?u.addPage(g,x):u=new b.jsPDF({orientation:x,unit:"px",format:g}),u.addImage(d.dataUrl,o.toUpperCase(),0,0,d.width,d.height)}else{let x=i||"portrait",g;x==="auto"?g=d.width>d.height?"l":"p":g=x==="landscape"?"l":"p";let C=typeof n=="string"?n:[n.width,n.height];u?u.addPage(C,g):u=new b.jsPDF({orientation:g,unit:"pt",format:C});let S=u.internal.pageSize.getWidth(),R=S/d.width,I=d.height*R;u.addImage(d.dataUrl,o.toUpperCase(),0,0,S,I)}if(!u)throw new Error("PDF generation failed: No pages rendered.");return p?console.log("[html-img-pdf] Debug mode: PDF generated but not saved. Check the sandbox on screen."):u.save(a),u}catch(h){throw console.error("[html-img-pdf] Export failed:",h),h}finally{p||T(k)}}0&&(module.exports={htmlToPdf});
//# sourceMappingURL=index.js.map