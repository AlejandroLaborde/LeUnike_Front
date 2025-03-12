import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className = "", width = 150, height = 80 }: LogoProps) {
  return (
    <motion.div 
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 150 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="75" cy="75" r="75" fill="#f2efe2" />
        <path
          d="M75 15C42.4 15 15 42.4 15 75C15 107.6 42.4 135 75 135C107.6 135 135 107.6 135 75C135 42.4 107.6 15 75 15ZM75 130C45.1 130 20 104.9 20 75C20 45.1 45.1 20 75 20C104.9 20 130 45.1 130 75C130 104.9 104.9 130 75 130Z"
          fill="#e3a765"
        />
        <path
          d="M75 30C49.6 30 29 50.6 29 76C29 101.4 49.6 122 75 122C100.4 122 121 101.4 121 76C121 50.6 100.4 30 75 30ZM75 117C52.4 117 34 98.6 34 76C34 53.4 52.4 35 75 35C97.6 35 116 53.4 116 76C116 98.6 97.6 117 75 117Z"
          fill="#5d6d7c"
        />
        <path
          d="M48 60.2C48 59 48.4 57.9 49.1 57C49.8 56.1 50.9 55.5 52 55.4C52.7 55.3 53.4 55.4 54 55.6C54.7 55.8 55.3 56.2 55.8 56.7C56.3 57.2 56.7 57.8 56.9 58.5C57.1 59.1 57.2 59.8 57.1 60.5C57 61.6 56.5 62.7 55.6 63.4C54.7 64.1 53.6 64.5 52.4 64.5C51.7 64.6 51 64.5 50.4 64.3C49.7 64.1 49.1 63.7 48.6 63.2C48.1 62.7 47.7 62.1 47.5 61.4C47.3 61 47.2 60.6 47.2 60.2"
          fill="#fdd000"
        />
        <text
          x="50%"
          y="70%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="#e3a765"
          fontFamily="Playfair Display, serif"
          fontSize="22"
          fontWeight="700"
        >
          Le Unique
        </text>
      </svg>
    </motion.div>
  );
}
