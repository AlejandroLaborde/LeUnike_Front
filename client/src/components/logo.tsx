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
      <img 
        src="/logo.png" 
        alt="Le Unique" 
        width={width} 
        height={height} 
        style={{ objectFit: "contain" }}
      />
    </motion.div>
  );
}