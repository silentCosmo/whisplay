let audioCtx;
let analyserNode;

export function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume the context if it's suspended (very common on mobile)
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function getAnalyser(audioElement) {
  const ctx = getAudioContext();

  // If a previous source exists but from a different element, disconnect
  if (audioElement._sourceNode && audioElement._sourceNode.mediaElement !== audioElement) {
    try {
      audioElement._sourceNode.disconnect();
    } catch (e) {
      console.warn("Failed to disconnect source node", e);
    }
    audioElement._sourceNode = null;
  }

  // Create new source if not present
  if (!audioElement._sourceNode) {
    const source = ctx.createMediaElementSource(audioElement);
    source.connect(ctx.destination); // Optional if you want to hear the sound
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


/* let audioCtx;
let analyserNode;

export function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

export function getAnalyser(audioElement) {
    
    const ctx = getAudioContext();

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
 */