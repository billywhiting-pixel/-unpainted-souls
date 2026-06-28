function startVisualizer(engine){
  const canvas=document.getElementById("visualizer"), c=canvas.getContext("2d");
  let stars=[];
  function resize(){
    canvas.width=innerWidth; canvas.height=innerHeight;
    stars=Array.from({length:80},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*1.7+.3,v:Math.random()*.35+.05}));
  }
  addEventListener("resize",resize); resize();
  function draw(){
    c.clearRect(0,0,canvas.width,canvas.height);
    let level=0;
    if(engine.analyser){
      const data=new Uint8Array(engine.analyser.frequencyBinCount);
      engine.analyser.getByteFrequencyData(data);
      level=data.reduce((a,b)=>a+b,0)/data.length;
    }
    c.fillStyle="rgba(255,224,138,.55)";
    stars.forEach(s=>{s.y+=s.v+level/900;if(s.y>canvas.height)s.y=0;c.beginPath();c.arc(s.x,s.y,s.r,0,Math.PI*2);c.fill();});
    const cx=canvas.width/2, cy=canvas.height/2.7, r=44+level*.55;
    const g=c.createRadialGradient(cx,cy,5,cx,cy,r*2.4);
    g.addColorStop(0,"rgba(255,224,138,.9)"); g.addColorStop(.35,"rgba(131,217,255,.25)"); g.addColorStop(1,"rgba(255,224,138,0)");
    c.fillStyle=g; c.beginPath(); c.arc(cx,cy,r*2.4,0,Math.PI*2); c.fill();
    requestAnimationFrame(draw);
  }
  draw();
}
window.startVisualizer=startVisualizer;
