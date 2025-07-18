// utils/getThemeColor.js

export const getThemeColor = (song) => {
  return song?.theme?.vibrant || "#e91e63"; // Fallback color if vibrant is not available
};
