(() => {
  "use strict";

  const routes = [
    {id:"self",icon:"🌿",label:"照顧自己",hint:"放鬆・睡前・按摩",title:"先留一段時間給自己，再選擇今天需要的陪伴",solution:"從情緒放鬆、睡前儀式或肌肉按摩中，選一件現在做得到的小事。",useTitle:"今天先照顧自己十分鐘",steps:["停下來感受現在比較需要放鬆、休息或活動身體","依情境選擇短時間聞香、睡前儀式或稀釋按摩","一次只使用一種方式，觀察身體感受"],href:"#topics",color:"#e5eee1"},
    {id:"family",icon:"🏡",label:"照顧家人",hint:"環境・防護・安全",title:"先照顧共同生活的環境，再決定是否需要香氣",solution:"從通風、乾燥、清潔與安全使用開始，芳香只作生活陪伴。",useTitle:"一起建立安心的居家環境",steps:["先確認空氣、潮濕、清潔用品與容器是否安全","移除或降低最明顯的暴露來源","需要芳香時少量、短時間，並尊重家人與寵物反應"],href:"#toxins",color:"#dceceb"},
    {id:"elder",icon:"🤲",label:"陪伴長輩",hint:"聞香・手部・活動",title:"從長輩熟悉、願意接受的氣味與互動開始",solution:"以低量、短時間、自願參與為原則，把陪伴放在香氣之前。",useTitle:"溫柔陪伴的三個步驟",steps:["先詢問長輩喜不喜歡這個氣味","選擇聞香、手部照護或簡單樂齡活動","留意呼吸、皮膚與精神狀態，不舒服立即停止"],href:"#elder-care",color:"#f5e8df"},
    {id:"workplace",icon:"🏢",label:"照顧公司同仁",hint:"午休・課程・合作",title:"用不打擾、可自由選擇的方式照顧工作中的人",solution:"共享空間優先採無香放鬆或個人聞香，避免強制全室擴香。",useTitle:"設計友善的職場照護",steps:["先了解人數、場地與同仁的氣味敏感情況","選擇午休舒緩、員工課程或主題活動","保留無香選項與隨時退出的自由"],href:"#workplace-care",color:"#eee7f1"}
  ];

  const choices = document.querySelector("#careChoices");
  const routeBox = document.querySelector("#careRoute");
  const title = document.querySelector("#careRouteTitle");
  const stages = [...document.querySelectorAll("[data-care-stage]")];
  const replay = document.querySelector("#careReplay");
  const useBox = document.querySelector("#careUse");
  const useTitle = document.querySelector("#careUseTitle");
  const useSteps = document.querySelector("#careUseSteps");
  const destination = document.querySelector("#careDestination");
  if (!choices || !routeBox || !title || !stages.length || !replay || !useBox || !useTitle || !useSteps || !destination) return;

  let selected = null;
  let timers = [];
  choices.innerHTML = routes.map(route => `<button class="care-choice" type="button" data-care-choice="${route.id}" style="--choice-soft:${route.color}"><span>${route.icon}</span><b>${route.label}</b><small>${route.hint}</small></button>`).join("");

  function clearTimers(){ timers.forEach(window.clearTimeout); timers=[]; }
  function later(callback,delay){ timers.push(window.setTimeout(callback,delay)); }
  function setStage(index,heading,copy){
    const stage=stages[index];
    stage.classList.add("is-active");
    stage.querySelector("h4").textContent=heading;
    stage.querySelector("p").textContent=copy;
  }
  function play(route){
    clearTimers();
    selected=route;
    document.querySelectorAll("[data-care-choice]").forEach(button=>button.classList.toggle("is-selected",button.dataset.careChoice===route.id));
    routeBox.classList.remove("is-running");
    stages.forEach(stage=>stage.classList.remove("is-active"));
    useBox.hidden=true;
    replay.hidden=true;
    title.textContent=`正在整理「${route.label}」的照護路線…`;
    void routeBox.offsetWidth;
    routeBox.classList.add("is-running");
    routeBox.scrollIntoView({behavior:"smooth",block:"center"});
    setStage(0,route.label,route.hint);
    later(()=>setStage(1,route.title,route.solution),650);
    later(()=>{
      setStage(2,"跟著動畫一步一步做","每次只做一個小步驟，不需要一次看完所有資料。");
      title.textContent=route.title;
    },1300);
    later(()=>{
      useTitle.textContent=route.useTitle;
      useSteps.innerHTML=route.steps.map(step=>`<li>${step}</li>`).join("");
      destination.href=route.href;
      destination.textContent=`進入「${route.label}」完整內容`;
      useBox.hidden=false;
      [...useSteps.children].forEach((item,index)=>later(()=>item.classList.add("is-visible"),index*420));
      replay.hidden=false;
    },1900);
  }

  choices.addEventListener("click",event=>{
    const button=event.target.closest("[data-care-choice]");
    if(!button)return;
    const route=routes.find(item=>item.id===button.dataset.careChoice);
    if(route)play(route);
  });
  replay.addEventListener("click",()=>selected&&play(selected));
})();
