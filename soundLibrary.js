window.SoundLibrary={
  create(ctx,kind,volume=.13,pan=0){
    const id=String(Date.now()+Math.random()), gain=ctx.createGain(), panner=ctx.createStereoPanner(), output=ctx.createGain();
    gain.gain.value=volume; panner.pan.value=pan; gain.connect(panner).connect(output);
    const layer={id,kind,volume,pan,muted:false,gain,panner,output};

    if(["ocean","rain","wind","forest","fireplace"].includes(kind)){
      const buffer=ctx.createBuffer(1,ctx.sampleRate*5,ctx.sampleRate), data=buffer.getChannelData(0);
      for(let i=0;i<data.length;i++){
        let n=Math.random()*2-1;
        if(kind==="ocean") n*=Math.sin(i/5200)*.55+.45;
        if(kind==="wind") n*=Math.sin(i/9500)*.45+.25;
        if(kind==="forest") n*=(Math.random()>.995?3:.18);
        if(kind==="fireplace") n*=(Math.random()>.985?2.8:.12);
        data[i]=n;
      }
      const source=ctx.createBufferSource(), filter=ctx.createBiquadFilter();
      source.buffer=buffer; source.loop=true;
      filter.type=(kind==="rain"||kind==="fireplace")?"highpass":"lowpass";
      filter.frequency.value=kind==="rain"?1500:kind==="fireplace"?900:650;
      source.connect(filter).connect(gain); source.start(); layer.source=source;
    } else {
      const osc=ctx.createOscillator(), osc2=ctx.createOscillator(), lfo=ctx.createOscillator(), lfoGain=ctx.createGain();
      osc.type=kind==="pad"?"sawtooth":"sine";
      osc.frequency.value=kind==="tibetan"?216:kind==="chimes"?880:kind==="pad"?110:528;
      osc2.type="sine"; osc2.frequency.value=osc.frequency.value*2;
      lfo.frequency.value=kind==="chimes"?.4:.1; lfoGain.gain.value=.04;
      lfo.connect(lfoGain).connect(gain.gain);
      osc.connect(gain); osc2.connect(gain); osc.start(); osc2.start(); lfo.start();
      layer.osc=osc; layer.osc2=osc2; layer.lfo=lfo;
    }
    return layer;
  }
};
