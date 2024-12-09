const rootStyles = getComputedStyle(document.documentElement);
const primaryColor = rootStyles.getPropertyValue("--primary").trim();

const colors = [
  "#6c7a62", // Muted olive green
  "#8b6c42", // Earthy brown-green
  "#b3c0c4", // Pale gray-blue
  "#a6655e", // Warm reddish-brown
  "#657b99", // Medium steel blue
  "#d89090", // Muted rose pink
  "#c5d7e3", // Icy pale blue
  "#a6764d", // Warm earthy brown
  "#6f9ea8", // Cool muted teal-blue
  "#ef8686", // Bright coral
];
