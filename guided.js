window.Guided={
  scripts:{
    relax:"Take a slow breath in. Let your shoulders soften. Let each tone settle the body.",
    sleep:"Let the day begin to fade. Feel the body grow heavier. Follow the sound gently into rest.",
    body:"Bring attention to the feet. Soften the legs. Relax the belly, chest, shoulders, face and eyes.",
    focus:"Sit tall and steady. Breathe in clarity. Breathe out distraction. Return gently to the sound."
  },
  speak(key){
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(this.scripts[key]||this.scripts.relax);
    u.rate=.82; u.pitch=.85; u.volume=.8;
    speechSynthesis.speak(u);
  },
  stop(){ speechSynthesis.cancel(); }
};
