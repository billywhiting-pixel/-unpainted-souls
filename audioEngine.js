class UnpaintedAudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.analyser = null;
    this.layers = [];
    this.special = [];
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.master.gain.value = 0.8;
      this.master.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  setMasterVolume(value) {
    this.init();
    this.master.gain.setTargetAtTime(Number(value), this.ctx.currentTime, 0.03);
  }

  fadeTo(value, seconds = 4) {
    this.init();
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setValueAtTime(this.master.gain.value, this.ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(Number(value), this.ctx.currentTime + seconds);
  }

  addFrequencyLayer(freq, wave = "sine", volume = 0.12, pan = 0) {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const panner = this.ctx.createStereoPanner();

    osc.type = wave;
    osc.frequency.value = Number(freq);
    gain.gain.value = Number(volume);
    panner.pan.value = Number(pan);

    osc.connect(gain).connect(panner).connect(this.master);
    osc.start();

    const layer = { type: "frequency", freq:Number(freq), wave, volume:Number(volume), pan:Number(pan), osc, gain, panner };
    this.layers.push(layer);
    return layer;
  }

  updateLayer(index, values) {
    const layer = this.layers[index];
    if (!layer) return;

    if (values.freq !== undefined) {
      layer.freq = Number(values.freq);
      layer.osc.frequency.setTargetAtTime(layer.freq, this.ctx.currentTime, 0.03);
    }
    if (values.volume !== undefined) {
      layer.volume = Number(values.volume);
      layer.gain.gain.setTargetAtTime(layer.volume, this.ctx.currentTime, 0.03);
    }
    if (values.pan !== undefined) {
      layer.pan = Number(values.pan);
      layer.panner.pan.setTargetAtTime(layer.pan, this.ctx.currentTime, 0.03);
    }
  }

  removeLayer(index) {
    const layer = this.layers[index];
    if (!layer) return;
    try { layer.osc.stop(); layer.osc.disconnect(); } catch(e) {}
    this.layers.splice(index, 1);
  }

  clearLayers() {
    this.layers.forEach(layer => {
      try { layer.osc.stop(); layer.osc.disconnect(); } catch(e) {}
    });
    this.layers = [];
  }

  startSweep(startHz, endHz, duration, wave = "sine", volume = 0.14) {
    this.init();
    const layer = this.addFrequencyLayer(startHz, wave, volume, 0);
    layer.osc.frequency.cancelScheduledValues(this.ctx.currentTime);
    layer.osc.frequency.setValueAtTime(Number(startHz), this.ctx.currentTime);
    layer.osc.frequency.linearRampToValueAtTime(Number(endHz), this.ctx.currentTime + Number(duration));
    layer.sweep = { startHz:Number(startHz), endHz:Number(endHz), duration:Number(duration) };
    return layer;
  }

  startIsochronic(carrierHz = 220, pulseHz = 6) {
    this.init();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = Number(carrierHz);

    lfo.type = "square";
    lfo.frequency.value = Number(pulseHz);
    lfoGain.gain.value = 0.11;
    gain.gain.value = 0.11;

    lfo.connect(lfoGain).connect(gain.gain);
    osc.connect(gain).connect(this.master);

    osc.start();
    lfo.start();

    const node = { type:"isochronic", osc, gain, lfo, lfoGain, carrierHz:Number(carrierHz), pulseHz:Number(pulseHz) };
    this.special.push(node);
    return node;
  }

  startBinaural(carrierHz = 220, beatHz = 6, volume = 0.12) {
    this.init();

    const merger = this.ctx.createChannelMerger(2);
    const leftOsc = this.ctx.createOscillator();
    const rightOsc = this.ctx.createOscillator();
    const leftGain = this.ctx.createGain();
    const rightGain = this.ctx.createGain();

    leftOsc.frequency.value = Number(carrierHz);
    rightOsc.frequency.value = Number(carrierHz) + Number(beatHz);
    leftGain.gain.value = Number(volume);
    rightGain.gain.value = Number(volume);

    leftOsc.connect(leftGain).connect(merger, 0, 0);
    rightOsc.connect(rightGain).connect(merger, 0, 1);
    merger.connect(this.master);

    leftOsc.start();
    rightOsc.start();

    const node = { type:"binaural", leftOsc, rightOsc, leftGain, rightGain, carrierHz:Number(carrierHz), beatHz:Number(beatHz), volume:Number(volume), merger };
    this.special.push(node);
    return node;
  }

  stopSpecial() {
    this.special.forEach(node => {
      ["osc","lfo","leftOsc","rightOsc"].forEach(k => {
        if (node[k]) {
          try { node[k].stop(); node[k].disconnect(); } catch(e) {}
        }
      });
    });
    this.special = [];
  }

  stopAll() {
    this.clearLayers();
    this.stopSpecial();
  }

  snapshot() {
    return {
      layers: this.layers.map(l => ({ freq:l.freq, wave:l.wave, volume:l.volume, pan:l.pan })),
      masterVolume: this.master ? this.master.gain.value : 0.8
    };
  }

  loadSnapshot(snapshot) {
    this.stopAll();
    (snapshot.layers || []).forEach(l => this.addFrequencyLayer(l.freq, l.wave, l.volume, l.pan));
    if (snapshot.masterVolume !== undefined) this.setMasterVolume(snapshot.masterVolume);
  }
}

window.audioEngine = new UnpaintedAudioEngine();
