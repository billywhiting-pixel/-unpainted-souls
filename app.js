const engine=window.audioEngine;
const $=id=>document.getElementById(id);
let timer=null, remaining=0, breathing=false;

function setStatus(text){ $("status").innerText=text; }
function pretty(k){ return k.replace(/\b\w/g,c=>c.toUpperCase()); }

function renderFrequencyLayers(){
  const box=$("frequencyLayers");
  box.innerHTML=engine.frequencyLayers.length?"":"<p class='note'>No frequency layers yet.</p>";
  engine.frequencyLayers.forEach(l=>{
    box.innerHTML+=`<div class="layer">
      <div class="layer-top"><div><b>${l.freq} Hz</b><br><span class="note">${l.wave}</span></div><button class="danger" data-remove-frequency="${l.id}">Remove</button></div>
      <label>Volume</label><input type="range" min="0" max=".6" step=".01" value="${l.volume}" data-volume="${l.id}">
      <label>Pan</label><input type="range" min="-1" max="1" step=".01" value="${l.pan}" data-pan="${l.id}">
      <div class="layer-buttons"><button class="secondary" data-mute="${l.id}">${l.muted?"Unmute":"Mute"}</button><button class="secondary" data-solo="${l.id}">${engine.soloId===l.id?"Unsolo":"Solo"}</button></div>
    </div>`;
  });
}

function renderSoundLayers(){
  const box=$("soundLayers");
  box.innerHTML=engine.soundLayers.length?"":"<p class='note'>No sound layers yet.</p>";
  engine.soundLayers.forEach(l=>{
    box.innerHTML+=`<div class="layer">
      <div class="layer-top"><div><b>${pretty(l.kind)}</b><br><span class="note">Sound layer</span></div><button class="danger" data-remove-sound="${l.id}">Remove</button></div>
      <label>Volume</label><input type="range" min="0" max=".6" step=".01" value="${l.volume}" data-volume="${l.id}">
      <label>Pan</label><input type="range" min="-1" max="1" step=".01" value="${l.pan}" data-pan="${l.id}">
      <div class="layer-buttons"><button class="secondary" data-mute="${l.id}">${l.muted?"Unmute":"Mute"}</button><button class="secondary" data-solo="${l.id}">${engine.soloId===l.id?"Unsolo":"Solo"}</button></div>
    </div>`;
  });
}

function renderSaved(){
  const box=$("savedSessions"), sessions=JSON.parse(localStorage.getItem("unpaintedV6Sessions")||"[]");
  box.innerHTML=sessions.length?"":"<p class='note'>No saved sessions.</p>";
  sessions.forEach((s,i)=>{
    box.innerHTML+=`<div class="session"><b>${s.name}</b><p class="note">${(s.frequencyLayers||[]).map(l=>l.freq+"Hz").join(", ")||"No frequencies"}<br>${(s.soundLayers||[]).map(l=>pretty(l.kind)).join(", ")||"No sounds"}</p><button data-load-session="${i}">Load</button></div>`;
  });
}

function rerender(){ renderFrequencyLayers(); renderSoundLayers(); renderSaved(); }

function quick(type){
  engine.stopAll();
  if(type==="sleep"){ engine.addFrequency(174,"sine",.08,0); engine.addSound("ocean",.16,0); setTimer(1800); Guided.speak("sleep"); }
  else if(type==="meditation"){ engine.addFrequency(432,"sine",.1,0); engine.addFrequency(528,"sine",.08,.2); engine.addSound("crystal",.1,0); Guided.speak("relax"); }
  else if(type==="focus"){ engine.addFrequency(741,"sine",.09,0); engine.addSound("pad",.11,0); engine.startBinaural(220,10,.08); Guided.speak("focus"); }
  else if(type==="relax"){ engine.addFrequency(528,"sine",.1,0); engine.addSound("rain",.12,0); Guided.speak("relax"); }
  else if(type==="heart"){ engine.addFrequency(639,"sine",.1,0); engine.addSound("crystal",.11,0); Guided.speak("body"); }
  else { engine.addFrequency(285,"sine",.1,0); engine.addFrequency(396,"sine",.08,-.2); engine.addSound("tibetan",.1,0); engine.startBinaural(220,6,.08); }
  rerender(); setStatus(pretty(type)+" session started");
}

$("masterVolume").oninput=e=>engine.setMaster(e.target.value);
$("reverbMix").oninput=e=>engine.setReverb(e.target.value);
$("delayMix").oninput=e=>engine.setDelay(e.target.value);
$("stopAll").onclick=()=>{engine.stopAll();Guided.stop();clearTimer();rerender();setStatus("Stopped all");};
$("addFrequency").onclick=()=>{engine.addFrequency($("freqInput").value,$("waveInput").value,.12,0);renderFrequencyLayers();};
$("startBinaural").onclick=()=>{engine.startBinaural($("binauralCarrier").value,$("binauralBeat").value,.08);setStatus("Binaural started");};

document.querySelectorAll("[data-preset]").forEach(b=>b.onclick=()=>{engine.addFrequency(b.dataset.preset,$("waveInput").value,.12,0);renderFrequencyLayers();});
document.querySelectorAll("[data-sound]").forEach(b=>b.onclick=()=>{engine.addSound(b.dataset.sound,.13,0);renderSoundLayers();});
document.querySelectorAll("[data-quick]").forEach(b=>b.onclick=()=>quick(b.dataset.quick));

document.oninput=e=>{
  if(e.target.dataset.volume) engine.updateLayer(e.target.dataset.volume,{volume:e.target.value});
  if(e.target.dataset.pan) engine.updateLayer(e.target.dataset.pan,{pan:e.target.value});
};

document.onclick=e=>{
  if(e.target.dataset.removeFrequency){engine.removeLayer(e.target.dataset.removeFrequency,"frequency");renderFrequencyLayers();}
  if(e.target.dataset.removeSound){engine.removeLayer(e.target.dataset.removeSound,"sound");renderSoundLayers();}
  if(e.target.dataset.mute){engine.toggleMute(e.target.dataset.mute);rerender();}
  if(e.target.dataset.solo){engine.toggleSolo(e.target.dataset.solo);rerender();}
  if(e.target.dataset.loadSession){
    const sessions=JSON.parse(localStorage.getItem("unpaintedV6Sessions")||"[]");
    engine.load(sessions[Number(e.target.dataset.loadSession)]);
    rerender(); setStatus("Session loaded");
  }
};

$("playGuide").onclick=()=>Guided.speak($("guideScript").value);
$("stopGuide").onclick=()=>Guided.stop();

$("saveSession").onclick=()=>{
  const sessions=JSON.parse(localStorage.getItem("unpaintedV6Sessions")||"[]");
  const snap=engine.snapshot();
  snap.name=$("sessionName").value.trim()||`Session ${sessions.length+1}`;
  sessions.push(snap);
  localStorage.setItem("unpaintedV6Sessions",JSON.stringify(sessions));
  renderSaved();
};

function setTimer(seconds){
  remaining=seconds; clearInterval(timer); tick();
  timer=setInterval(()=>{
    remaining--; tick();
    const fade=Number($("fadeSeconds").value);
    if(remaining===fade) engine.fadeTo(0,fade);
    if(remaining<=0){ engine.stopAll(); Guided.stop(); clearTimer(); rerender(); }
  },1000);
}
function tick(){
  $("timerDisplay").innerText=remaining?`${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,"0")}`:"No timer";
}
function clearTimer(){ clearInterval(timer); remaining=0; tick(); }
document.querySelectorAll("[data-timer]").forEach(b=>b.onclick=()=>setTimer(Number(b.dataset.timer)));
$("clearTimer").onclick=clearTimer;

function breathCycle(){
  if(!breathing) return;
  const orb=$("breathOrb"), inhale=Number($("inhale").value)*1000, exhale=Number($("exhale").value)*1000;
  orb.innerText="Inhale"; orb.className="breath-orb inhale";
  setTimeout(()=>{
    if(!breathing) return;
    orb.innerText="Exhale"; orb.className="breath-orb exhale";
    setTimeout(breathCycle,exhale);
  },inhale);
}
$("startBreath").onclick=()=>{breathing=true;breathCycle();};
$("stopBreath").onclick=()=>{breathing=false;$("breathOrb").innerText="Breathe";$("breathOrb").className="breath-orb";};

startVisualizer(engine);
rerender();
if("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(()=>{});
