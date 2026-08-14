import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

/* 探测 Edge（Chromium 内核），找不到则报错提示 */
function findEdge(){
  const cands = [
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files (x86)/Microsoft/Edge Core/Application/msedge.exe'
  ];
  for(const c of cands){ if(fs.existsSync(c)) return c; }
  return null;
}

const EDGE = findEdge();
const htmlPath = path.resolve(process.cwd(), process.argv[2] || '');
const outPath = path.resolve(process.cwd(), process.argv[3] || htmlPath.replace(/\.html?$/i,'')+'.jpg');
let PORT = 9230;

if(!EDGE){ console.error('ERROR: 未找到 Microsoft Edge。请安装 Edge 或把 msedge.exe 路径加入脚本 EDGE 探测列表。'); process.exit(2); }
if(!fs.existsSync(htmlPath)){ console.error('ERROR: 找不到 HTML 文件 ->', htmlPath); process.exit(1); }
// design-assets 缺失（背景图/毛笔字体）提示，避免海报空白无头绪
const daDir = path.join(path.dirname(htmlPath), 'design-assets');
if(!fs.existsSync(daDir)){ console.warn('WARN: 同目录未找到 design-assets/，海报背景图与毛笔字体可能丢失，请从 Skill assets 复制过去。'); }
// 端口被占用则向后探测一个空闲端口
const net = await import('net');
async function freePort(p){ return new Promise(res=>{ const s=net.createServer(); s.once('error',()=>res(freePort(p+1))); s.once('listening',()=>{ s.close(()=>res(p)); }); s.listen(p,'127.0.0.1'); }); }
PORT = await freePort(PORT);

function waitForWS(){
  return new Promise((resolve, reject) => {
    const tryOnce = async () => {
      try {
        const r = await fetch(`http://127.0.0.1:${PORT}/json`);
        const list = await r.json();
        const page = list.find(t => t.type === 'page') || list[0];
        if (page && page.webSocketDebuggerUrl) resolve(page.webSocketDebuggerUrl);
        else setTimeout(tryOnce, 200);
      } catch { setTimeout(tryOnce, 200); }
    };
    tryOnce();
    setTimeout(() => reject(new Error('timeout waiting for edge devtools')), 20000);
  });
}

let id = 0; const pending = new Map(); const events = [];

/* 启动 Edge 并等待 DevTools WS 就绪；首启失败/超时自动重试一次 */
async function launchAndConnect(){
  let lastErr;
  for(let attempt=1; attempt<=2; attempt++){
    const proc = spawn(EDGE, ['--headless=new','--no-sandbox','--disable-gpu','--hide-scrollbars','--remote-debugging-port='+PORT], { stdio: 'ignore' });
    try {
      const url = await waitForWS();
      return { proc, url };
    } catch(e){
      lastErr = e;
      try{ proc.kill(); }catch{}
      if(attempt===1){ console.warn('WARN: Edge 首次启动未就绪，自动重试一次…'); await new Promise(r=>setTimeout(r, 600)); }
    }
  }
  throw lastErr || new Error('edge launch failed');
}

async function main(){
  const { proc, url } = await launchAndConnect();
  const ws = new WebSocket(url);
  function send(method, params={}){
    const msgId = ++id;
    return new Promise((res)=>{ pending.set(msgId, res); ws.send(JSON.stringify({ id: msgId, method, params })); });
  }
  await new Promise((res)=>{ ws.onopen = res; });
  ws.onmessage = (e)=>{ const m = JSON.parse(e.data); if(m.id && pending.has(m.id)){ pending.get(m.id)(m); pending.delete(m.id); } else events.push(m); };

  await send('Page.enable');
  await send('Page.navigate', { url: 'file:///' + htmlPath.replace(/\\/g,'/') });

  await new Promise((res)=>{
    const t = setInterval(()=>{ if(events.find(e=>e.method==='Page.loadEventFired')){ clearInterval(t); res(); } }, 150);
    setTimeout(()=>{ clearInterval(t); res(); }, 12000);
  });
  await new Promise((r)=>setTimeout(r, 1200)); // 字体/图片稳定

  // 整页截图：视口宽度固定为海报宽度+两侧边距，高度自适应内容（整页带背景，卡片居中，四周留白合理）
  const metrics = await send('Page.getLayoutMetrics');
  const layoutH = (metrics.result && metrics.result.contentSize && metrics.result.contentSize.height) || 1200;
  const VIEW_W = 800; // 海报720 + 两侧各40边距
  await send('Emulation.setDeviceMetricsOverride', { width: VIEW_W, height: Math.ceil(layoutH), deviceScaleFactor: 2, mobile: false });
  await new Promise((r)=>setTimeout(r, 300)); // 视口变化后稳定
  const full = await send('Page.captureScreenshot', {
    format: 'jpeg', quality: 90, captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: VIEW_W, height: Math.ceil(layoutH), scale: 2 }
  });
  const buf = Buffer.from(full.result.data, 'base64');
  fs.writeFileSync(outPath, buf);
  console.log('saved JPG ->', outPath, '('+buf.length+' bytes, '+(VIEW_W*2)+'x'+(Math.ceil(layoutH)*2)+'@2x)');
  try{ proc.kill(); }catch{}
  process.exit(0);
}

main().catch((e)=>{ console.error('ERR', e && e.message || e); process.exit(1); });
