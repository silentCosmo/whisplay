"use client";
import { useEffect, useRef } from "react";

export default function VisualizerCanvas({ audioRef, theme, mode = "wave" }) {
  const canvasRef = useRef();

  useEffect(() => {
    if (!audioRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaElementSource(audioRef.current);

    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    analyser.fftSize = 1024; // Less sensitive than 2048
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const width = (canvas.width = canvas.offsetWidth);
    const height = (canvas.height = canvas.offsetHeight);

    let smoothed = new Float32Array(bufferLength);

    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, width, height);

      ctx.shadowColor = theme.vibrant;
      ctx.shadowBlur = 10;

      ctx.clearRect(0, 0, width, height);

      if (mode === "wave") {
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = theme.vibrant + "aa"; // Add a little transparency

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            const prevX = x - sliceWidth;
            const prevY = (dataArray[i - 1] / 128.0) * (height / 2);
            const midX = (prevX + x) / 2;
            const midY = (prevY + y) / 2;
            ctx.quadraticCurveTo(prevX, prevY, midX, midY);
          }

          x += sliceWidth;
        }

        ctx.stroke();
      }
    };

    draw();

    return () => {
      source.disconnect();
      analyser.disconnect();
    };
  }, [audioRef, theme, mode]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none"
    />
  );
}
