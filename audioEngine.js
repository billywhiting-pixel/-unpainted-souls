class AudioEngine {
  constructor(){
    this.ctx=null; this.master=null; this.analyser=null; this.dry=null; this.reverb=null; this.delaySend=null; this.delay=null;
    this.frequencyLayers=[]; this.soundLayers=[]; this.special=[]; this.soloId=null;
  }
  init(){
    if(!this.ctx){
      this.ctx=new (window.AudioContext||window.webkitAudioContext)();
      this.master=this.ctx.createGain();
      this.analyser=this.ctx.createAnalyser();
      this.dry=this.ctx.createGain();
      this.reverb=this.ctx.createGain();
      this.delaySend=this.ctx.createGain();
      this.delay=this.ctx.createDelay(2);
      this.master.gain.value=.8; this.reverb.gain.value=.15; this.delaySend.gain.value=.08; this.delay.delayTime.value=.28;
      this.dry.connect(this.master); this.reverb.connect(this.master); this.delaySend.connect(this.delay).connect(this.master);
      this.master.connect(this.analyser); this.analyser.connect(this.ctx.destination);
    }
    if(this.ctx.state==="suspended") this.ctx.resume();
  }
  connect(node){ node.connect(this.dry); node.connect(this.reverb); node.connect(this.delaySend); }
  setMaster(v){ this.init(); this.master.gain.setTargetAtTime(Number(v),this.ctx.currentTime,.03); }
  setReverb(v){ this.init(); this.reverb.gain.setTargetAtTime(Number(v),this.ctx.currentTime,.03); }
  setDelay(v){ this.init(); this.delaySend.gain.setTargetAtTime(Number(v),this.ctx.currentTime,.03); }
  fadeTo(v,seconds){ this.init(); this.master.gain.cancelScheduledValues(this.ctx.currentTime); this.master.gain.linearRampToValueAtTime(Number(v),this.ctx.currentTime+seconds); }
  addFrequency(freq,wave="sine",volume=.12,pan=0){
    this.init();
    const osc=this.ctx.createOscillator(), gain=this.ctx.createGain(), panner=this.ctx.createStereoPanner();
    osc.type=wave; osc.frequency.value=Number(freq); gain.gain.value=volume; panner.pan.value=pan;
    osc.connect(gain).connect(panner); this.connect(panner); osc.start();
    const layer={id:String(Date.now()+Math.random()),kind:"frequency",freq:Number(freq),wave,volume,pan,muted:false,osc,gain,panner};
    this.frequencyLayers.push(layer); this.applyMuteSolo(); return layer;
  }
  addSound(kind,volume=.13,pan=0){
    this.init();
    const layer=SoundLibrary.create(this.ctx,kind,volume,pan);
    this.connect(layer.output); this.soundLayers.push(layer); this.applyMuteSolo(); return layer;
  }
  updateLayer(id,values){
    const layer=[...this.frequencyLayers,...this.soundLayers].find(l=>l.id===id);
    if(!layer) return;
    if(values.volume!==undefined){ layer.volume=Number(values.volume); layer.gain.gain.value=layer.muted?0:layer.volume; }
    if(values.pan!==undefined && layer.panner){ layer.pan=Number(values.pan); layer.panner.pan.value=layer.pan; }
  }
  removeLayer(id,type){
    const list=type==="sound"?this.soundLayers:this.frequencyLayers;
    const index=list.findIndex(l=>l.id===id);
    if(index<0) return;
    this.stopLayer(list[index]); list.splice(index,1); this.applyMuteSolo();
  }
  stopLayer(layer){ ["osc","osc2","lfo","source"].forEach(k=>{try{layer[k]&&layer[k].stop()}catch(e){}}); }
  toggleMute(id){ const l=[...this.frequencyLayers,...this.soundLayers].find(x=>x.id===id); if(l){l.muted=!l.muted; this.applyMuteSolo();} }
  toggleSolo(id){ this.soloId=this.soloId===id?null:id; this.applyMuteSolo(); }
  applyMuteSolo(){
    [...this.frequencyLayers,...this.soundLayers].forEach(l=>{
      const on=!l.muted && (!this.soloId || this.soloId===l.id);
      l.gain.gain.value=on?l.volume:0;
    });
  }
  startBinaural(carrier=220,beat=6,volume=.08){
    this.init();
    const merger=this.ctx.createChannelMerger(2), left=this.ctx.createOscillator(), right=this.ctx.createOscillator(), lg=this.ctx.createGain(), rg=this.ctx.createGain();
    left.frequency.value=Number(carrier); right.frequency.value=Number(carrier)+Number(beat); lg.gain.value=rg.gain.value=volume;
    left.connect(lg).connect(merger,0,0); right.connect(rg).connect(merger,0,1); merger.connect(this.dry);
    left.start(); right.start(); this.special.push({left,right});
  }
  stopAll(){
    this.frequencyLayers.forEach(l=>this.stopLayer(l)); this.soundLayers.forEach(l=>this.stopLayer(l));
    this.special.forEach(s=>{try{s.left&&s.left.stop();s.right&&s.right.stop()}catch(e){}});
    this.frequencyLayers=[]; this.soundLayers=[]; this.special=[]; this.soloId=null;
  }
  snapshot(){ return { frequencyLayers:this.frequencyLayers.map(l=>({freq:l.freq,wave:l.wave,volume:l.volume,pan:l.pan})), soundLayers:this.soundLayers.map(l=>({kind:l.kind,volume:l.volume,pan:l.pan})) }; }
  load(snapshot){
    this.stopAll();
    (snapshot.frequencyLayers||[]).forEach(l=>this.addFrequency(l.freq,l.wave,l.volume,l.pan));
    (snapshot.soundLayers||[]).forEach(l=>this.addSound(l.kind,l.volume,l.pan));
  }
}
window.audioEngine=new AudioEngine();
