let audioCtx;
let analyserNode;

export function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

export function getAnalyser(audioElement) {
    
    const ctx = getAudioContext();
    /* if (!audioElement._sourceNode) {
  console.log("🎙 Creating new source node...");
  const source = ctx.createMediaElementSource(audioElement);
  source.connect(ctx.destination);
  audioElement._sourceNode = source;
} else {
  console.log("🎙 Source node already exists");
} */

  // Create source only once
  if (!audioElement._sourceNode) {
    const source = ctx.createMediaElementSource(audioElement);
    source.connect(ctx.destination); // Optional: only if not already connected elsewhere
    audioElement._sourceNode = source;
  }

  // Create analyser once
  if (!analyserNode) {
    analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 128;
    audioElement._sourceNode.connect(analyserNode);
  }

  return analyserNode;
}
