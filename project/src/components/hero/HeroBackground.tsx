import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

export function HeroBackground() {
  const { scrollY } = useScroll();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const y = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resizeCanvas = () => {
      const scale = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      ctx.scale(scale, scale);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let frame: number;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;
    let time = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const drawGrid = () => {
      if (!ctx || !canvas) return;

      // Smooth mouse movement
      mouseX += (targetMouseX - mouseX) * 0.1;
      mouseY += (targetMouseY - mouseY) * 0.1;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
      
      const cellSize = 30;
      const rows = Math.ceil(canvas.height / window.devicePixelRatio / cellSize) + 1;
      const cols = Math.ceil(canvas.width / window.devicePixelRatio / cellSize) + 1;
      const mouseInfluenceRadius = 120;
      const maxDisplacement = 8;

      // Create gradient for vertical fade
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height / window.devicePixelRatio);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.09)'); // Sedikit lebih gelap di atas
      gradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.06)'); // Mulai memudar lebih awal
      gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.03)'); // Lebih transparan di bagian bawah
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Benar-benar transparan di bawah

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.1;

      // Draw vertical lines with optimized calculations
      for (let x = 0; x < cols; x++) {
        const baseX = x * cellSize;
        ctx.beginPath();
        
        for (let y = 0; y < rows; y++) {
          const currentY = y * cellSize;
          const dx = mouseX - baseX;
          const dy = mouseY - currentY;
          const distance = Math.hypot(dx, dy);
          
          let displacement = 0;
          if (distance < mouseInfluenceRadius) {
            const factor = 1 - distance / mouseInfluenceRadius;
            displacement = Math.sin(factor * Math.PI) * maxDisplacement * factor;
          }
          
          const xPos = baseX + displacement;
          y === 0 ? ctx.moveTo(xPos, currentY) : ctx.lineTo(xPos, currentY);
        }
        ctx.stroke();
      }

      // Draw horizontal lines with optimized calculations
      for (let y = 0; y < rows; y++) {
        const baseY = y * cellSize;
        ctx.beginPath();
        
        for (let x = 0; x < cols; x++) {
          const currentX = x * cellSize;
          const dx = mouseX - currentX;
          const dy = mouseY - baseY;
          const distance = Math.hypot(dx, dy);
          
          let displacement = 0;
          if (distance < mouseInfluenceRadius) {
            const factor = 1 - distance / mouseInfluenceRadius;
            displacement = Math.sin(factor * Math.PI) * maxDisplacement * factor;
          }
          
          const yPos = baseY + displacement;
          x === 0 ? ctx.moveTo(currentX, yPos) : ctx.lineTo(currentX, yPos);
        }
        ctx.stroke();
      }

      time++;
      frame = requestAnimationFrame(drawGrid);
    };

    drawGrid();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.2] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px'
        }}
      />

      {/* Interactive Grid */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      </motion.div>

      {/* Floating Elements - Reduced count and simplified animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-b from-gray-300/20 to-gray-100/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 2}px`,
              height: `${Math.random() * 3 + 2}px`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 15 - 7.5, 0],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: Math.random() * 2 + 3,
              delay: Math.random() * 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Bottom Fade Gradient */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />

      {/* Gradient Overlay - Simplified */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: useTransform(scrollY, [0, 300], [0, -30]) }}
      >
        <div className="h-full w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/40 via-white/20 to-transparent" />
      </motion.div>

      {/* Animated Shapes - Further reduced and simplified */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {Array.from({ length: 1 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-b from-gray-200/20 to-gray-50/20 blur-3xl"
            style={{
              width: '600px',
              height: '600px',
              left: '30%',
              top: '20%',
            }}
            animate={{
              y: [0, 20, 0],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </motion.div>

      {/* Geometric Shapes - Reduced count and simplified animation */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={`geo-${i}`}
            className={`absolute ${
              i % 2 === 0 
                ? 'border border-gray-300/20' 
                : 'bg-gradient-to-b from-gray-200/20 to-gray-100/20'
            } ${
              i % 3 === 0 ? 'rounded-full' : 'rounded-lg'
            }`}
            style={{
              width: `${Math.random() * 30 + 20}px`,
              height: `${Math.random() * 30 + 20}px`,
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
            animate={{
              rotate: [0, 180],
              opacity: [0.2, 0.25, 0.2],
            }}
            transition={{
              duration: Math.random() * 8 + 8,
              delay: Math.random() * 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Light Beams - Reduced count and simplified */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 2 }).map((_, i) => (
          <motion.div
            key={`beam-${i}`}
            className="absolute bg-gradient-to-b from-gray-300/25 via-gray-200/15 to-transparent"
            style={{
              width: '1px',
              height: '300px',
              left: `${30 + i * 35}%`,
              top: '-150px',
              transform: `rotate(${Math.random() * 6 - 3}deg)`,
            }}
            animate={{
              y: [-150, window.innerHeight + 150],
              opacity: [0, 0.25, 0],
            }}
            transition={{
              duration: 12,
              delay: i * 4,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
            }}
          />
        ))}
      </div>
    </div>
  );
} 


