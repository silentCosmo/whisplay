'use client'
import React from "react";

export default function DropZone({ onFilesDropped }) {
  const handleDrop = async (e) => {
    e.preventDefault();
    const files = [...e.dataTransfer.files];
    onFilesDropped(files);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-pinky border-dashed rounded-2xl p-6 text-center cursor-pointer"
    >
      <h1 className="text-2xl font-bold mb-1">✨ Drop your songs here</h1>
      <p className="text-sm text-glow/70">
        Whisplay will read their soul and let them sing 🎶
      </p>
    </div>
  );
}
