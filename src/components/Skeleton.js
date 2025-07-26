import React from 'react';

// Helper function to create dynamic skeletons based on type (image, text, etc.)
const Skeleton = ({ type = "text", width = "100%", height = "20px", borderRadius = "4px", className }) => {
  const getSkeletonStyle = () => {
    // Set the skeleton styles
    let style = {
      width,
      height,
      backgroundColor: "#3b3b3c",
      borderRadius, // Set the dynamic border radius here
      animation: "pulse 1.5s ease-in-out infinite",
    };

    return style;
  };

  return (
    <div className={`skeleton ${type, className}`} style={getSkeletonStyle()} />
  );
};

export default Skeleton;
