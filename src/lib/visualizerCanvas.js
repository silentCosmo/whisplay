"use client";
import { useEffect, useRef } from "react";
import { getAnalyser } from "./audioContext";

export default function VisualizerCanvas({
  audioRef,
  theme,
  mode = "beatsplash",
  onBeat,
}) {
  const canvasRef = useRef();
  let prevAnalyser = null;

  useEffect(() => {
    if (!audioRef) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (prevAnalyser) {
    try {
      prevAnalyser.disconnect();
    } catch (e) {}
  }


    const analyser = getAnalyser(audioRef);

    prevAnalyser = analyser;

    try {
      audioRef._sourceNode.connect(analyser);
    } catch (err) {}

    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 50;
    const barGap = 0.25;

    let animationId;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
      if (onBeat) onBeat(avg);

      const barWidth = (canvas.width / bufferLength) * 1.5;

      switch (mode) {
        case "mirror": {
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            const value = dataArray[i];
            const barHeight = value * 0.5;
            ctx.fillStyle = theme.vibrant;
            ctx.fillRect(x, centerY, barWidth - barGap, -barHeight);
            ctx.fillRect(x, centerY, barWidth - barGap, barHeight);
            x += barWidth;
          }
          break;
        }

        case "blob": {
          const pulseRadius = radius + avg * 0.4;
          const points = 64;
          ctx.beginPath();
          for (let i = 0; i <= points; i++) {
            const angle = (i / points) * 2 * Math.PI;
            const r = pulseRadius + dataArray[i % bufferLength] * 0.3;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fillStyle = `${theme.vibrant}22`;
          ctx.strokeStyle = theme.vibrant;
          ctx.lineWidth = 2;
          ctx.fill();
          ctx.stroke();
          break;
        }

        case "liquid": {
          ctx.beginPath();
          ctx.moveTo(0, canvas.height);
          for (let i = 0; i < bufferLength; i++) {
            const x = (i / bufferLength) * canvas.width;
            const y =
              centerY +
              Math.sin(i * 0.2 + Date.now() / 300) * (dataArray[i] * 0.2);
            ctx.lineTo(x, y);
          }
          ctx.lineTo(canvas.width, canvas.height);
          ctx.closePath();
          ctx.fillStyle = `${theme.vibrant}33`;
          ctx.fill();
          break;
        }

        case "pulsewave": {
          if (!canvas.pulses) canvas.pulses = [];
          const now = Date.now();
          if (avg > 30 && (!canvas.lastPulse || now - canvas.lastPulse > 200)) {
            canvas.pulses.push({ time: now, radius, strength: avg });
            canvas.lastPulse = now;
          }

          canvas.pulses = canvas.pulses.filter((p) => {
            const age = now - p.time;
            const r = p.radius + age * 0.05;
            const alpha = Math.max(1 - age / 1000, 0);
            if (alpha <= 0) return false;

            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
            ctx.fillStyle = `${theme.vibrant}${Math.floor(alpha * 255)
              .toString(16)
              .padStart(2, "0")}`;
            ctx.fill();
            return true;
          });
          break;
        }

        case "sparkle": {
          const sparkleCount = Math.floor(avg / 4);
          for (let i = 0; i < sparkleCount; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * (avg / 15 + 1);
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = `${theme.vibrant}${Math.floor(
              100 + Math.random() * 80
            )
              .toString(16)
              .padStart(2, "0")}`;
            ctx.fill();
          }
          break;
        }

        case "wave": {
          ctx.beginPath();
          for (let i = 0; i < bufferLength; i++) {
            const x = (i / bufferLength) * canvas.width;
            const y =
              centerY + Math.sin(i + Date.now() / 100) * (dataArray[i] * 0.2);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = theme.vibrant;
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
        }

        case "aura": {
          const pulseRadius = radius + avg * 0.5;
          ctx.beginPath();
          ctx.arc(centerX, centerY, pulseRadius, 0, 2 * Math.PI);
          ctx.fillStyle = `${theme.vibrant}33`;
          ctx.fill();
          break;
        }

        case "rings": {
          const rings = 3;
          for (let i = 0; i < rings; i++) {
            const pulse = radius + avg * 0.2 * (i + 1);
            ctx.beginPath();
            ctx.arc(centerX, centerY, pulse, 0, 2 * Math.PI);
            ctx.strokeStyle = `${theme.vibrant}${(50 + i * 30)
              .toString(16)
              .padStart(2, "0")}`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
          break;
        }

        /* case "beatsplash": {
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            const value = dataArray[i];
            const h = value * 0.7;

            const r = barWidth / 2;
            const y = canvas.height - h;

            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + barWidth, y, x + barWidth, y + h, r);
            ctx.arcTo(x + barWidth, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + r, y, r);
            ctx.closePath();

            ctx.fillStyle = theme.vibrant;
            ctx.fill();

            x += barWidth;
          }
          break;
        } */

        default: {
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            const value = dataArray[i];
            const h = value * 0.7;

            const r = barWidth / 2;
            const y = canvas.height - h;

            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + barWidth, y, x + barWidth, y + h, r);
            ctx.arcTo(x + barWidth, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + r, y, r);
            ctx.closePath();

            ctx.fillStyle = theme.vibrant;
            ctx.fill();

            x += barWidth;
          }
        }
      }
    };

    draw();

    return () => {
      try {
        analyser.disconnect();
      } catch (e) {}
      cancelAnimationFrame(animationId);
    };
  }, [audioRef, theme, mode]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 m-auto"
      style={{
        width: "100%",
        height: "100%",
        maxWidth: "100%",
        maxHeight: "100%",
        aspectRatio: "1 / 1",
        opacity: 0.4,
        mixBlendMode: "screen",
      }}
    />
  );
}