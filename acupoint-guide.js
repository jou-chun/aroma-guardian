(() => {
  const routes = [
    {id:"sleep",icon:"☾",name:"睡眠與夜間放鬆",short:"入睡儀式・安定空間",summary:"從固定睡前節奏、光線與安靜空間開始，再選擇溫和的芳香陪伴。",color:"#7a7697",soft:"#eeecf5",links:[["睡眠專題","#sleep"],["百會","point:baihui"],["湧泉","point:yongquan"]]},
    {id:"breath",icon:"〜",name:"呼吸與清新感",short:"通風環境・舒適呼吸",summary:"先確認空氣是否流通、有無煙霧或刺激來源，再用輕柔方式營造清新感。",color:"#4f817f",soft:"#e1f0ed",links:[["生活防護網","#toxins"],["膻中","point:danzhong"],["缺盆","point:quepen"]]},
    {id:"movement",icon:"↗",name:"痠痛與活動放鬆",short:"肩頸・腰腿・日常活動",summary:"先分辨是一般緊繃還是受傷警訊；日常可從休息、溫和活動與輕柔按觸開始。",color:"#a36e58",soft:"#f6e9e1",links:[["霜降腿部照護","#seasonal"],["肩井","point:jianjing"],["缺盆","point:quepen"],["委中","point:weizhong"],["合谷","point:hegu"]]},
    {id:"emotion",icon:"♡",name:"情緒與壓力舒緩",short:"停一下・回到呼吸",summary:"用短暫停頓、緩慢呼吸與熟悉香氣，為自己保留一段不需要表現的時間。",color:"#9a708f",soft:"#f2e8ef",links:[["日常主題","#topics"],["百會","point:baihui"],["膻中","point:danzhong"]]},
    {id:"digestion",icon:"○",name:"消化與腹部照護",short:"飲食節奏・輕柔腹部陪伴",summary:"先留意飲食、排便與壓力變化；腹部只適合輕柔接觸，不以疼痛換取效果。",color:"#a57c3f",soft:"#f5eedb",links:[["中脘","point:zhongwan"],["足三里","point:zusanli"],["關元","point:guanyuan"]]},
    {id:"circulation",icon:"⇅",name:"循環與腿部照護",short:"久坐久站・足部放鬆",summary:"從起身活動、補充水分與舒適姿勢開始；腿部按摩保持輕柔並避開異常腫痛。",color:"#557e68",soft:"#e4eee6",links:[["腿部放鬆示範","#seasonal"],["足三里","point:zusanli"],["三陰交","point:sanyinjiao"],["湧泉","point:yongquan"]]},
    {id:"focus",icon:"✦",name:"專注與日間活力",short:"工作節奏・清醒感",summary:"先補足休息、光線、飲水與短暫活動，再用氣味作為切換工作狀態的提示。",color:"#b17b35",soft:"#f8eedc",links:[["精油資料庫","#oils"],["百會","point:baihui"],["合谷","point:hegu"]]},
    {id:"skin",icon:"◇",name:"肌膚與手部照護",short:"屏障保護・溫柔觸碰",summary:"先減少刺激、保留肌膚屏障；外用產品與精油都應先稀釋並做局部測試。",color:"#a66f73",soft:"#f6e8e8",links:[["陪伴長輩","#elder-care"],["生活防護網","#toxin-skin-exposure"],["合谷","point:hegu"]]},
    {id:"home",icon:"⌂",name:"居家與戶外防護",short:"環境來源・安全使用",summary:"先處理通風、潮濕、清潔劑與容器等暴露來源，芳香不能代替清潔、消毒或醫療。",color:"#4f7563",soft:"#e2ede5",links:[["五大生活暴露","#toxins"],["安全使用","#safety"],["精油資料庫","#oils"]]}
  ];

  const points = [
    {id:"baihui",name:"百會",code:"BAIHUI · GV20",region:"頭頂",x:50,y:3,index:"01",location:"在頭頂中央附近，可想像兩耳最高點向上連線，與頭部正中線相交的大約位置。",care:"傳統自我照護中，常作為安定、放鬆與頭部覺察的參考位置。",steps:["以指腹輕放在頭頂中央。","緩慢呼吸，輕柔停留約 10～20 秒。","感覺舒適即可，不必追求痠、麻或痛感。"],related:["sleep","emotion","focus"],warning:"頭部有外傷、腫痛、近期手術或原因不明的劇烈頭痛時，不要自行按觸，請先就醫。"},
    {id:"jianjing",name:"肩井",code:"JIANJING · GB21",region:"肩頸部",x:31,y:23,index:"02",location:"位於肩膀上方，大約在頸根與肩峰外側連線的中點；左右各一。",care:"傳統自我照護中，常用來陪伴肩頸緊繃與久坐後的身體覺察。",steps:["先放鬆肩膀，不聳肩。","用對側手指腹輕輕捏按肩上肌肉。","每次短暫停留，覺得舒服就好。"],related:["movement"],warning:"孕期不自行按壓肩井；肩頸有外傷、手臂麻木無力或疼痛加重時停止並尋求評估。"},
    {id:"quepen",name:"缺盆",code:"QUEPEN · ST12",region:"鎖骨上方",x:40,y:25,index:"03",location:"位於鎖骨上方較大的凹陷區域，距身體前正中線約四寸；個人體型與寸量需由專業人員判定。左右各一。",care:"傳統穴位資料中屬足陽明胃經，位於頸胸交界；日常只適合配合呼吸做非常輕柔的表面接觸。",steps:["肩膀放鬆，先找到鎖骨上緣凹陷。","只以指腹輕放在皮膚表面，不向內深壓。","配合一次緩慢呼吸後移開。"],related:["breath","movement"],warning:"此處接近重要神經、血管與肺尖，不可深壓。若有胸痛、呼吸困難、頸部腫塊、手臂麻木或不明疼痛，請停止並尋求醫療評估。"},
    {id:"danzhong",name:"膻中",code:"DANZHONG · CV17",region:"胸前",x:50,y:29,index:"04",location:"位於胸骨正中線，約在兩側乳頭連線的中央附近；只以胸骨表面作定位參考。",care:"傳統自我照護中，可配合緩慢呼吸，作為胸前放鬆與身體覺察的位置。",steps:["手掌輕放胸骨中央，不用力壓。","吸氣時感受胸口起伏，吐氣稍微放慢。","做 3 次舒適呼吸後放開。"],related:["breath","emotion"],warning:"若有胸痛、胸悶、呼吸困難、冒冷汗或不適延伸到手臂與下顎，請立刻尋求醫療協助，不要按穴等待。"},
    {id:"zhongwan",name:"中脘",code:"ZHONGWAN · CV12",region:"上腹部",x:50,y:41,index:"05",location:"位於腹部正中線，肚臍上方約四橫指寬的區域；個人體型不同，以大約位置理解即可。",care:"傳統自我照護中，常作為飲食後腹部舒適與消化節奏的覺察位置。",steps:["坐著或躺著，先讓腹部放鬆。","以溫暖手掌輕放，不做深壓。","配合自然呼吸停留片刻。"],related:["digestion"],warning:"急性或不明原因腹痛、發燒、嘔吐、懷孕、近期腹部手術時，不要自行按壓。"},
    {id:"guanyuan",name:"關元",code:"GUANYUAN · CV4",region:"下腹部",x:50,y:53,index:"06",location:"位於腹部正中線，肚臍下方約三橫指寬的區域；以大約位置作日常覺察即可。",care:"傳統自我照護中，常以手掌溫暖覆蓋，作為下腹放鬆與休息的陪伴。",steps:["搓暖雙手後覆在下腹。","只用手掌重量，不向內深壓。","自然呼吸 3～5 次後移開。"],related:["digestion"],warning:"孕期、急性腹痛、異常出血或近期腹部手術時不要自行按壓，請先詢問專業人員。"},
    {id:"hegu",name:"合谷",code:"HEGU · LI4",region:"手背",x:15,y:66,index:"07",meridian:"手陽明大腸經",meridianLabel:"大腸經",meridianRoute:"從手部往上，沿手臂到肩頸，再到鼻旁。",location:"位於手背，拇指與食指掌骨之間的肌肉隆起處；左右手各一。",care:"傳統自我照護中，常作為手部放鬆與日間精神轉換的參考位置。",steps:["手掌放鬆，用另一手拇指找到虎口肌肉。","輕輕按住或畫小圈，不捏到疼痛。","短暫按觸後換手。"],related:["movement","focus","skin"],warning:"孕期不自行按壓合谷；手部受傷、紅腫、麻木或疼痛不明時先停止。"},
    {id:"zusanli",name:"足三里",code:"ZUSANLI · ST36",region:"小腿外側",x:62,y:67,index:"08",location:"在膝蓋外側下方約四橫指寬，脛骨前緣外側的肌肉處；左右腿各一。",care:"傳統自我照護中，常用於日常活動後的腿部陪伴與身體節奏覺察。",steps:["坐穩後讓小腿放鬆。","以指腹在膝下外側肌肉輕按。","感覺舒適即可，左右各短暫停留。"],related:["digestion","circulation","focus"],warning:"膝腿若突然腫、熱、紅、劇痛，或近期受傷與手術，請不要按摩並先就醫評估。"},
    {id:"sanyinjiao",name:"三陰交",code:"SANYINJIAO · SP6",region:"小腿內側",x:42,y:80,index:"09",meridian:"足太陰脾經",meridianLabel:"脾經",meridianRoute:"從大拇趾出發，經內踝，沿小腿內側往上。",location:"位於內踝最高點上方約四橫指寬，脛骨內側後緣附近；左右腿各一。",care:"傳統自我照護中，常作為下肢放鬆與休息時的覺察位置。",steps:["坐著露出內踝上方位置。","用指腹輕貼脛骨內側後緣。","短暫輕按後放開，不追求強烈感受。"],related:["circulation"],warning:"孕期不自行按壓三陰交；小腿有不明腫痛、靜脈問題或傷口時請先詢問專業人員。"},
    {id:"weizhong",name:"委中",code:"WEIZHONG · BL40",region:"膝後",x:64,y:65,index:"10",location:"位於膝蓋後方橫紋的中央附近。此處有重要血管與神經，只作位置認識。",care:"傳統照護資料常提到此穴與腰腿活動的關聯，但自行照護只適合非常輕柔的接觸。",steps:["坐下並讓膝蓋自然彎曲。","只用指腹輕觸膝後橫紋中央。","不要深壓、重揉或長時間停留。"],related:["movement"],warning:"膝後不可深壓。若腿部腫、熱、紅、疼痛，或懷疑血管問題，請停止按摩並立即尋求醫療評估。"},
    {id:"yongquan",name:"湧泉",code:"YONGQUAN · KI1",region:"足底",x:39,y:96,index:"11",location:"位於腳底前段，腳趾微微彎曲時，足底前方較明顯的凹陷附近；左右腳各一。",care:"傳統自我照護中，常以輕柔足部按摩作為睡前安定與腳底放鬆的陪伴。",steps:["坐穩後把腳放在容易觸及的位置。","以拇指腹輕柔畫圈或停留。","完成後穿上止滑鞋襪，避免立即踩滑。"],related:["sleep","circulation"],warning:"足底有傷口、感染、感覺遲鈍或糖尿病足風險者，不要自行用力按摩，請先詢問醫療專業人員。"},
    {id:"taichong",name:"太衝",code:"TAICHONG · LR3",region:"腳背",x:62,y:96,index:"12",meridian:"足厥陰肝經",meridianLabel:"肝經",meridianRoute:"從腳背往上，經過小腿與大腿內側。",location:"在腳背，大拇趾與第二趾之間，沿兩根腳掌骨往腳踝方向摸，在兩骨交會前的凹陷處。",care:"先認識太衝在腳背的位置。左右腳各有一個太衝。",steps:["坐穩，把一隻腳放在容易看見的位置。","從大拇趾與第二趾之間，沿腳背往腳踝方向找。","找到大約位置就好，手指輕放即可。"],related:["circulation"],warning:"腳背有傷口、紅腫、疼痛或感覺異常時，先避免按觸。"},
    {id:"shaoshang",name:"少商",code:"SHAOSHANG · LU11",region:"拇指",x:84,y:68,index:"13",meridian:"手太陰肺經",meridianLabel:"肺經",meridianRoute:"從前胸沿手臂內側一路走到拇指。",location:"在拇指末端，靠拇指外側的指甲角旁。",care:"先用拇指的指甲角當地標，認識肺經走到手指的位置。",steps:["把手放鬆，找到拇指指甲。","看拇指外側的指甲角旁，辨認位置即可。"],related:["breath"],warning:"指甲周圍若有傷口或紅腫，請避免按壓。"},
    {id:"shenmen",name:"神門",code:"SHENMEN · HT7",region:"手腕掌側",x:20,y:57,index:"14",meridian:"手少陰心經",meridianLabel:"心經",meridianRoute:"心經的體表路線沿手臂內側到手腕的小指側，再往小指。",location:"手掌朝上，找手腕橫紋的小指側，神門在尺側腕屈肌腱的拇指側凹陷。",care:"先認手腕橫紋和小指側的位置，可配合自然呼吸。",steps:["把前臂放在桌上，掌心朝上。","沿手腕橫紋往小指側找，指腹輕放片刻。"],related:["sleep","emotion"],warning:"手腕有傷口、腫痛或麻木時，先避免按觸。"},
    {id:"neiguan",name:"內關",code:"NEIGUAN · PC6",region:"前臂掌側",x:77,y:55,index:"15",meridian:"手厥陰心包經",meridianLabel:"心包經",meridianRoute:"心包經的體表路線從胸部沿手臂內側到手掌，再往中指。",location:"手掌朝上，在手腕掌側橫紋往手肘約兩寸，位於兩條肌腱之間。",care:"用手腕橫紋作地標，認識前臂掌側的位置。",steps:["把手掌翻向上。","從掌側腕橫紋往手肘找，可用自己約三指寬作粗略參考。","找到兩筋間後，指腹輕放即可。"],related:["emotion","digestion"],warning:"按觸若引起刺痛或麻感，請放開。"}
  ];

  const routeGrid = document.querySelector("#needRouteGrid");
  const routeResult = document.querySelector("#needRouteResult");
  const pointDots = document.querySelector("#acupointDots");
  if (!routeGrid || !routeResult || !pointDots) return;

  const routeName = document.querySelector("#needRouteName");
  const routeSummary = document.querySelector("#needRouteSummary");
  const routeKicker = document.querySelector("#needRouteKicker");
  const routeLinks = document.querySelector("#needRouteLinks");
  const moreButton = document.querySelector("#needMore");
  const card = document.querySelector("#acupointCard");
  const mapPanel = document.querySelector(".acupoint-map-panel");
  const dropWalker = document.querySelector("#dropWalker");
  const dropGuideText = document.querySelector("#dropGuideText");
  const dropRouteSvg = document.querySelector("#dropRouteSvg");
  const dropRoutePath = document.querySelector("#dropRoutePath");
  const dropRouteTarget = document.querySelector("#dropRouteTarget");
  const seriesArticles = {
    arborvitae: {name:"側柏",points:["hegu","taichong"]},
    basil: {name:"羅勒",points:["sanyinjiao"]},
    cardamom: {name:"豆蔻",points:["sanyinjiao"]},
    eucalyptus: {name:"尤加利",points:["shaoshang"]},
    fennel: {name:"甜茴香",points:["sanyinjiao"]},
    geranium: {name:"天竺葵",points:["taichong"]},
    jasmine: {name:"茉莉",points:["shenmen"]},
    oregano: {name:"牛至",points:["taichong"]},
    "helichrysum": {"name": "永久花", "points": ["taichong"]},
    "lavender": {"name": "薰衣草", "points": ["sanyinjiao", "shenmen"]},
    "marjoram": {"name": "馬鬱蘭", "points": ["sanyinjiao", "shenmen"]},
    "neroli": {"name": "橙花", "points": ["shenmen"]},
    "patchouli": {"name": "廣藿香", "points": ["sanyinjiao"]},
    "roman-chamomile": {"name": "羅馬洋甘菊", "points": ["neiguan"]},
    "sandalwood": {"name": "檀香", "points": ["sanyinjiao"]},
    "thyme": {"name": "百里香", "points": ["hegu"]},
    "vetiver": {"name": "岩蘭草", "points": ["shenmen"]},
    "wild-orange": {"name": "野橘", "points": ["taichong"]},
    "ylang-ylang": {"name": "依蘭依蘭", "points": ["sanyinjiao"]}
  };
  const pointDefaults = {hegu:"arborvitae",taichong:"arborvitae",sanyinjiao:"basil",shaoshang:"eucalyptus",shenmen:"vetiver",neiguan:"roman-chamomile"};
  const query = new URLSearchParams(window.location.search);
  const mapPointLabel = document.querySelector("#mapPointLabel");
  const meridianCaption = document.querySelector("#meridianCaption");
  const meridianButtons = document.querySelectorAll("[data-meridian-point]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let currentPoint = 0;
  let walkerPosition = {x:22,y:22};
  let walkerAnimation;
  let routeAnimation;
  let resizeTimer;
  let mapSize = {width:0,height:0};

  routeGrid.innerHTML = routes.map((route,index) => `<button class="need-route" type="button" data-route="${route.id}" aria-pressed="false" ${index > 5 ? "hidden" : ""} style="--route:${route.color};--route-soft:${route.soft}"><span class="need-route-icon" aria-hidden="true">${route.icon}</span><b>${route.name}</b><small>${route.short}</small></button>`).join("");

  function moveDropToPoint(point, replayFromStart = false, animate = true, explicitPlayback = false) {
    const dot = pointDots.querySelector(`[data-point="${point.id}"]`);
    if (!dot || !mapPanel || !dropWalker || !dropRouteSvg || !dropRoutePath || !dropRouteTarget) return;
    if (walkerAnimation) walkerAnimation.cancel();
    if (routeAnimation) routeAnimation.cancel();
    dropWalker.classList.remove("is-walking");

    const panelRect = mapPanel.getBoundingClientRect();
    mapSize = {width:panelRect.width,height:panelRect.height};
    const dotRect = dot.getBoundingClientRect();
    const walkerSize = dropWalker.offsetWidth;
    const home = {x:parseFloat(getComputedStyle(dropWalker).left) || 22,y:parseFloat(getComputedStyle(dropWalker).top) || 22};
    const pointCenter = {x:dotRect.left - panelRect.left + dotRect.width / 2,y:dotRect.top - panelRect.top + dotRect.height / 2};
    const start = replayFromStart ? home : walkerPosition;
    const placeRight = pointCenter.x > panelRect.width * .55;
    const destination = {
      x:Math.max(14,Math.min(panelRect.width - walkerSize - 14,placeRight ? pointCenter.x + 44 : pointCenter.x - walkerSize - 44)),
      y:Math.max(92,Math.min(panelRect.height - walkerSize - 42,pointCenter.y - walkerSize * .5))
    };
    const startCenter = {x:start.x + walkerSize / 2,y:start.y + walkerSize / 2};
    const destinationCenter = {x:destination.x + walkerSize / 2,y:destination.y + walkerSize / 2};
    const bend = Math.max(28,Math.min(72,Math.abs(destinationCenter.x - startCenter.x) * .22));
    const control = {x:(startCenter.x + destinationCenter.x) / 2,y:Math.min(startCenter.y,destinationCenter.y) - bend};

    dropGuideText.textContent = `小水滴正帶你走到「${point.name}」`;
    dropRouteSvg.setAttribute("viewBox",`0 0 ${panelRect.width} ${panelRect.height}`);
    dropRoutePath.setAttribute("d",`M ${startCenter.x} ${startCenter.y} Q ${control.x} ${control.y} ${destinationCenter.x} ${destinationCenter.y} L ${pointCenter.x} ${pointCenter.y}`);
    dropRouteTarget.setAttribute("cx",pointCenter.x);
    dropRouteTarget.setAttribute("cy",pointCenter.y);
    const routeLength = dropRoutePath.getTotalLength();
    dropRoutePath.style.strokeDasharray = `${routeLength}`;
    dropRoutePath.style.strokeDashoffset = `${routeLength}`;
    dropRouteSvg.classList.remove("is-drawing");
    void dropRouteSvg.getBoundingClientRect();
    dropRouteSvg.classList.add("is-drawing");

    const shouldAnimate = animate && (!reduceMotion.matches || explicitPlayback);
    if (replayFromStart) {
      walkerPosition = home;
      dropWalker.style.transform = `translate(${home.x - home.x}px,${home.y - home.y}px)`;
    }
    if (!shouldAnimate) {
      dropWalker.style.transform = `translate(${destination.x - home.x}px,${destination.y - home.y}px)`;
      dropRoutePath.style.strokeDashoffset = "0";
      walkerPosition = destination;
      dropGuideText.textContent = `小水滴已帶你找到「${point.name}」`;
      return;
    }

    const frames = Array.from({length:9},(_,index) => {
      const t = index / 8;
      const x = (1-t)*(1-t)*start.x + 2*(1-t)*t*(control.x-walkerSize/2) + t*t*destination.x;
      const y = (1-t)*(1-t)*start.y + 2*(1-t)*t*(control.y-walkerSize/2) + t*t*destination.y;
      return {transform:`translate(${x-home.x}px,${y-home.y}px)`,offset:t};
    });
    dropWalker.classList.add("is-walking");
    routeAnimation = dropRoutePath.animate([{strokeDashoffset:routeLength},{strokeDashoffset:0}],{duration:2100,easing:"ease-in-out",fill:"forwards"});
    walkerAnimation = dropWalker.animate(frames,{duration:1900,easing:"cubic-bezier(.45,.05,.2,1)",fill:"forwards"});
    walkerAnimation.addEventListener("finish",() => {
      dropWalker.style.transform = `translate(${destination.x-home.x}px,${destination.y-home.y}px)`;
      dropWalker.classList.remove("is-walking");
      dropGuideText.textContent = `小水滴已帶你找到「${point.name}」`;
    },{once:true});
    walkerPosition = destination;
  }

  function selectPoint(id, shouldScroll = false, replayFromStart = false, explicitPlayback = false) {
    const index = points.findIndex(point => point.id === id);
    if (index < 0) return;
    const repeatPoint = currentPoint === index;
    currentPoint = index;
    const point = points[index];
    document.querySelectorAll(".acupoint-dot").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.point === id)));
    meridianButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.meridianPoint === id)));
    mapPointLabel.hidden = meridianCaption.hidden = !point.meridian;
    if (point.meridian) {
      mapPointLabel.classList.toggle("is-left", point.x > 70);
      mapPointLabel.style.left = `${point.x}%`;
      mapPointLabel.style.top = `${point.y}%`;
      mapPointLabel.querySelector("strong").textContent = point.name;
      mapPointLabel.querySelector("span").textContent = point.meridianLabel;
      meridianCaption.querySelector("strong").textContent = point.meridian;
      meridianCaption.querySelector("span").textContent = point.meridianRoute;
      const articleLink = meridianCaption.querySelector("a");
      const source = query.get("series");
      const article = Object.hasOwn(seriesArticles, source) && seriesArticles[source].points.includes(id) ? source : pointDefaults[id];
      articleLink.href = `./${article}.html#meridian-title`;
      articleLink.textContent = `看${seriesArticles[article].name}篇的經絡對照 →`;
    }
    document.querySelector("#acupointRegion").textContent = point.region;
    document.querySelector("#acupointName").textContent = point.name;
    document.querySelector("#acupointPinyin").textContent = point.code;
    document.querySelector("#acupointIndex").textContent = point.index;
    document.querySelector("#acupointLocation").textContent = point.location;
    document.querySelector("#acupointCare").textContent = point.care;
    document.querySelector("#acupointSteps").innerHTML = point.steps.map(step => `<li>${step}</li>`).join("");
    document.querySelector("#acupointRelated").innerHTML = point.related.map(id => `<button type="button" data-related-route="${id}">${routes.find(route => route.id === id).name}</button>`).join("");
    document.querySelector("#acupointWarning").innerHTML = `<b>這個位置特別注意：</b>${point.warning}`;
    card.classList.remove("is-changing");
    void card.offsetWidth;
    card.classList.add("is-changing");
    document.querySelectorAll("[data-related-route]").forEach(button => button.addEventListener("click", () => {
      selectRoute(button.dataset.relatedRoute);
      document.querySelector("#needRoutes").scrollIntoView({behavior:"smooth",block:"start"});
    }));
    requestAnimationFrame(() => moveDropToPoint(point,replayFromStart || repeatPoint,true,explicitPlayback));
    if (shouldScroll) document.querySelector("#acupoints").scrollIntoView({behavior:"smooth",block:"start"});
  }

  function makeLink(label, destination) {
    if (destination.startsWith("point:")) return `<button type="button" data-point-link="${destination.slice(6)}">看 ${label}</button>`;
    return `<a href="${destination}">${label} →</a>`;
  }

  function selectRoute(id) {
    const route = routes.find(item => item.id === id);
    if (!route) return;
    if (routes.indexOf(route) > 5 && !moreButton.getAttribute("aria-expanded").includes("true")) toggleMore(true);
    document.querySelectorAll(".need-route").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.route === id)));
    routeKicker.textContent = route.short.toUpperCase();
    routeName.textContent = route.name;
    routeSummary.textContent = route.summary;
    routeLinks.innerHTML = route.links.map(link => makeLink(link[0],link[1])).join("");
    routeResult.classList.remove("is-active");
    void routeResult.offsetWidth;
    routeResult.classList.add("is-active");
    routeLinks.querySelectorAll("[data-point-link]").forEach(button => button.addEventListener("click", () => selectPoint(button.dataset.pointLink,true)));
  }

  function toggleMore(forceOpen) {
    const open = typeof forceOpen === "boolean" ? forceOpen : moreButton.getAttribute("aria-expanded") !== "true";
    moreButton.setAttribute("aria-expanded", String(open));
    moreButton.firstChild.textContent = open ? "收起延伸照護路線 " : "展開更多照護路線 ";
    routeGrid.querySelectorAll(".need-route").forEach((button,index) => { if (index > 5) button.hidden = !open; });
  }

  document.querySelectorAll(".need-route").forEach(button => button.addEventListener("click", () => selectRoute(button.dataset.route)));
  moreButton.addEventListener("click", () => toggleMore());

  pointDots.innerHTML = points.map(point => `<button type="button" class="acupoint-dot" data-point="${point.id}" aria-label="${point.name}・${point.region}" aria-pressed="false" style="left:${point.x}%;top:${point.y}%">${point.index}</button>`).join("");
  pointDots.querySelectorAll(".acupoint-dot").forEach(button => button.addEventListener("click", () => selectPoint(button.dataset.point)));
  meridianButtons.forEach(button => button.addEventListener("click", () => selectPoint(button.dataset.meridianPoint)));
  document.querySelector("#acupointPrev").addEventListener("click", () => selectPoint(points[(currentPoint - 1 + points.length) % points.length].id));
  document.querySelector("#acupointNext").addEventListener("click", () => selectPoint(points[(currentPoint + 1) % points.length].id));
  function replayPoint() {
    mapPanel.scrollIntoView({behavior:"instant",block:"center"});
    selectPoint(points[currentPoint].id,false,true,true);
  }
  document.querySelector("#acupointReplay").addEventListener("click", replayPoint);
  document.querySelector("#acupointMapReplay").addEventListener("click", replayPoint);
  document.querySelector("#acupointMotionHint").textContent = reduceMotion.matches
    ? "目前使用減少動態模式，按播放可看一次帶路動畫。"
    : "點穴位看小水滴帶路，也可以按播放重新看一次。";

  window.addEventListener("resize",() => {
    const bounds = mapPanel.getBoundingClientRect();
    if (bounds.width === mapSize.width && bounds.height === mapSize.height) return;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => moveDropToPoint(points[currentPoint],false,false),120);
  });

  const linkedPoint = query.get("acupoint");
  selectPoint(points.find(point => point.id === linkedPoint)?.id ?? points[0].id);
})();
