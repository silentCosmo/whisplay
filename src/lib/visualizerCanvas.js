"use client";
import { useEffect, useRef } from "react";

export default function VisualizerCanvas({
  audioRef,
  theme,
  mode = "spectrum",
  onBeat,
}) {
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

    analyser.fftSize = 128;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
      if (onBeat) onBeat(avg); // Call the pulse handler

      const barWidth = (canvas.width / bufferLength) * 1.5;
      const barGap = 1;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 50;

      /* ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height); */

      switch (mode) {
        case "mirror": {
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            const value = dataArray[i];
            const barHeight = value * 0.5;
            ctx.fillStyle = theme.vibrant || "#e91e63";
            ctx.fillRect(x, centerY, barWidth - barGap, -barHeight);
            ctx.fillRect(x, centerY, barWidth - barGap, barHeight);
            x += barWidth;
          }
          break;
        }

        case "blob": {
          const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          const pulseRadius = radius + avg * 0.4;

          ctx.beginPath();
          const points = 64;
          const startAngle = 0;
          let firstX, firstY;

          for (let i = 0; i <= points; i++) {
            const angle = startAngle + (i / points) * 2 * Math.PI;
            const noise = dataArray[i % bufferLength] * 0.3;
            const r = pulseRadius + noise;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;

            if (i === 0) {
              ctx.moveTo(x, y);
              firstX = x;
              firstY = y;
            } else {
              ctx.lineTo(x, y);
            }
          }

          // ensure smooth closure
          ctx.lineTo(firstX, firstY);
          ctx.closePath();
          ctx.fillStyle = `${theme.vibrant}22`;
          ctx.strokeStyle = theme.vibrant;
          ctx.lineWidth = 2;
          ctx.shadowBlur = 20;
          ctx.shadowColor = theme.vibrant;
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
          ctx.shadowColor = theme.vibrant;
          ctx.shadowBlur = 10;
          ctx.fill();
          break;
        }

        case "pulsewave": {
          // Manage global pulses array across frames
          if (!canvas.pulses) canvas.pulses = [];

          const now = Date.now();

          // Add new pulse on beat
          if (avg > 30 && (!canvas.lastPulse || now - canvas.lastPulse > 200)) {
            canvas.pulses.push({
              time: now,
              radius: radius,
              strength: avg,
            });
            canvas.lastPulse = now;
          }

          // Draw existing pulses
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
          const sparkleCount = Math.floor(avg / 4); // driven by beat

          for (let i = 0; i < sparkleCount; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * (avg / 15 + 1); // size matches energy

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = `${theme.vibrant}${Math.floor(
              80 + Math.random() * 80
            ).toString(16)}`; // vibrant with changing alpha
            ctx.shadowBlur = 10;
            ctx.shadowColor = theme.vibrant;
            ctx.fill();
          }
          break;
        }

        case "wave":
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

        case "aura": {
          const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          const pulseRadius = radius + avg * 0.5;

          ctx.beginPath();
          ctx.arc(centerX, centerY, pulseRadius, 0, 2 * Math.PI);
          ctx.fillStyle = `${theme.vibrant}33`;
          ctx.shadowColor = theme.vibrant;
          ctx.shadowBlur = 40;
          ctx.fill();
          break;
        }

        default: {
          // spectrum
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            const value = dataArray[i];
            const barHeight = value * 0.5;
            ctx.fillStyle = theme.vibrant || "#e91e63";
            ctx.fillRect(
              x,
              canvas.height - barHeight,
              barWidth - barGap,
              barHeight
            );
            x += barWidth;
          }
        }
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
      className="pointer-events-none absolute inset-0 m-auto"
      style={{
        width: "100%",
        height: "100%",
        maxWidth: "100%",
        maxHeight: "100%",
        aspectRatio: "1 / 1", // 👈 maintains perfect circle ratio
        opacity: 0.4,
        mixBlendMode: "screen",
      }}
    />
  );
}
