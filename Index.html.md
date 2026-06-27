#   
<!DOCTYPE html>  
<html>  
<head>  
  <title>Unpainted Souls Frequency Studio</title>  
  <style>  
    body {  
      margin: 0;  
      font-family: Arial, sans-serif;  
      background: #050814;  
      color: white;  
      text-align: center;  
    }  
  
    .app {  
      max-width: 420px;  
      margin: auto;  
      padding: 30px 20px;  
    }  
  
    .logo {  
      width: 140px;  
      border-radius: 50%;  
      margin-bottom: 15px;  
    }  
  
    h1 {  
      letter-spacing: 4px;  
      color: #f4c05f;  
    }  
  
    button, input, select {  
      width: 100%;  
      padding: 14px;  
      margin: 10px 0;  
      border-radius: 12px;  
      border: none;  
      font-size: 16px;  
    }  
  
    button {  
      background: linear-gradient(90deg, #b7832d, #f4c05f);  
      color: #050814;  
      font-weight: bold;  
      cursor: pointer;  
    }  
  
    .preset {  
      background: #111827;  
      color: white;  
      border: 1px solid #f4c05f;  
    }  
  
    .card {  
      background: #0d1324;  
      padding: 20px;  
      border-radius: 20px;  
      margin-top: 20px;  
      box-shadow: 0 0 20px rgba(244,192,95,.2);  
    }  
  </style>  
</head>  
  
<body>  
  <div class="app">  
    <img src="logo.png" class="logo" alt="Unpainted Souls Logo">  
  
    <h1>UNPAINTED SOULS</h1>  
    <p>Soundscapes • Frequencies • Meditation</p>  
  
    <div class="card">  
      <h2>Frequency Studio</h2>  
  
      <input id="frequency" type="number" value="528" placeholder="Enter frequency Hz">  
  
      <select id="waveform">  
        <option value="sine">Sine</option>  
        <option value="triangle">Triangle</option>  
        <option value="square">Square</option>  
        <option value="sawtooth">Sawtooth</option>  
      </select>  
  
      <button onclick="startTone()">Start Sound</button>  
      <button onclick="stopTone()">Stop Sound</button>  
    </div>  
  
    <div class="card">  
      <h2>Presets</h2>  
      <button class="preset" onclick="setFrequency(174)">174 Hz</button>  
      <button class="preset" onclick="setFrequency(285)">285 Hz</button>  
      <button class="preset" onclick="setFrequency(432)">432 Hz</button>  
      <button class="preset" onclick="setFrequency(528)">528 Hz</button>  
      <button class="preset" onclick="setFrequency(639)">639 Hz</button>  
      <button class="preset" onclick="setFrequency(963)">963 Hz</button>  
    </div>  
  </div>  
  
  <script>  
    let audioContext;  
    let oscillator;  
    let gainNode;  
  
    function startTone() {  
      stopTone();  
  
      audioContext = new (window.AudioContext || window.webkitAudioContext)();  
  
      const frequency = document.getElementById("frequency").value;  
      const waveform = document.getElementById("waveform").value;  
  
      oscillator = audioContext.createOscillator();  
      gainNode = audioContext.createGain();  
  
      oscillator.type = waveform;  
      oscillator.frequency.value = frequency;  
  
      gainNode.gain.value = 0.2;  
  
      oscillator.connect(gainNode);  
      gainNode.connect(audioContext.destination);  
  
      oscillator.start();  
    }  
  
    function stopTone() {  
      if (oscillator) {  
        oscillator.stop();  
        oscillator.disconnect();  
        oscillator = null;  
      }  
    }  
  
    function setFrequency(freq) {  
      document.getElementById("frequency").value = freq;  
      startTone();  
    }  
  </script>  
</body>  
</html>  
