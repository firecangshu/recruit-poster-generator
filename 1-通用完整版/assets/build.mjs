import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ============================================================
 * AI赛事英雄帖生成器 · build.mjs
 * 设计原则：一份数据（招募帖-data.json）共用，多个模版出图。
 *   - 文字内容（.wrap 内）由 buildPoster() 统一注入，所有模版一致；
 *   - 背景图 + 版式（body / .poster / .hero-bg / .poster::before / .wrap）
 *     由 TEMPLATES 决定，互不干扰。
 * 模版：
 *   1.0 = v1 单人剪影背景 · 固定 2:3 竖卡
 *   2.0 = v2 五人剪影+满月背景 · 固定 2:3 竖卡
 *   3.0 = v2 五人剪影+满月背景 · 长图（高度自适应）
 * ============================================================ */

/* ====== 共享基础 CSS（视觉继承，勿改；背景/版式见 TEMPLATES） ====== */
const BASE_CSS = `
  @font-face{font-family:"LiuJianMaoCao";src:url("design-assets/fonts/LiuJianMaoCao-poster.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap;}
  @font-face{font-family:"LongCang";src:url("design-assets/fonts/LongCang-poster.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap;}
  :root{
    --bg:#0a0e17;--gold:#d4a843;--gold-light:#f5d77a;--gold-dark:#9a6f1c;
    --mini:#3ddc97;--ascend:#ff7a18;--ink:#eef3fb;--ink-dim:#b8c6db;--ink-faint:#64748b;
    --line:rgba(255,255,255,.08);--card:rgba(255,255,255,.03);
    --mono:"SFMono-Regular",Consolas,"Liberation Mono",Menlo,monospace;
    --brush:"LongCang","LiuJianMaoCao","KaiTi","STKaiti","楷体",cursive;
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  .aurora{position:absolute;left:50%;top:-260px;width:118%;height:auto;aspect-ratio:2/1;z-index:0;pointer-events:none;background:radial-gradient(ellipse 46% 50% at 50% 48%, rgba(212,168,67,.10), transparent 70%);filter:blur(14px);transform:translateX(-50%);animation:aurora-breathe 9s ease-in-out infinite;}
  .aurora-2{position:absolute;right:-12%;top:20%;width:70%;aspect-ratio:1/1;z-index:0;pointer-events:none;background:radial-gradient(circle at 50% 50%, rgba(212,168,67,.06), transparent 65%);filter:blur(18px);animation:aurora-breathe-2 11s ease-in-out infinite;}
  @keyframes aurora-breathe{0%,100%{opacity:.7;transform:translateX(-50%) translateY(0);}50%{opacity:1;transform:translateX(-50%) translateY(18px);}}
  @keyframes aurora-breathe-2{0%,100%{opacity:.55;transform:translateY(0) scale(1);}50%{opacity:.85;transform:translateY(-14px) scale(1.04);}}
  .vignette{position:absolute;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 118% 92% at 50% 32%, transparent 58%, rgba(3,5,9,.5) 100%);}
  .spark{position:absolute;inset:0;z-index:0;pointer-events:none;background:radial-gradient(circle 8px at 22% 24%, rgba(245,215,122,.12), transparent 70%),radial-gradient(circle 5px at 70% 18%, rgba(255,255,255,.10), transparent 70%),radial-gradient(circle 7px at 84% 60%, rgba(245,215,122,.08), transparent 70%),radial-gradient(circle 9px at 33% 82%, rgba(255,255,255,.09), transparent 70%),radial-gradient(circle 4px at 56% 44%, rgba(255,255,255,.10), transparent 70%),radial-gradient(circle 5px at 46% 66%, rgba(245,215,122,.07), transparent 70%);filter:blur(4px);animation:spark-tw 8s ease-in-out infinite;}
  @keyframes spark-tw{0%,100%{opacity:.18;}50%{opacity:.36;}}
  @media (prefers-reduced-motion:reduce){.aurora,.spark{animation:none;}}
  .head{text-align:center;padding:14px 0 34px;}
  .kicker{font-family:var(--mono);font-size:12.5px;letter-spacing:.34em;color:var(--gold);text-transform:uppercase;margin-bottom:26px;opacity:.75;}
  .title-mini{font-family:var(--mono);font-weight:800;line-height:1;letter-spacing:.08em;font-size:clamp(10px,2.5vw,14px);background:linear-gradient(95deg,var(--gold-light) 0%,var(--gold) 45%,var(--gold-dark) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;margin-bottom:16px;}
  .title-event{font-size:clamp(18px,4.2vw,30px);font-weight:700;line-height:1.3;letter-spacing:.05em;color:var(--ink);margin-bottom:20px;}
  .title-hero{display:flex;justify-content:center;margin:6px 0 18px;font-family:var(--brush);font-weight:400;font-size:clamp(58px,12vw,98px);letter-spacing:.06em;line-height:1.1;color:transparent;padding:2px 16px 14px;background:linear-gradient(165deg,#fff6d8 0%,var(--gold-light) 38%,var(--gold) 72%,#f0cf7e 100%);-webkit-background-clip:text;background-clip:text;text-shadow:0 0 30px rgba(245,215,122,.55),0 0 75px rgba(212,168,67,.32);}
  .head-rule{width:120px;height:3px;margin:26px auto 0;border-radius:3px;background:linear-gradient(90deg,transparent,var(--gold),transparent);}
  .rule{height:1px;background:linear-gradient(90deg,transparent,var(--line),transparent);margin:34px 0 4px;}
  .sec{margin:26px 0;}
  .sec-head{display:flex;align-items:baseline;gap:14px;margin-bottom:12px;}
  .sec-no{font-family:var(--mono);font-size:13.5px;color:var(--gold);border:1px solid rgba(212,168,67,.35);border-radius:8px;padding:3px 11px;background:rgba(212,168,67,.06);}
  .sec-title{font-size:21px;font-weight:700;letter-spacing:.03em;}
  .sec-body{color:var(--ink-dim);font-size:15px;}
  .sec-body strong{color:var(--ink);font-weight:600;}
  .sec-body .lead{color:var(--ink);font-size:15.5px;font-weight:600;}
  .chips{display:flex;flex-wrap:wrap;gap:9px;margin-top:13px;}
  .chip{font-size:13px;color:var(--ink);background:var(--card);border:1px solid var(--line);padding:6px 13px;border-radius:999px;}
  .chip.mini{color:var(--gold);border-color:rgba(212,168,67,.25);background:rgba(212,168,67,.05);}
  .meta{display:flex;flex-direction:column;gap:7px;margin-top:13px;font-size:14px;color:var(--ink-dim);}
  .meta b{color:var(--ink);}
  .official-link{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin-top:16px;font-size:15px;font-weight:600;color:var(--gold);text-decoration:none;background:rgba(212,168,67,.07);border:1px solid rgba(212,168,67,.28);border-radius:12px;padding:12px 20px;transition:.2s;}
  .official-link:hover{background:rgba(212,168,67,.14);transform:translateY(-1px);}
  .official-link .ol-label{color:var(--gold);}
  .official-link .ol-url{flex:1 1 100%;min-width:0;font-family:var(--mono);font-size:13px;font-weight:500;color:var(--ink-dim);letter-spacing:.01em;word-break:break-all;overflow-wrap:anywhere;line-height:1.5;margin-top:2px;}
  .official-link .ol-enter{margin-left:auto;color:var(--ascend);font-weight:700;}
  .official-link .arrow{font-family:var(--mono);opacity:.9;}
  @media(max-width:640px){.official-link .ol-enter{margin-left:0;}}
  .split{display:flex;flex-wrap:wrap;gap:12px;margin-top:13px;}
  .pill{flex:1 1 150px;background:rgba(212,168,167,.05);border:1px solid rgba(212,168,67,.22);border-radius:14px;padding:16px;text-align:center;}
  .pill .k{font-family:var(--mono);font-size:12.5px;color:var(--gold);letter-spacing:.12em;}
  .pill .v{font-size:18px;font-weight:800;margin-top:5px;color:var(--gold-light);}
  .cards{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:13px;}
  .card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px;position:relative;overflow:hidden;}
  .card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,var(--gold),var(--gold-dark));}
  .card h3{font-size:16px;margin-bottom:7px;}
  .card p{font-size:13.5px;color:var(--ink-dim);}
  .card .tag{font-family:var(--mono);font-size:12px;color:var(--gold);display:block;margin-top:9px;}
  .cta{margin-top:13px;background:linear-gradient(120deg,rgba(212,168,67,.09),rgba(255,122,24,.07));border:1px solid rgba(212,168,67,.2);border-radius:18px;padding:24px;text-align:center;}
  .cta .lead{font-size:18px;font-weight:700;margin-bottom:6px;color:var(--gold-light);}
  .cta .note{font-size:14.5px;color:var(--ink-dim);}
  .cta .contact{font-family:var(--mono);font-size:14px;color:var(--gold);margin-top:10px;}
  footer{margin-top:40px;text-align:center;color:var(--ink-faint);font-size:12px;font-family:var(--mono);letter-spacing:.08em;}
  @media(max-width:560px){.cards{grid-template-columns:1fr;}.poster{width:94vw;}}
`;

/* ====== 模版库（背景 + 版式差异点） ====== */
const TEMPLATES = {
  '1.0': {
    label: 'v1 单人剪影 · 固定 2:3 竖卡',
    body:   'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;background-color:#05080e;color:var(--ink);line-height:1.85;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px;-webkit-font-smoothing:antialiased;}',
    poster: '.poster{position:relative;width:min(92vw,720px);aspect-ratio:2 / 3;max-height:94vh;border-radius:24px;overflow:hidden;background-color:#0a0e17;box-shadow:0 30px 90px rgba(0,0,0,.65),0 0 0 1px rgba(255,255,255,.06);z-index:0;}',
    heroBg: '.hero-bg{position:absolute;inset:0;z-index:0;pointer-events:none;background:url("design-assets/hero-silhouette.png") 50% bottom / cover no-repeat;transform-origin:50% 100%;transform:translate(0%, 0%) rotate(0deg) scale(1);filter:brightness(90%);}',
    before: '.poster::before{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(ellipse 120% 70% at 50% -10%, rgba(212,168,67,.10), transparent 55%),linear-gradient(180deg, rgba(4,6,10,.99) 0%, rgba(4,6,10,.93) 30%, rgba(4,6,10,.72) 50%, rgba(4,6,10,.44) 64%, rgba(4,6,10,.62) 100%);}',
    wrap:   '.wrap{position:absolute;inset:0;z-index:2;overflow-y:auto;padding:46px 30px 54px;-webkit-overflow-scrolling:touch;}'
  },
  '2.0': {
    label: 'v2 五人剪影+满月 · 固定 2:3 竖卡',
    body:   'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;background-color:#05080e;color:var(--ink);line-height:1.85;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px;-webkit-font-smoothing:antialiased;}',
    poster: '.poster{position:relative;width:min(92vw,720px);aspect-ratio:2 / 3;max-height:94vh;border-radius:24px;overflow:hidden;background-color:#0a0e17;box-shadow:0 30px 90px rgba(0,0,0,.65),0 0 0 1px rgba(255,255,255,.06);z-index:0;}',
    heroBg: '.hero-bg{position:absolute;inset:0;z-index:0;pointer-events:none;background:url("design-assets/hero-silhouette.jpg") 50% bottom / cover no-repeat;transform-origin:50% 100%;transform:translate(0%, 0%) rotate(0deg) scale(1);filter:brightness(90%);}',
    before: '.poster::before{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(ellipse 120% 70% at 50% -10%, rgba(212,168,67,.10), transparent 55%),linear-gradient(180deg, rgba(4,6,10,.99) 0%, rgba(4,6,10,.93) 30%, rgba(4,6,10,.72) 50%, rgba(4,6,10,.44) 64%, rgba(4,6,10,.62) 100%);}',
    wrap:   '.wrap{position:absolute;inset:0;z-index:2;overflow-y:auto;padding:46px 30px 54px;-webkit-overflow-scrolling:touch;}'
  },
  '3.0': {
    label: 'v2 五人剪影+满月 · 长图（高度自适应）',
    body:   'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;background-color:#05080e;color:var(--ink);line-height:1.85;min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:40px 16px;-webkit-font-smoothing:antialiased;}',
    poster: '.poster{position:relative;width:720px;margin:0 auto;border-radius:24px;background-color:#0a0e17;box-shadow:0 30px 90px rgba(0,0,0,.65),0 0 0 1px rgba(255,255,255,.06);z-index:0;}',
    heroBg: '.hero-bg{position:absolute;inset:0;z-index:0;pointer-events:none;background:url("design-assets/hero-silhouette-long.jpg") 50% bottom / cover no-repeat;transform-origin:50% 100%;transform:translate(0%, 0%) rotate(0deg) scale(1);filter:brightness(100%);}',
    before: '.poster::before{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(ellipse 120% 70% at 50% -10%, rgba(212,168,67,.10), transparent 55%),linear-gradient(180deg, rgba(4,6,10,.79) 0%, rgba(4,6,10,.85) 28%, rgba(4,6,10,.62) 48%, rgba(4,6,10,.42) 62%, rgba(4,6,10,.58) 100%);}',
    wrap:   '.wrap{position:relative;z-index:2;padding:46px 30px 54px;}'
  }
};

function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function lines(s){return Array.isArray(s)?s.map(x=>String(x).trim()).filter(Boolean):String(s||'').split('\n').map(x=>x.trim()).filter(Boolean);}
function labeled(spans){
  return lines(spans).map(function(s){
    var i=s.indexOf('：');
    if(i<0) return '<span>'+esc(s)+'</span>';
    return '<span>'+esc(s.slice(0,i))+'：<b>'+esc(s.slice(i+1))+'</b></span>';
  }).join('');
}

function buildPoster(d){
  d = d || {};
  var chips = lines(d.chips).map(function(s){return '<span class="chip mini">'+esc(s)+'</span>';}).join('');
  var reqs = labeled(d.reqs);
  if(d.deadline) reqs += '<span>截止日期：<b>'+esc(d.deadline)+'</b></span>';
  var teamLimit = d.teamLimit || d.teamLimit2 || '';
  var rewards=[];
  if(d.r1) rewards.push('<div class="pill"><div class="k">RANK-1</div><div class="v">'+esc(d.r1)+'</div></div>');
  if(d.r2) rewards.push('<div class="pill"><div class="k">RANK-2</div><div class="v">'+esc(d.r2)+'</div></div>');
  if(d.r3) rewards.push('<div class="pill"><div class="k">RANK-3</div><div class="v">'+esc(d.r3)+'</div></div>');
  var rewardHtml = rewards.length ? '<div class="split">'+rewards.join('')+'</div>' : '';
  var honorHtml = d.honor ? '<p style="margin-top:14px;font-size:14.5px;color:var(--gold-light);font-weight:600;line-height:1.6;">🏆 荣誉：'+esc(d.honor)+'</p>' : '';
  var official = '';
  if(d.officialUrl){
    official='<a class="official-link" href="'+esc(d.officialUrl)+'" target="_blank" rel="noopener">'+
      '<span class="ol-label">赛事官方网站</span>'+
      '<span class="ol-url">'+esc(d.officialUrl)+'</span>'+
      '<span class="ol-enter">一键进入 <span class="arrow">↗</span></span></a>';
  }
  var seats = lines(d.seats).map(function(s){
    var p=s.split('|').map(function(x){return x.trim();});
    return '<div class="card"><h3>'+esc(p[0]||'')+'</h3><p>'+esc(p[1]||'')+'</p><span class="tag">硬技能：'+esc(p[2]||'')+'</span></div>';
  }).join('');
  var seatCount = (seats.match(/class="card"/g)||[]).length;
  var generalReqHtml = lines(d.generalReq).length ? '<p style="margin-top:13px;font-size:14.5px;color:var(--ink-dim);line-height:1.8;">'+lines(d.generalReq).map(esc).join('<br>')+'</p>' : '';

  return ''+
  '<div class="poster">'+
    '<div class="hero-bg"></div><div class="aurora"></div><div class="aurora-2"></div>'+
    '<div class="vignette"></div><div class="spark"></div>'+
    '<div class="wrap">'+
      '<div class="head">'+
        '<div class="kicker">'+esc(d.kicker)+'</div>'+
        '<h1 class="title-mini">'+esc(d.brand)+'</h1>'+
        '<div class="title-event">'+esc(d.eventName)+'</div>'+
        '<div class="title-hero">'+esc(d.heroTitle)+'</div>'+
        '<div class="head-rule"></div>'+
      '</div>'+
      '<section class="sec"><div class="sec-head"><span class="sec-no">01</span><span class="sec-title">赛事简介</span></div>'+
        '<div class="sec-body"><p class="lead">'+esc(d.introLead)+'</p>'+
        '<div style="margin-top:8px;">'+esc(d.introBody).replace(/\n/g,'<br>')+'</div>'+
        '<div class="chips">'+chips+'</div>'+
        '<div class="meta">'+reqs+'</div>'+official+'</div></section>'+
      '<section class="sec"><div class="sec-head"><span class="sec-no">02</span><span class="sec-title">比赛奖励</span></div>'+
        '<div class="sec-body">'+rewardHtml+honorHtml+'</div></section>'+
      '<section class="sec"><div class="sec-head"><span class="sec-no">03</span><span class="sec-title">'+esc(d.projSecTitle)+'</span></div>'+
        '<div class="sec-body"><strong>'+esc(d.projRole)+'</strong>'+esc(d.projLead)+
        '<div class="meta" style="flex-direction:column;gap:7px;">'+labeled(d.projItems)+'</div></div></section>'+
      '<section class="sec"><div class="sec-head"><span class="sec-no">04</span><span class="sec-title">招募队友要求</span></div>'+
        '<div class="sec-body">'+(teamLimit?teamLimit+'，':'')+'现开放 '+seatCount+' 个席位：'+
        '<div class="cards">'+seats+'</div>'+generalReqHtml+'</div></section>'+
      '<section class="sec"><div class="sec-head"><span class="sec-no">05</span><span class="sec-title">联系方式</span></div>'+
        '<div class="sec-body"><div class="cta"><div class="lead">'+esc(d.ctaLead)+'</div>'+
        '<div class="note">'+esc(d.ctaNote)+'</div>'+
        '<div class="contact">'+esc(d.contactName)+' &nbsp;·&nbsp; 微信号：'+esc(d.contactWx)+'</div></div></div></section>'+
      '<footer>'+esc(d.footerBrand)+' &amp; '+esc(d.footerEco)+' · '+esc(d.heroTitle)+'</footer>'+
    '</div>'+
  '</div>';
}

/* ====== 入口（含模版选择 / 输入校验 / 容错 / 输出目录创建） ====== */
const args = process.argv.slice(2);
let dataPath, outPath, tpl = '2.0';
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--template') { tpl = args[++i]; }
  else if (a.startsWith('--template=')) { tpl = a.split('=')[1]; }
  else if (!dataPath) { dataPath = a; }
  else if (!outPath) { outPath = a; }
}
if (!dataPath) { console.error('usage: node build.mjs <data.json> [out.html] [--template 1.0|2.0|3.0]'); process.exit(1); }
if (!fs.existsSync(dataPath)) { console.error('ERROR: 找不到数据文件 ->', dataPath); process.exit(1); }

let d;
try {
  d = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (e) {
  console.error('ERROR: 数据文件不是合法 JSON ->', e.message);
  process.exit(1);
}
if (!d || typeof d !== 'object') { console.error('ERROR: 数据文件内容必须是 JSON 对象'); process.exit(1); }

// 模版校验（未知回退 2.0，不中断）
if (!TEMPLATES[tpl]) {
  console.warn('WARN: 未知模版 "' + tpl + '"，回退到 2.0（v2 五人竖卡）');
  tpl = '2.0';
}
const T = TEMPLATES[tpl];

// 关键字段缺失提醒（不中断，仍生成，避免卡住用户）
const REQUIRED = ['eventName', 'heroTitle', 'contactName', 'contactWx'];
const missing = REQUIRED.filter(k => !d[k]);
if (missing.length) { console.warn('WARN: 以下关键字段缺失，已用占位/默认填充 ->', missing.join(', ')); }

try {
  fs.mkdirSync(path.dirname(path.resolve(outPath || dataPath)), { recursive: true });
} catch {}

const POSTER_CSS = [BASE_CSS, T.body, T.poster, T.heroBg, T.before, T.wrap].join('\n');
const title = (d.eventName || 'AI赛事英雄帖') + ' · ' + (d.heroTitle || '');
const full = '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n' +
  '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
  '<title>' + esc(title) + '</title>\n<style>' + POSTER_CSS + '\n</style>\n</head>\n<body>\n' +
  buildPoster(d) + '\n</body>\n</html>\n';

outPath = outPath || dataPath.replace(/\.json$/i, '') + '.html';
try {
  fs.writeFileSync(outPath, full);
} catch (e) {
  console.error('ERROR: 写入 HTML 失败 ->', e.message);
  process.exit(1);
}
// 自动拷贝模版依赖（背景图 + 字体）到输出 HTML 同级 design-assets/
// 目的：保证在任何工作区运行生成器都能开箱即用，不依赖手动补齐素材。
(function copyDeps(){
  const depText = [T.heroBg, BASE_CSS].join('\n');
  const rels = [...new Set((depText.match(/design-assets\/[^\s"')]+/g) || []))];
  for (const rel of rels) {
    const src = path.join(__dirname, rel);
    const dst = path.join(path.dirname(path.resolve(outPath)), rel);
    if (src === dst) continue;            // 输出就在 Skill 目录内时跳过自拷贝
    if (fs.existsSync(src)) {
      try {
        fs.mkdirSync(path.dirname(dst), { recursive: true });
        fs.copyFileSync(src, dst);
      } catch (e) { console.warn('WARN: 拷贝依赖失败 ->', rel, e.message); }
    } else {
      console.warn('WARN: 模版依赖素材缺失，跳过 ->', rel);
    }
  }
})();

console.log('saved ->', outPath, '(' + Buffer.byteLength(full) + ' bytes)  [模版 ' + tpl + ' · ' + T.label + ']');
