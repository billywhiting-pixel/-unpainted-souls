const engine = window.audioEngine;
const $ = (id) => document.getElementById(id);

function setStatus(text) {
  $("status").innerText = text;
}

function renderLayers() {
  const box = $("layers");
  box.innerHTML = engine.layers.length ? "" : "<p class='note'>No layers yet.</p>";

  engine.layers.forEach((layer, index) => {
    const div = document.createElement("div");
    div.className = "layer";
    div.innerHTML = `
      <div class="layer-top">
        <div><strong>${layer.freq} Hz</strong><br><span class="note">${layer.wave}</span></div>
        <button class="danger" data-remove="${index}">Remove</button>
      </div>
      <label>Frequency</label>
      <input type="number" value="${layer.freq}" data-freq="${index}">
      <label>Volume</label>
      <input type="range" min="0" max=".6" step=".01" value="${layer.volume}" data-volume="${index}">
      <label>Pan Left / Right</label>
      <input type="range" min="-1" max="1" step=".01" value="${layer.pan}" data-pan="${index}">
    `;
    box.appendChild(div);
  });
}

function renderSessions() {
  const box = $("sessions");
  const sessions = JSON.parse(localStorage.getItem("unpaintedSessionsV3") || "[]");
  box.innerHTML = sessions.length ? "" : "<p class='note'>No saved sessions yet.</p>";

  sessions.forEach((session, index) => {
    const div = document.createElement("div");
    div.className = "session";
    const freqs = session.layers.map(l => `${l.freq}Hz`).join(", ");
    div.innerHTML = `
      <strong>${session.name}</strong>
      <p class="note">${freqs || "Empty session"}</p>
      <button data-load-session="${index}">Load Session</button>
    `;
    box.appendChild(div);
  });
}

$("masterVolume").addEventListener("input", e => {
  engine.setMasterVolume(e.target.value);
});

$("fadeInBtn").addEventListener("click", () => {
  engine.fadeTo(Number($("masterVolume").value), 5);
  setStatus("Fading in");
});

$("fadeOutBtn").addEventListener("click", () => {
  engine.fadeTo(0, 5);
  setStatus("Fading out");
});

$("stopAllBtn").addEventListener("click", () => {
  engine.stopAll();
  renderLayers();
  setStatus("Stopped all audio");
});

$("addLayerBtn").addEventListener("click", () => {
  engine.addFrequencyLayer($("freqInput").value, $("waveInput").value, 0.12, 0);
  renderLayers();
  setStatus(`${$("freqInput").value} Hz added`);
});

document.querySelectorAll("[data-preset]").forEach(btn => {
  btn.addEventListener("click", () => {
    engine.addFrequencyLayer(btn.dataset.preset, $("waveInput").value, 0.12, 0);
    renderLayers();
    setStatus(`${btn.dataset.preset} Hz added`);
  });
});

$("layers").addEventListener("input", e => {
  if (e.target.dataset.freq !== undefined) {
    engine.updateLayer(Number(e.target.dataset.freq), { freq:e.target.value });
    renderLayers();
  }
  if (e.target.dataset.volume !== undefined) {
    engine.updateLayer(Number(e.target.dataset.volume), { volume:e.target.value });
  }
  if (e.target.dataset.pan !== undefined) {
    engine.updateLayer(Number(e.target.dataset.pan), { pan:e.target.value });
  }
});

$("layers").addEventListener("click", e => {
  if (e.target.dataset.remove !== undefined) {
    engine.removeLayer(Number(e.target.dataset.remove));
    renderLayers();
    setStatus("Layer removed");
  }
});

$("sweepBtn").addEventListener("click", () => {
  const duration = Number($("sweepDuration").value);
  engine.startSweep($("sweepStart").value, $("sweepEnd").value, duration, "sine", 0.14);
  renderLayers();
  setStatus(`Sweep ${$("sweepStart").value} Hz to ${$("sweepEnd").value} Hz`);
});

$("isoBtn").addEventListener("click", () => {
  engine.startIsochronic($("isoCarrier").value, $("isoPulse").value);
  setStatus(`Isochronic ${$("isoPulse").value} Hz pulse`);
});

$("binauralBtn").addEventListener("click", () => {
  engine.startBinaural($("binauralCarrier").value, $("binauralBeat").value, 0.12);
  setStatus(`Binaural ${$("binauralBeat").value} Hz`);
});

$("saveSessionBtn").addEventListener("click", () => {
  const sessions = JSON.parse(localStorage.getItem("unpaintedSessionsV3") || "[]");
  const snapshot = engine.snapshot();
  snapshot.name = `Session ${sessions.length + 1}`;
  sessions.push(snapshot);
  localStorage.setItem("unpaintedSessionsV3", JSON.stringify(sessions));
  renderSessions();
  setStatus("Session saved");
});

$("sessions").addEventListener("click", e => {
  if (e.target.dataset.loadSession !== undefined) {
    const sessions = JSON.parse(localStorage.getItem("unpaintedSessionsV3") || "[]");
    const session = sessions[Number(e.target.dataset.loadSession)];
    if (session) {
      engine.loadSnapshot(session);
      renderLayers();
      setStatus("Session loaded");
    }
  }
});

startVisualizer(engine);
renderLayers();
renderSessions();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
