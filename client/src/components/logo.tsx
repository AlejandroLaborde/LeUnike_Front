
import { motion } from "framer-motion";
import { Link } from "wouter";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  size?: "small" | "default" | "large";
}

export function Logo({ className = "", width, height, size = "default" }: LogoProps) {
  const sizeClasses = {
    small: "h-8",
    default: "h-12",
    large: "h-16"
  };
  
  return (
    <Link href="/">
      <motion.div 
        className={`flex items-center cursor-pointer ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img 
          src="/logo.png" 
          alt="Le Unique" 
          width={width} 
          height={height}
          className={size ? `${sizeClasses[size]} object-contain` : undefined}
          style={!size && width && height ? { objectFit: "contain", width, height } : undefined}
        />
      </motion.div>
    </Link>
  );
}
