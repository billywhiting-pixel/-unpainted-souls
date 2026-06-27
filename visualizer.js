function startVisualizer(engine) {
  const canvas = document.getElementById("visualizer");
  const ctx2d = canvas.getContext("2d");
  let stars = [];

  function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    stars = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.7 + 0.3,
      v: Math.random() * 0.35 + 0.05
    }));
  }

  addEventListener("resize", resize);
  resize();

  function draw() {
    ctx2d.clearRect(0, 0, canvas.width, canvas.height);

    let level = 0;
    if (engine.analyser) {
      const data = new Uint8Array(engine.analyser.frequencyBinCount);
      engine.analyser.getByteFrequencyData(data);
      level = data.reduce((a,b) => a+b, 0) / data.length;
    }

    ctx2d.fillStyle = "rgba(255,224,138,.55)";
    stars.forEach(s => {
      s.y += s.v + level / 900;
      if (s.y > canvas.height) s.y = 0;
      ctx2d.beginPath();
      ctx2d.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx2d.fill();
    });

    const cx = canvas.width / 2;
    const cy = canvas.height / 2.7;
    const radius = 42 + level * 0.55;

    const gradient = ctx2d.createRadialGradient(cx, cy, 5, cx, cy, radius * 2.3);
    gradient.addColorStop(0, "rgba(255,224,138,.9)");
    gradient.addColorStop(0.35, "rgba(131,217,255,.25)");
    gradient.addColorStop(1, "rgba(255,224,138,0)");

    ctx2d.fillStyle = gradient;
    ctx2d.beginPath();
    ctx2d.arc(cx, cy, radius * 2.3, 0, Math.PI * 2);
    ctx2d.fill();

    ctx2d.strokeStyle = "rgba(255,224,138,.35)";
    ctx2d.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      ctx2d.beginPath();
      ctx2d.arc(cx, cy, radius * i, 0, Math.PI * 2);
      ctx2d.stroke();
    }

    requestAnimationFrame(draw);
  }

  draw();
}

window.startVisualizer = startVisualizer;
