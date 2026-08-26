/* 책 파일 → 책 구조. 영어 원서 서재(/)와 한국 문학 서재(/ko/)가 함께 쓴다.
   원래 index.html 안에 있던 것을 그대로 옮겼다. 두 곳에 같은 코드를 두면
   EPUB 버그를 고칠 때마다 두 번 고쳐야 하고, 그러다 갈라진다.
   여기에는 앱 상태(S·MANIFEST·DOM)를 건드리는 것이 하나도 없다 — 순수하게
   바이트와 글자만 다룬다. PDF 는 pdf.js 에 매여 있어 index.html 에 남겼다. */

/* ---- 텍스트 → 책 구조 변환 ---- */
const RX_CHAP=/^chapter\s+([0-9]+|[a-z]+(?:[\s-][a-z]+)?)\b\.?\s*(.*)$/i;
const RX_PART=/^(?:part|book)\s+([0-9]+|[ivxlcdm]+)\b\.?\s*(.*)$/i;
const RX_HEAD=/^(prologue|epilogue|preface|foreword|afterword|introduction|author'?s note)\b/i;
const RX_NUM=/^([0-9]{1,3})$/;
/* Stave One(크리스마스 캐럴) · Adventure I.(셜록) · Letter 1(프랑켄슈타인) 같은 것들 */
const RX_SECT=/^(stave|adventure|letter|canto|chapter|section|act)\s+([0-9]+|[ivxlcdm]+|[a-z]+(?:[\s-][a-z]+)?)\b\.?\s*(.*)$/i;
/* 홀로 선 대문자 로마 숫자 = 장 번호 (암흑의 핵심, 위대한 개츠비, 변신 …).
   소문자는 받지 않는다 — 본문에 낱말로 섞여 들어올 수 있어서. */
const RX_ROMAN=/^([IVXLCDM]{1,7})\.?$/;
/* "CHAPTER   PAGE" · "CONTENTS" — 장 제목이 아니라 목차표의 머리다.
   이 줄로 열린 장에는 목차가 통째로 담기므로 나중에 버린다. */
const RX_TOCH=/^(chapter\s+page|contents|table of contents)$/i;
/* "_THE FIRST CHAPTER_" — 차례를 말로 적고 순서를 뒤집은 제목 (돌리틀 선생 이야기) */
const RX_ORD=/^_?the\s+([a-z]+(?:[\s-][a-z]+)?)\s+chapter_?$/i;
/* "01 My Early Home" — 번호와 제목이 한 줄에 붙은 형태 (검정 말 이야기).
   문장 부호가 없고 제목이 대문자로 시작할 때만 받되, 번호가 지금까지 센
   장 수의 바로 다음일 때만 인정한다. 출판사 광고 목록("6 AN OLD-FASHIONED
   THANKSGIVING")이나 체스 기보("10. W.Q. to Q.R.'s 6th")가 장으로 잡히던 것을
   이 차례 검사 하나가 걸러낸다. */
const RX_NUMT=/^(\d{1,3})[.\s]\s*([A-Z][^.!?]{2,58})$/;
/* "I. Granny Fox Gives Reddy a Scare" — 로마 숫자와 제목이 한 줄에.
   RX_ROMAN 은 숫자만 홀로 선 줄만 받으므로 이런 장은 통째로 안 나뉘었다.
   여기도 차례가 맞을 때만 인정한다. */
const RX_ROMANT=/^([IVXLCDM]{1,7})\.\s+(\S[^.!?]{2,58})$/;
const RX_BREAK=/^[*#•·—–\-\s]{2,}$/;
const RVAL={i:1,v:5,x:10,l:50,c:100,d:500,m:1000};
/* 제대로 된 로마 숫자 셈 — 예전엔 15까지 적어둔 표라 XVI 부터는 0 이 나왔고,
   그 바람에 16장부터 제목이 "Chapter XVI" 처럼 숫자로 안 바뀌었다 */
function rnum(s){
  s=String(s).toLowerCase().replace(/\.$/,'');
  if(/^\d+$/.test(s)) return +s;
  if(!/^[ivxlcdm]+$/.test(s)||s.length>15) return 0;
  let n=0;
  for(let i=0;i<s.length;i++){
    const v=RVAL[s[i]], nx=RVAL[s[i+1]]||0;
    n += (nx>v) ? -v : v;
  }
  return n;
}
/* 영어 숫자말 → 숫자 ("TWENTY-ONE" → 21). 많은 소설이 장 제목을 이렇게 씁니다. */
/* 차례를 말로 적은 것 → 숫자 ("FIRST" → 1) */
const OWORD={first:1,second:2,third:3,fourth:4,fifth:5,sixth:6,seventh:7,eighth:8,
  ninth:9,tenth:10,eleventh:11,twelfth:12,thirteenth:13,fourteenth:14,fifteenth:15,
  sixteenth:16,seventeenth:17,eighteenth:18,nineteenth:19,twentieth:20,thirtieth:30};
function onum(s){
  const ps=String(s).toLowerCase().trim().split(/[\s-]+/).filter(Boolean);
  if(ps.length===1) return OWORD[ps[0]]||0;
  if(ps.length===2 && NWORD[ps[0]] && OWORD[ps[1]]) return NWORD[ps[0]]+OWORD[ps[1]];
  return 0;
}
const NWORD={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,
  eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,
  eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,
  eighty:80,ninety:90,hundred:100};
function wnum(s){
  const ps=String(s).toLowerCase().trim().split(/[\s\-]+/).filter(Boolean);
  if(!ps.length||ps.length>3||!ps.every(w=>NWORD[w]!==undefined)) return 0;
  return ps.reduce((a,w)=>a+NWORD[w],0);
}
function cleanName(f){
  return f.replace(/\.[a-z0-9]+$/i,'')
    .replace(/\([^)]*(z-lib|1lib|library|libgen|anna)[^)]*\)/ig,'')
    .replace(/[_]+/g,' ').replace(/\s{2,}/g,' ').replace(/[\s\-–—]+$/,'').trim();
}

/* ---- EPUB → 줄 ----
   EPUB 은 XHTML 을 담은 ZIP 이다. 푸는 데는 브라우저에 이미 있는
   DecompressionStream 을 쓴다 — PDF 와 달리 따로 받아오는 라이브러리가 없다. */
async function inflateRaw(bytes){
  const st=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(st).arrayBuffer());
}
/* ZIP 중앙 디렉터리를 읽어 {이름 → 바이트 꺼내는 함수} 를 만든다.
   미리 다 풀지 않는다 — 책 한 권에 안 쓰는 그림·글꼴이 잔뜩 들어 있다. */
async function zipOpen(file){
  const buf=await file.arrayBuffer(), dv=new DataView(buf), U8=new Uint8Array(buf);
  /* 꼬리(EOCD)를 끝에서부터 찾는다 — 뒤에 주석이 붙어 있을 수 있다 */
  let eo=-1;
  for(let i=buf.byteLength-22, stop=Math.max(0,buf.byteLength-22-65535); i>=stop; i--)
    if(dv.getUint32(i,true)===0x06054b50){ eo=i; break; }
  if(eo<0) throw new Error('EPUB 이 아니거나 파일이 깨졌어요');
  const n=dv.getUint16(eo+10,true);
  if(n===0xffff) throw new Error('이 EPUB 은 ZIP64 라 읽지 못해요');
  let p=dv.getUint32(eo+16,true);
  const dec=new TextDecoder(), ent={};
  for(let i=0;i<n;i++){
    if(dv.getUint32(p,true)!==0x02014b50) break;
    const how=dv.getUint16(p+10,true), size=dv.getUint32(p+20,true);
    const nl=dv.getUint16(p+28,true), el=dv.getUint16(p+30,true), cl=dv.getUint16(p+32,true);
    const name=dec.decode(U8.subarray(p+46,p+46+nl));
    ent[name]={how,size,lho:dv.getUint32(p+42,true)};
    p+=46+nl+el+cl;
  }
  return async name=>{
    const e=ent[name]; if(!e) return null;
    /* 자료가 어디서 시작하는지는 지역 헤더를 봐야 안다 — 헤더마다 덧붙는 길이가 다르다 */
    const nl=dv.getUint16(e.lho+26,true), el=dv.getUint16(e.lho+28,true);
    const at=e.lho+30+nl+el, raw=U8.subarray(at,at+e.size);
    return e.how===0? raw : await inflateRaw(raw);
  };
}

/* 한 쪽(XHTML)에서 줄을 뽑는다. 블록 하나가 한 줄, 뒤에 빈 줄을 붙여 문단을 가른다. */
const EPUB_BLOCK='p,h1,h2,h3,h4,h5,h6,li,blockquote,dd,dt,pre,td,div';
/* EPUB 안의 XML 은 심심찮게 규칙을 어긴다. 실제로 본 것: <dc:creator opf:role="aut">
   인데 xmlns:opf 를 선언하지 않은 책 — 딱 한 군데 어긋났을 뿐인데 XML 로는
   파일 전체가 파싱 불가가 되고, 그러면 manifest·spine 을 하나도 못 찾는다.
   엄격하게 읽어 보고 어긋나면 너그러운 HTML 파서로 다시 읽는다. */
function parseLoose(text,strict){
  let doc=new DOMParser().parseFromString(text,strict);
  if(doc.querySelector('parsererror')) doc=new DOMParser().parseFromString(text,'text/html');
  return doc;
}
/* 한 줄이 한 문단인 것처럼 옮겨진 책을 알아본다.
   인쇄면을 그대로 변환한 EPUB 은 <p> 하나가 문단이 아니라 '인쇄된 한 줄'이다.
   그러면 문장이 줄마다 끊겨 읽을 수가 없다. 실제로 본 책: <p> 1,280개에
   글자수 중앙값 37자, 문장이 끝나는 자리에서 닫히는 것이 48%뿐이었다.
   섣불리 합치면 대화체나 시를 망치므로, 그런 꼴일 때만 손댄다. */
/* 목차 줄 찾기 — "I. 제목" · "01 제목" 처럼 번호와 제목이 붙은 형태까지 알아본다.
   이걸 못 보면 목차가 통째로 남아, 목차 항목이 장 제목으로 잡히고
   진짜 장 번호가 하나씩 밀린다. */
const HEADISH=/^(chapter|part|book|stave|adventure|letter|canto)\s+[0-9a-z]+|^(prologue|epilogue|contents)\b|^[IVXLCDM]{1,7}\.?$|^[IVXLCDM]{1,7}\.\s+\S|^\d{1,3}[.\s]\s*[A-Z]/i;
const SENT_END=/[.!?…。！？"”’」』\)\]]$|[다까요라네오죠군슴음함임][.!?…]?$/;
const HEADLINE=s=>s.length<60&&(HEADISH.test(s)||RX_CHAP.test(s));
function looksLineBroken(t){
  if(t.length<40) return false;                       // 짧은 쪽은 판단하지 않는다
  const len=t.map(x=>x.length).sort((a,b)=>a-b);
  const med=len[Math.floor(len.length/2)]||0;
  const ends=t.filter(x=>SENT_END.test(x)).length/t.length;
  if(med>45||ends>=0.6) return false;
  /* 제목꼴 줄이 흔한 쪽은 본문이 아니라 차례·앞머리다. 거기 손대면 장 제목이
     앞줄에 붙어 버린다 — 구텐베르크 오만과 편견은 차례와 1장이 한 파일에 있어서,
     'CHAPTER I.' 이 앞줄에 붙는 순간 1장 34문단(847낱말)이 앞머리로 몰려 버려졌다. */
  return t.filter(HEADLINE).length*20 < t.length;     // 5% 미만
}
function mergeLines(t){
  const out=[];
  for(const line of t){
    const prev=out[out.length-1];
    /* 제목 줄은 앞에도 뒤에도 붙이지 않는다 — 장 경계는 합치기보다 중요하다 */
    if(prev!==undefined&&!SENT_END.test(prev)&&!HEADLINE(prev)&&!HEADLINE(line))
      out[out.length-1]+=' '+line;
    else out.push(line);
  }
  return out;
}
/* html → 줄. opts.anchors 는 '이 id 에서 새 장이 시작한다' 는 표 (id → 제목).
   목차가 파일 안 앵커(#page_15 같은)를 가리키는 책이 있는데, 파일 단위로만
   나누면 한 파일에 든 장 10개가 한 장으로 뭉친다. */
function xhtmlLines(html,out,opts){
  const doc=parseLoose(html,'application/xhtml+xml');
  const body=doc.body||doc.documentElement; if(!body) return;
  /* 주석 번호(<sup>1)</sup>)·루비는 본문에 섞이면 문장을 망친다.
     삽화 설명(span.caption)도 뺀다 — 구텐베르크 EPUB 은 이것을 장 제목 <h2> 안에
     같이 넣어서, 그냥 두면 제목이 'Covering a screen. CHAPTER VIII.' 이 되어
     'CHAPTER' 로 시작하지 않는다. 그러면 그 장을 통째로 놓친다
     (오만과 편견이 62장에서 27장으로 줄었다).
     평문 파서가 [Illustration: …] 를 버리는 것과 같은 처리다. */
  body.querySelectorAll('sup,script,style,rt,rp,figcaption,.caption').forEach(e=>e.remove());
  const line=(s,brk)=>{ const o={s:String(s||''),x0:0,x1:String(s||'').length,h:0,yp:0,p:1};
    if(brk!==undefined) o.brk=brk; return o; };
  const push=s=>{ s=String(s||'').replace(/\s+/g,' ').trim();
    if(s){ out.push(line(s)); out.push(line('')); } };
  /* 'CHAPTERXXVII.' 처럼 붙어 나온 제목에 공백을 넣어 준다. 만든 쪽 오타인데,
     파서는 'chapter' 뒤에 공백을 요구해서 그냥 두면 그 장을 통째로 놓친다
     (구텐베르크 오만과 편견의 27·28장이 딱 이렇다).
     숫자나 로마 숫자가 오고 그 뒤가 끊길 때만 손대므로 'Chapterhouse' 는 그대로 둔다. */
  const unglue=s=>s.replace(/^(chapter|part|book)(?=(?:[IVXLCDM]+|\d+)(?:[.\s]|$))/i,'$1 ');
  const anchors=(opts&&opts.anchors)||null;
  const blocks=body.querySelectorAll(EPUB_BLOCK);
  /* 먼저 모아 둔다 — 합칠지 말지는 이 쪽 전체를 봐야 정할 수 있다 */
  const items=[];
  blocks.forEach(el=>{
    if(el.querySelector(EPUB_BLOCK)) return;      // 안에 또 블록이 있으면 그 자식이 낸다
    let s=el.textContent; if(!(s&&s.trim())) return;
    s=s.replace(/\s+/g,' ').trim();
    if(/^h[1-6]$/i.test(el.tagName)) s=unglue(s);
    /* 이 블록이나 그 안쪽에 장 시작 앵커가 있나 */
    let brk;
    if(anchors){
      const id=el.getAttribute&&el.getAttribute('id');
      if(id&&anchors[id]!==undefined) brk=anchors[id];
      else { const inner=el.querySelector&&el.querySelector('[id]');
        if(inner){ const iid=inner.getAttribute('id');
          if(iid&&anchors[iid]!==undefined) brk=anchors[iid]; } }
    }
    items.push({s,brk});
  });
  if(!items.length){
    String(body.textContent||'').split(/\n/).forEach(push);   // 블록이 아예 없는 쪽
    return;
  }
  /* 장 경계를 넘어 합치면 안 되므로 토막마다 따로 본다 */
  let seg=[], segBrk=items[0].brk;
  const flush=()=>{
    if(!seg.length) return;
    /* 목차가 '여기서 장이 시작한다' 고 한 자리면 첫 줄은 그 장의 제목이다.
       줄 잇기가 그 줄을 뒤 문장에 붙여 버리면 제목이 본문 첫 문단에 끼어들고,
       나중에 제목 중복을 걷어낼 수도 없게 된다. 그래서 첫 줄은 빼고 잇는다. */
    const head=(segBrk!==undefined && seg.length>1);
    const rest=head? seg.slice(1) : seg;
    const merged=looksLineBroken(rest)? mergeLines(rest) : rest;
    const t=head? [seg[0]].concat(merged) : merged;
    if(segBrk!==undefined) out.push(line('',segBrk));
    t.forEach(push);
    seg=[];
  };
  items.forEach((it,i)=>{
    if(i>0&&it.brk!==undefined){ flush(); segBrk=it.brk; }
    seg.push(it.s);
  });
  flush();
}
/* 표지·판권·해설처럼 본문이 아닌 쪽은 건너뛴다.
   그냥 두면 해설의 소제목 번호와 주석 번호가 장 구분으로 잡혀서,
   18장짜리 책이 29장이 된다 (민음사 세계문학전집 기준으로 확인).
   낱말 자체가 파일 이름이어야 걸리게 했다 — 'nav' 로 시작한다고
   'navy_chapter.xhtml' 까지 버리면 본문이 날아간다.
   index 는 일부러 뺐다: 본문을 index.html 에 담는 EPUB 이 흔하다. */
const EPUB_SKIP=/(^|\/)(?:\d+[_-]+)?(cover|incover|title_?page|colophon|copyright|toc|nav|list_wl|logo|commentary|comment|chronology|author|appendix|afterword|biblio|acknowledg\w*)[_-]?\d*\.x?html?$/i;
async function epubLines(file,prog){
  const get=await zipOpen(file);
  const dec=new TextDecoder();
  const cx=await get('META-INF/container.xml');
  if(!cx) throw new Error('EPUB 짜임새가 아니에요');
  const opfPath=parseLoose(dec.decode(cx),'application/xml')
    .querySelector('rootfile')?.getAttribute('full-path');
  if(!opfPath) throw new Error('EPUB 안에서 본문 목록을 찾지 못했어요');
  const base=opfPath.includes('/')? opfPath.replace(/\/[^\/]*$/,'/') : '';
  const opf=parseLoose(dec.decode(await get(opfPath)),'application/xml');
  /* 자식 선택자(manifest > item)를 쓰면 안 된다. 규칙을 어긴 OPF 는 HTML 파서로
     읽게 되는데, HTML 은 미지 태그의 self-closing 을 인정하지 않아서
     <item .../> 39개가 형제가 아니라 서로 안으로 중첩된다. 그러면 직계 자식은
     첫 하나뿐이라 나머지 38개를 통째로 놓친다.

     태그 이름도 그대로 견주면 안 된다. <opf:item> 처럼 접두사를 붙여 쓴 OPF 가
     있는데, XML 로 읽히면 이름이 'opf:item' 이고 HTML 로 읽혀도 마찬가지다.
     그래서 접두사를 떼고 이름만 본다 — 접두사가 있든 없든, XML 로 읽혔든
     HTML 로 읽혔든 같게 동작한다. 문서에 나온 차례는 그대로 지켜진다. */
  const bare=e=>(e.localName||e.tagName||'').replace(/^.*:/,'').toLowerCase();
  const every=[...opf.getElementsByTagName('*')];
  const tags=n=>every.filter(e=>bare(e)===n);
  const href={};
  tags('item').forEach(it=>{
    const id=it.getAttribute('id'); if(id) href[id]=it.getAttribute('href');
  });
  const all=tags('itemref').map(r=>href[r.getAttribute('idref')]).filter(Boolean);
  if(!all.length) throw new Error('EPUB 안에 읽을 쪽이 없어요');
  /* 건너뛰기는 어디까지나 짐작이다. 이름만 보고 거르므로 'cover1.xhtml' 처럼
     본문을 그렇게 이름 붙인 책에서는 통째로 다 걸러져 버린다.
     그래서 걸러 낸 결과가 비면 거르지 않은 것을 쓴다 — 해설이 장으로 몇 개
     끼는 것이 책이 아예 안 열리는 것보다 낫다. */
  let spine=all.filter(h=>!EPUB_SKIP.test(h));
  let skipped=spine.length<all.length;
  if(!spine.length){ spine=all; skipped=false; }
  /* 이어 붙인 줄과 별개로 쪽마다 따로도 담아 둔다 — 본문 글에서 장을 못 찾았을 때
     EPUB 이 원래 나눠 둔 쪽 경계를 장으로 쓰기 위해서다. */
  let docs=[], frag={};
  const anchorsFor=h=>frag[decodeURIComponent(h)]||frag[h]||null;
  const read=async list=>{
    const out=[]; docs=[];
    for(let i=0;i<list.length;i++){
      /* 경로에 %20 같은 것이 들어 있을 수 있다 */
      const raw=await get(base+decodeURIComponent(list[i])) || await get(base+list[i]);
      const from=out.length;
      /* 목차가 이 파일 안 앵커를 가리키면 그 자리에서 장을 나눈다 */
      if(raw) xhtmlLines(dec.decode(raw),out,{anchors:anchorsFor(list[i])});
      docs.push({href:list[i],lines:out.slice(from)});
      if(i%4===0||i===list.length-1) prog(i+1,list.length);
    }
    return out;
  };
  /* 목차를 본문보다 먼저 읽는다 — 목차가 파일 안 앵커를 가리키는 책이 있어서,
     본문을 읽을 때 이미 그 표를 손에 쥐고 있어야 그 자리에서 장을 나눌 수 있다. */
  /* 쪽마다의 제목은 책이 스스로 갖고 있는 목차에서 가져온다.
     본문에 <h1> 같은 제목 태그가 아예 없는 책이 있는데(한국 전자책에 흔하다),
     그런 책은 글만 봐서는 장을 나눌 근거가 없다. 목차는 그 근거가 된다.
     EPUB2 는 toc.ncx(navPoint), EPUB3 는 nav 문서(<a href>)를 쓴다. */
  const tocPath=tags('item').map(i=>i.getAttribute('href'))
    .find(h=>h&&/\.ncx$/i.test(h));
  const label={};        // 파일 → 그 파일이 시작하는 장 이름
  const put=(src,text)=>{
    if(!src||!text) return;
    const raw=String(src), t=text.replace(/\s+/g,' ').trim();
    const key=decodeURIComponent(raw.split('#')[0]);
    const id=raw.includes('#')? decodeURIComponent(raw.split('#').slice(1).join('#')) : '';
    if(!key) return;
    if(id){ (frag[key]||(frag[key]={}))[id]=t; }
    if(!label[key]) label[key]=t;
  };
  if(tocPath){
    const ncxRaw=await get(base+decodeURIComponent(tocPath)) || await get(base+tocPath);
    if(ncxRaw){
      const ncx=parseLoose(dec.decode(ncxRaw),'application/xml');
      const nb=e=>(e.localName||e.tagName||'').replace(/^.*:/,'').toLowerCase();
      [...ncx.getElementsByTagName('*')].filter(e=>nb(e)==='navpoint').forEach(np=>{
        const kids=[...np.getElementsByTagName('*')];
        const txt=kids.find(e=>nb(e)==='text')?.textContent;
        const src=kids.find(e=>nb(e)==='content')?.getAttribute('src');
        put(src,txt);
      });
    }
  }
  if(!Object.keys(label).length){            // EPUB3 nav 문서
    const navHref=tags('item').find(i=>/\bnav\b/.test(i.getAttribute('properties')||''))
      ?.getAttribute('href');
    if(navHref){
      const navRaw=await get(base+decodeURIComponent(navHref)) || await get(base+navHref);
      if(navRaw) [...parseLoose(dec.decode(navRaw),'application/xhtml+xml')
        .getElementsByTagName('a')].forEach(a=>put(a.getAttribute('href'),a.textContent));
    }
  }
  /* 목차를 곧이곧대로 믿으면 안 된다. navPoint 23개가 전부 각주 본문인 책이 있었다
     (44~63자짜리 설명문, 그리고 ')1에' 같은 부스러기). 그것을 따르면 각주가 장
     제목이 되고 장이 엉뚱하게 쪼개진다.
     장 제목은 짧고, 그 안에서 문장이 끝나지 않는다 — 그 두 가지로 거른다.
     한 파일의 앵커 이름 중 절반도 제목답지 않으면 그 파일의 앵커는 통째로 버린다. */
  /* 번호는 제목의 일부다. '1. 우르수스' 를 마침표 뒤에 글이 이어진다는 이유로
     문장 취급하면, 번호를 붙여 짜 놓은 목차가 통째로 탈락한다 — 웃는 남자는
     navPoint 69개 중 55개가 그렇게 떨어져 나가 장이 69개에서 13개로 줄었다.
     그래서 앞머리 번호('1.' '12)' 'IV.' '가.')는 떼고 나서 문장인지 본다. */
  const ORD=/^\s*(?:\d{1,3}|[IVXLCDM]{1,7}|[ivxlcdm]{1,7}|[가-힣])\s*[.)]\s*/;
  const titleish=t=>{ t=String(t||'').trim().replace(ORD,'');
    return t.length>0 && t.length<=40 && !/[.。!?]\s/.test(t); };
  /* 목차는 통째로 판단한다. 한 항목씩 걸러 내면 좋은 이름과 부스러기가 섞여 남고,
     그 어중간한 상태가 가장 나쁘다 — 이름 있는 쪽만 장이 되고 나머지가 거기 붙어
     책 전체가 한 장(1,514문단)으로 뭉쳤다.
     쓸 만한 이름이 절반도 안 되면 목차를 믿지 않고 파일 단위로 나눈다. */
  const allLabels=Object.values(label)
    .concat(...Object.values(frag).map(o=>Object.values(o)));
  const good=allLabels.filter(titleish).length;
  if(allLabels.length && good*10 < allLabels.length*6){     // 60% 미만
    Object.keys(frag).forEach(k=>delete frag[k]);
    Object.keys(label).forEach(k=>delete label[k]);
  }else{
    Object.keys(frag).forEach(f=>{
      const v=Object.values(frag[f]);
      if(v.length && v.filter(titleish).length*2 < v.length) delete frag[f];
    });
    Object.keys(label).forEach(f=>{ if(!titleish(label[f])) delete label[f]; });
  }
  let lines=await read(spine);
  /* 이름은 남았는데 정작 글이 한 줄도 안 나온 경우도 되돌린다 —
     진짜 잣대는 '글이 나왔는가'이지 '이름이 남았는가'가 아니다. */
  if(!lines.length&&skipped) lines=await read(all);
  if(!lines.length) throw new Error('EPUB 에서 글을 한 줄도 읽지 못했어요');
  /* 차례 쪽을 걷어낸다. 한국 전자책은 '차례' 를 본문 쪽 하나로 넣어 두는데,
     이름만 봐서는 못 거른다 — mokcha.xhtml, Section0000.xhtml, 무엇이든 될 수 있다.
     그래서 글로 가린다: 그 쪽 글자의 대부분이 이 책 목차 이름 그대로면 차례다.
     짐작이 아니라 책이 스스로 밝힌 목차와 맞춰 보는 것이라 헛짚기 어렵다.
     (줄을 이어 붙이는 손질이 먼저 지나갈 수 있어서, 줄 단위가 아니라
      글자 단위로 얼마나 덮이는지를 본다.) */
  const bareT=x=>String(x||'').replace(/[\s.,·:;'"“”‘’()\[\]]/g,'');
  const tocNames=[...new Set(allLabels.map(bareT).filter(t=>t.length>=2))];
  if(tocNames.length>=5){
    const isTocDoc=d=>{
      const txt=bareT((d.lines||[]).map(l=>l.s).join(' '));
      if(txt.length<40) return false;
      let hit=0, cover=0;
      for(const n of tocNames) if(txt.includes(n)){ hit++; cover+=n.length; }
      return hit>=5 && cover*10>=txt.length*6;      // 글자의 60% 이상이 목차 이름
    };
    const keep=docs.filter(d=>!isTocDoc(d));
    /* 다 걸러졌으면 잘못 짚은 것이다 — 그럴 땐 손대지 않는다 */
    if(keep.length<docs.length && keep.some(d=>(d.lines||[]).length)){
      docs=keep;
      lines=[].concat(...docs.map(d=>d.lines||[]));
    }
  }
  const meta=t=>tags(t)[0]?.textContent?.trim()||'';
  docs.forEach(d=>{ d.title=label[decodeURIComponent(d.href)]||label[d.href]||''; });
  return {inp:{lines,pages:1,hasFont:false},docs,
          title:meta('title'), author:meta('creator')};
}
function txtLines(text){
  const lines=[];
  /* 구텐베르크 평문에는 삽화·판권 덩어리가 본문 사이에 섞여 있다.
     [Illustration: … [_Copyright 1894 by George Allen._]]
     대괄호가 다시 닫힐 때까지 통째로 건너뛴다 — 산문은 줄 첫머리를 '[' 로 열지 않는다. */
  let depth=0;
  text.split(/\r?\n/).forEach(raw=>{
    const s=raw.replace(/\s+/g,' ').trim();
    if(depth===0 && /^\[/.test(s)) depth=1, depth+=(s.match(/\[/g)||[]).length-1;
    else if(depth>0) depth+=(s.match(/\[/g)||[]).length;
    if(depth>0){
      depth-=(s.match(/\]/g)||[]).length;
      if(depth<0) depth=0;
      /* 오만과 편견은 장 제목이 삽화 덩어리의 마지막 줄이다:
           [Illustration: ·PRIDE AND PREJUDICE·   …   Chapter I.]
         덩어리를 통째로 버리면 1장이 통째로 사라지므로 제목 줄은 건져낸다. */
      const bare=s.replace(/^[\[\s_]+|[\]\s_]+$/g,'');
      if(bare && bare.length<60 && HEADISH.test(bare))
        lines.push({s:bare, x0:0, x1:bare.length, h:0, yp:0, p:1});
      else
        lines.push({s:'', x0:0, x1:0, h:0, yp:0, p:1});   // 문단 구분은 남긴다
      return;
    }
    lines.push({s, x0:/^\s/.test(raw)?20:0, x1:s.length, h:0, yp:0, p:1});
  });
  return {lines,pages:1,hasFont:false};
}

/* 쪽번호·반복 머리말 제거 — 같은 높이(y)에 같은 모양으로 반복되는 줄만 지운다.
   위치를 함께 보므로 본문 한가운데 있는 장 번호는 살아남는다. */
function stripFurniture(lines,pages){
  if(pages<4) return lines;
  const key=l=>Math.round(l.yp*40)+'|'+l.s.replace(/\d+/g,'#').toLowerCase();
  const cnt={};
  lines.forEach(l=>{ if(l.s.length<70) cnt[key(l)]=(cnt[key(l)]||0)+1; });
  const th=Math.max(4,pages*0.25);
  return lines.filter(l=>l.s.length>=70||cnt[key(l)]<=th);
}
/* 목차(Contents) 쪽은 통째로 버린다 — 제목 같은 줄이 몰려 있는 쪽 */
/* 목차 쪽 버리기 — 한 쪽에 제목꼴 줄이 잔뜩 모여 있으면 그 쪽이 목차다.
   쪽이 없는 TXT 는 파일 전체가 p=1 이라 이 셈이 성립하지 않는다.
   (그대로 두면 장이 6개만 넘어도 책 전체를 목차로 보고 통째로 버렸다) */
function dropTOC(lines,pages){
  if(pages>=4){                       // PDF — 제목꼴 줄이 잔뜩 있는 '쪽'이 목차다
    const per={};
    lines.forEach(l=>{ if(l.s.length<40&&HEADISH.test(l.s)) per[l.p]=(per[l.p]||0)+1; });
    const toc=new Set(Object.keys(per).filter(p=>per[p]>=6).map(Number));
    return toc.size? lines.filter(l=>!toc.has(l.p)) : lines;
  }
  /* TXT — 쪽이 없으니 '촘촘히 몰린 구간'으로 찾는다.
     목차에서는 제목줄이 서로 몇 줄 안에 붙어 있고, 본문에서는 수백 줄씩 떨어져 있다.
     목차 줄인지 본문 제목인지는 '뒤에 무엇이 오는가'로 가른다 —
     목차 줄 뒤에는 또 제목이 오고, 본문 제목 뒤에는 산문이 온다.
     (글자가 같은 줄을 지우는 방식도 해봤지만, Emma·두 도시 이야기처럼
      권마다 1장이 다시 나오는 책에서 진짜 1장 본문이 통째로 날아갔다) */
  const tocish=i=>{
    let seen=0;
    for(let k=i+1;k<lines.length&&seen<3;k++){
      const t=lines[k].s; if(!t) continue;
      seen++; if(HEADISH.test(t)) return true;
    }
    return false;
  };
  const idx=[];
  lines.forEach((l,i)=>{ if(l.s&&l.s.length<120&&HEADISH.test(l.s)&&tocish(i)) idx.push(i); });
  if(idx.length<6) return lines;
  const gap=i=>{ let n=0; for(let k=idx[i]+1;k<idx[i+1];k++) if(lines[k].s) n++; return n; };
  const cut=new Set();
  const flush=run=>{ if(run.length>=6) for(let k=run[0];k<=run[run.length-1];k++) cut.add(k); };
  let run=[idx[0]];
  for(let i=0;i<idx.length-1;i++){
    if(gap(i)<=3) run.push(idx[i+1]);
    else { flush(run); run=[idx[i+1]]; }
  }
  flush(run);
  return cut.size? lines.filter((_,i)=>!cut.has(i)) : lines;
}
function titleCase(s){
  s=String(s).replace(/^[\s\[\](){}.,;:*_-]+|[\s\[\](){}*_-]+$/g,'') || String(s);
  return s.toLowerCase().replace(/\b[a-z]/g,c=>c.toUpperCase())
    .replace(/\b(i{1,3}|iv|vi{0,3}|ix|xi{0,3})\b/gi,m=>m.toUpperCase())   // Part Ii → Part II
    .replace(/\bMc([a-z])/g,(m,c)=>'Mc'+c.toUpperCase());                 // Mcfadden → McFadden
}

/* EPUB 이 나눠 둔 쪽을 그대로 장으로 삼는다. 본문 글에서 장 제목을 하나도
   못 찾았을 때만 쓴다 — 글에서 찾을 수 있으면 그쪽이 더 정확하다.
   (구텐베르크 책은 한 파일에 여러 장이 들어 있어서, 쪽으로 나누면
   오만과 편견이 61장에서 14장으로 줄어든다) */
function docsToBook(docs,meta){
  const chapters=[];
  /* 목차에 이름이 있는 쪽에서 새 장을 열고, 이름 없는 쪽은 앞 장에 이어 붙인다.
     글 하나가 여러 파일로 쪼개져 있고 첫 파일에만 목차 이름이 붙은 책이 흔하다.
     쪽마다 장을 새로 열면 글 하나가 서너 토막으로 갈라지고, 뒤 토막에는 붙일
     이름이 없어 번호만 남는다. 목차가 곧 그 책이 스스로 밝힌 장 구분이다. */
  const labelled=docs.some(d=>String(d.title||'').trim()
    ||(d.lines||[]).some(l=>l.brk));
  /* 제목만 담고 본문은 한 줄도 없는 쪽이 있다 — 속표지처럼 글 이름만 크게 박아 둔
     쪽이다. 그런 쪽을 그냥 버리면 이름까지 같이 사라지고, 정작 본문이 든 다음 쪽은
     이름이 없어 앞 장에 붙어 버린다. 이름은 뒤따르는 본문의 것이니 넘겨준다. */
  let pending='';
  /* 한 파일 안에서도 목차가 가리킨 자리마다 장이 갈린다 (l.brk 가 그 표시).
     본문 파일 4개에 장 23개가 들어 있는 책이 있는데, 파일 단위로만 나누면
     10개가 한 장으로 뭉친다. */
  const pieces=[];
  docs.forEach(d=>{
    let cur={title:d.title||'',lines:[]};
    (d.lines||[]).forEach(l=>{
      if(l.brk!==undefined){ if(cur.lines.length||cur.title) pieces.push(cur);
        cur={title:l.brk||'',lines:[]}; return; }
      cur.lines.push(l);
    });
    pieces.push(cur);
  });
  pieces.forEach(d=>{
    const paras=d.lines.map(l=>l.s).filter(s=>s&&s.trim());
    let title=String(d.title||'').trim();
    if(!paras.length){ if(title) pending=title; return; }
    if(!title) title=pending;
    pending='';
    /* 이름을 어디서도 못 얻으면 첫 줄이 제목 노릇을 하는지 본다 — 짧은 한 줄이면
       제목으로 올리고 본문에서는 뺀다. */
    if(!title && paras.length>1 && paras[0].length<=40){ title=paras.shift(); }
    /* 목차 이름이 본문 첫 줄과 같으면 한 번만 보여 준다 — 목차가 가리키는 자리는
       대개 <h3> 제목 그 자체라, 그냥 두면 장마다 제목이 두 번 나온다.
       긴 제목은 <br/> 로 두 토막 나 있기도 해서(<h3>앞부분</h3><p>뒷부분</p>),
       앞에서부터 이어 붙여 제목이 되는 데까지 걷어낸다.
       본문이 그것뿐이면 남겨 둔다 — 지우면 빈 장이 된다 (부·권 표제지). */
    const bare=x=>String(x||'').replace(/\s+/g,'').replace(/[.,·:;'"“”‘’]/g,'');
    if(title && paras.length>1){
      const want=bare(title);
      let acc='';
      for(let k=0;k<paras.length-1&&k<4;k++){
        acc+=bare(paras[k]);
        if(acc===want){ paras.splice(0,k+1); break; }
        if(!want.startsWith(acc)) break;
      }
    }
    if(!title && labelled && chapters.length){    // 앞 장의 이어짐
      chapters[chapters.length-1].paras.push(...paras); return;
    }
    chapters.push({n:chapters.length+1,title:title||String(chapters.length+1),part:1,paras});
  });
  const words=chapters.reduce((a,c)=>
    a+c.paras.join(' ').split(/\s+/).filter(Boolean).length,0);
  return {id:meta.id,title:meta.title,author:meta.author,lang:meta.lang||'en',
          local:true,words,parts:{},chapters};
}
const clean=t=>String(t||'').replace(/^[\s\[\](){}.,;:*_-]+|[\s\[\](){}.,;:*_-]+$/g,'');
function linesToBook(inp,meta){
  let lines=stripFurniture(inp.lines,inp.pages);
  lines=dropTOC(lines,inp.pages);
  const med=a=>a.length? a.slice().sort((x,y)=>x-y)[Math.floor(a.length/2)] : 0;
  // 본문 글자 크기 = 긴 줄들의 중앙값. 이보다 확실히 크면 제목 줄로 본다.
  const bodyH=inp.hasFont? (med(lines.filter(l=>l.s.length>60).map(l=>l.h))||med(lines.map(l=>l.h))) : 0;
  const big=l=> inp.hasFont ? (bodyH>0 && l.h>=bodyH*1.15 && l.s.length<=44) : (l.s.length<60);
  const txt=lines.filter(l=>l.s);
  const xs=txt.map(l=>l.x0).sort((a,b)=>a-b);
  const rs=txt.map(l=>l.x1).sort((a,b)=>a-b);
  const mL=xs.length? xs[Math.floor(xs.length*0.2)] : 0;
  const mR=rs.length? rs[Math.floor(rs.length*0.8)] : 1e9;
  /* 줄을 훑어 장으로 나눈다. 한 번 훑어보고 장이 거의 안 나왔는데 'Book I' 같은
     파트 제목만 잔뜩이면, 그 책은 파트가 곧 장이다 — 그때만 다시 훑는다.
     (오디세이는 BOOK I~XXIV 가 장인데, 파트로 보면 본문이 서문 한 장에 통째로 뭉쳤다) */
  function scan(partsAsChapters){
  const chapters=[]; const partName={}; let part=1, cur=null, prev=null, numbered=0;
  const open=(title)=>{ cur={n:chapters.length+1,title,part,paras:[]}; chapters.push(cur); prev=null;
    if(/^(chapter|book)\s/i.test(title)) numbered++; };
  lines.forEach(l=>{
    const s=l.s;
    if(!s){ prev=null; return; }              // 빈 줄(txt) → 문단 구분
    if(big(l)){
      let m;
      if((m=s.match(RX_PART))){
        const pn=rnum(m[1])||wnum(m[1])||part+1;
        if(partsAsChapters){ open('Book '+pn); return; }
        part=pn; partName[part]=titleCase(s); return; }
      if(RX_TOCH.test(s)){ open('__toc__'); return; }   // 목차표 — 아래에서 버린다
      if(RX_HEAD.test(s)){ open(titleCase(s)); return; }
      if((m=s.match(RX_ORD))){ const n=onum(m[1]); if(n){ open('Chapter '+n); return; } }
      if((m=s.match(RX_CHAP))){ const n=rnum(m[1])||wnum(m[1]);
        const sub=clean(m[2]);
        open('Chapter '+(n||m[1])+(sub?' · '+sub:'')); return; }
      const wn=wnum(s); if(wn){ open('Chapter '+wn); return; }       // "ONE", "TWENTY-TWO"
      if(RX_NUM.test(s)){ open('Chapter '+s); return; }              // "1", "2"
      if((m=s.match(RX_NUMT)) && +m[1]===numbered+1){
        open('Chapter '+(+m[1])+' · '+clean(m[2])); return; }
      if((m=s.match(RX_ROMANT)) && rnum(m[1])===numbered+1){
        open('Chapter '+rnum(m[1])+' · '+clean(m[2])); return; }
      if((m=s.match(RX_ROMAN))){ const n=rnum(m[1]); if(n){ open('Chapter '+n); return; } }
      /* Stave One / Adventure I. / Section 1.
         뒤에 진짜 번호가 올 때만 장으로 연다 — 전에는 아무 낱말이나 받아서
         본문 속 "Letter ran…" 같은 짧은 줄이 장 제목이 되어 책이 두 동강 났다 */
      if((m=s.match(RX_SECT))){
        const n=rnum(m[2])||wnum(m[2]);
        if(n){ const sub=clean(m[3]);
          open(titleCase(m[1])+' '+n+(sub?' · '+sub:'')); return; } }
      if(inp.hasFont){ open(titleCase(s)); return; }                 // 그 밖의 큰 글씨 = 제목
    }
    if(!cur) open('Opening');
    const last=cur.paras[cur.paras.length-1];
    const brk = !last || RX_BREAK.test(s) ||
      (inp.hasFont ? (l.x0>mL+5 || (prev && prev.x1<mR-30)) : !prev);
    if(brk) cur.paras.push(s);
    else if(/[A-Za-z]-$/.test(last)) cur.paras[cur.paras.length-1]=last.slice(0,-1)+s;
    else cur.paras[cur.paras.length-1]=last+' '+s;
    prev=l;
  });
  return {chapters,partName};
  }
  const meaty=c=>c.paras.join(' ').split(/\s+/).filter(Boolean).length>=40;
  let {chapters,partName}=scan(false);
  /* 알맹이 있는 장이 둘 이하인데 파트는 넷 이상 — 파트가 곧 장인 책이다 */
  if(chapters.filter(c=>c.title!=='__toc__'&&meaty(c)).length<=2
     && Object.keys(partName).length>=4){
    ({chapters,partName}=scan(true));
  }
  // 목차 항목·속표지처럼 본문이 거의 없는 장은 버린다
  /* 목차표로 열린 장은 버린다 — 다만 그것밖에 없으면 그게 본문이다.
     장 제목이 하나도 없는 책(단편 모음 등)은 'Contents' 한 줄에 책 전체가 담긴다. */
  let kept=chapters.filter(c=>c.title!=='__toc__' && meaty(c));
  if(kept.length<2) kept=chapters.filter(meaty).map(c=>
    c.title==='__toc__'? Object.assign({},c,{title:'Opening'}) : c);
  if(!kept.length) throw new Error('본문을 찾지 못했어요');
  // 첫 구조적 제목(Prologue/Chapter/Part) 앞의 속표지·판권 페이지는 버린다
  const firstReal=kept.findIndex(c=>/^(prologue|chapter\s|part\s)/i.test(c.title));
  const body=firstReal>0? kept.slice(firstReal) : kept;
  // 파트 번호를 1..n 으로 정리
  const used=[...new Set(body.map(c=>c.part))].sort((a,b)=>a-b);
  const parts={};
  body.forEach((c,i)=>{
    const np=used.indexOf(c.part)+1;
    if(used.length>1) parts[np]=partName[c.part]||('Part '+np);
    c.part=used.length>1?np:1; c.n=i+1;
  });
  const words=body.reduce((a,c)=>a+c.paras.join(' ').split(/\s+/).filter(Boolean).length,0);
  /* lang 은 부르는 쪽이 정한다 — 한국 문학 서재는 'ko' 를 넘긴다 */
  return {id:meta.id,title:meta.title,author:meta.author,lang:meta.lang||'en',local:true,words,parts,chapters:body};
}
/* 내가 넣은 책의 id 앞에 붙는 표. 저장소에서 온 책과 구분한다.
   fileId 가 쓰므로 여기에 둔다 — index.html 에서도 이 이름을 쓴다. */
const LP='local:';
/* 파일 내용(SHA-256)으로 id 를 만든다.
   같은 책을 다시 넣어도 같은 id 가 나오므로 읽던 진도·단어가 그대로 이어진다.
   (crypto.subtle 은 https/localhost 에서만 동작 — 아니면 시간값으로 대체) */
async function fileId(file){
  try{
    const h=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());
    return LP+[...new Uint8Array(h)].slice(0,8).map(b=>b.toString(16).padStart(2,'0')).join('');
  }catch(e){ return LP+Date.now().toString(36); }
}
