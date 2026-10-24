(() => {
'use strict';
const hand = `<g class="demo-hand" fill="#edc3a5" stroke="#9b6951" stroke-width="2.5" stroke-linejoin="round"><path d="M180 322l-9-42q-2-10 5-12 6-1 9 9l4 17-2-54q0-9 6-9t7 9l3 40 2-52q0-9 6-9t7 9l1 51 5-41q1-8 7-7t5 9l-2 49 8-24q3-8 9-5t3 10l-12 48-10 23z"/><path d="M184 295q15-14 30-1" fill="none" opacity=".4"/></g>`;
function scene(kind){
 const leg = `<path d="M188 85q-24 54-17 109l13 118-26 47q-7 14 8 18 18 4 39-3l29-12q9-7-2-12l-18-6 6-123q20-71 12-130" fill="#f4d9c4" stroke="#af846b" stroke-width="3"/><ellipse cx="211" cy="90" rx="28" ry="10" fill="#edd0b9"/><path class="demo-arrow" d="M267 311V151m-13 15 13-15 13 15" fill="none" stroke="#b57a2a" stroke-width="6" stroke-linecap="round"/>`;
 const room = `<path d="M90 160l110-75 110 75v175H90z" fill="#f6eee1" stroke="#53705c" stroke-width="4"/><path d="M132 164h136v100H132z" fill="#fff" stroke="#53705c" stroke-width="4"/><path d="M200 164v100" stroke="#53705c" stroke-width="4"/><g class="demo-air" fill="none" stroke="#76a5a5" stroke-width="5"><path d="M110 206h165q25 0 25-17t-20-9"/><path d="M106 228h150q24 0 24 17t-19 9"/></g>`;
 const palms = `<path d="M73 304q30-18 64-23l70-8q15 0 10 10l-45 15 73-4q16 0 14 10l-68 12 56-2q15 1 8 11l-59 14-85 8z" fill="#f4d9c4" stroke="#af846b" stroke-width="3"/>${hand}`;
 const shoulder = `<circle cx="205" cy="139" r="36" fill="#f4d9c4" stroke="#af846b" stroke-width="3"/><path d="M190 173v25l-71 32-20 106h212l-20-106-71-32v-25" fill="#d7e5d4" stroke="#53705c" stroke-width="3"/><path d="M164 228l-30 51m108-51 30 51" stroke="#b57a2a" stroke-width="4"/><g class="demo-release"><path d="M150 200l-18-18m125 18 18-18" stroke="#b57a2a" stroke-width="5"/></g>`;
 return `<svg viewBox="0 0 400 420" aria-hidden="true"><circle cx="200" cy="218" r="163" fill="#f4f0e4"/>${kind==='leg'?`<g class="demo-leg">${leg}${hand}</g><g class="demo-mix"><path d="M99 250h202q-8 82-101 82t-101-82" fill="#fff" stroke="#af846b" stroke-width="4"/><ellipse cx="200" cy="250" rx="100" ry="20" fill="#e4bf67"/><path class="demo-drop" d="M200 135q-37 52-16 64 16 13 32-2 18-16-16-62" fill="#d4a13d"/><path class="demo-stir" d="M160 254q40-15 80 0" fill="none" stroke="#fff7d9" stroke-width="5"/></g>`:kind==='room'?room:kind==='hands'?palms:shoulder}</svg>`;
}
const lessons={
 frost:{kind:'leg',label:'霜降・絲柏腿部放鬆',steps:[['01 調配按摩油','準備分餾椰子油與絲柏精油，依產品標示確認外用稀釋方式並混合均勻。先做局部肌膚測試；敏感肌膚與熟齡者需另確認適合的濃度。'],['02 均勻塗抹','取少量按摩油，以掌心溫熱，再輕抹小腿與腳踝。動畫為手法示意，可隨時暫停。'],['03 由下往上輕推','雙手包覆小腿，從腳踝往膝蓋方向緩慢輕推；回程放鬆。重複 3–5 次，以舒適、不疼痛為原則。']]},
 self:{kind:'leg',label:'照顧自己・腿部放鬆',steps:[['01 準備','坐穩、讓小腿放鬆，先確認肌膚沒有傷口或不適。'],['02 輕抹','少量稀釋按摩油先局部測試，再均勻輕抹。'],['03 輕推','從腳踝向膝蓋輕推，回程放鬆；動作舒適即可。']]},
 family:{kind:'room',label:'照顧家人・空間通風',steps:[['01 看環境','先辨認潮濕、煙霧或刺激氣味的來源。'],['02 讓空氣流動','依環境開窗或啟動對外排風，先處理來源。'],['03 一起確認','詢問家人是否舒服，保留無香空間；香氣不能取代通風。']]},
 elder:{kind:'hands',label:'陪伴長輩・手部輕撫',steps:[['01 先詢問','先取得長輩同意，詢問是否接受觸碰與氣味。'],['02 承托手部','以一手穩穩承托，先確認肌膚完整；需要用油時先稀釋並測試。'],['03 溫柔輕撫','另一手在手背緩慢輕撫，不深壓、不拉扯；隨時詢問感受。']]},
 workplace:{kind:'shoulder',label:'照顧公司同仁・肩膀放鬆',steps:[['01 坐穩','雙腳踩地，雙手自然放在腿上。'],['02 輕輕提肩','在舒適範圍內輕提雙肩，配合自然呼吸，不憋氣。'],['03 慢慢放下','吐氣時慢慢放下肩膀；不勉強、不疼痛，可選擇全程無香。']]}
};
let serial=0;
function mount(host,key){
 if(!host)return;
 const lesson=lessons[key], id=++serial;
 host.innerHTML=`<div class="motion-demo" data-kind="${lesson.kind}" data-step="0"><div class="demo-visual">${scene(lesson.kind)}<span class="demo-caption">動作示意・依舒適度調整</span></div><div class="demo-copy"><small>跟著動畫・一步一步來</small><h3>${lesson.label}</h3><div class="demo-tabs" role="group" aria-label="選擇示範步驟">${lesson.steps.map((s,i)=>`<button type="button" data-demo-step="${i}" aria-pressed="${i===0}">${s[0]}</button>`).join('')}</div><h4 id="demo-title-${id}"></h4><p class="demo-text" aria-live="polite"></p><div class="demo-controls"><button type="button" data-play>播放示範</button><button type="button" data-prev>上一步</button><button type="button" data-next>下一步</button><button type="button" data-reset>重播</button></div><p class="demo-progress"></p></div><div class="demo-watermark">小水滴芳香生活｜Little Drop Aroma Life</div></div>`;
 const box=host.firstElementChild,play=box.querySelector('[data-play]');let step=0,timer=null,playing=false,elapsed=0;
 function stop(){clearInterval(timer);timer=null;playing=false;box.classList.remove('playing');play.textContent='播放示範';}
 function show(){box.dataset.step=step;box.querySelector('h4').textContent=lesson.steps[step][0];box.querySelector('.demo-text').textContent=lesson.steps[step][1];box.querySelector('.demo-progress').textContent=`步驟 ${step+1} / 3 · 每步示範 8 秒`;box.querySelectorAll('[data-demo-step]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===step)));box.querySelector('[data-prev]').disabled=step===0;box.querySelector('[data-next]').disabled=step===2;}
 function start(){if(playing){stop();return;}playing=true;box.classList.add('playing');play.textContent='暫停';timer=setInterval(()=>{if(!document.contains(box)){stop();return;}elapsed++;if(elapsed>=8){elapsed=0;if(step===2){stop();box.querySelector('.demo-progress').textContent='示範完成・可重播，或選擇步驟練習';return;}step++;show();}},1000);}
 box.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-play'))start();else if(b.hasAttribute('data-reset')){stop();step=0;elapsed=0;show();start();}else {stop();elapsed=0;if(b.hasAttribute('data-demo-step'))step=Number(b.dataset.demoStep);if(b.hasAttribute('data-prev'))step=Math.max(0,step-1);if(b.hasAttribute('data-next'))step=Math.min(2,step+1);show();}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)stop();});show();
}
mount(document.querySelector('#frostDemo'),'frost');
const choices=document.querySelector('#careChoices');
if(choices)choices.addEventListener('click',e=>{const b=e.target.closest('[data-care-choice]');if(!b)return;let host=document.querySelector('#routeMotion');if(!host){host=document.createElement('div');host.id='routeMotion';document.querySelector('#careRoute').append(host);}mount(host,b.dataset.careChoice);});
})();
