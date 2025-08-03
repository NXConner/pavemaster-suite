import { useEffect, useRef, useState } from 'react';

interface TacticalGridProps {
  className?: string;
  intensity?: number;
  color?: string;
  animated?: boolean;
}

export function TacticalGrid({
  className = '',
  intensity = 0.3,
  color = 'hsl(210, 100%, 50%)',
  animated = true,
}: TacticalGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const parent = canvasRef.current.parentElement;
        setDimensions({
          width: parent.clientWidth,
          height: parent.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => { window.removeEventListener('resize', updateDimensions); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) { return; }

    const ctx = canvas.getContext('2d');
    if (!ctx) { return; }

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    let time = 0;

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gridSize = 50;
      const pulseIntensity = animated ? (Math.sin(time * 0.01) + 1) * 0.5 : 1;
      const opacity = intensity * pulseIntensity;

      // Parse HSL color
      const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      const [, h, s, l] = hslMatch || ['', '210', '100', '50'];

      ctx.strokeStyle = `hsla(${h}, ${s}%, ${l}%, ${opacity})`;
      ctx.lineWidth = 1;

      // Draw vertical lines
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw corner indicators
      const cornerSize = 20;
      ctx.lineWidth = 2;
      ctx.strokeStyle = `hsla(${h}, ${s}%, ${l}%, ${opacity * 1.5})`;

      // Top-left
      ctx.beginPath();
      ctx.moveTo(0, cornerSize);
      ctx.lineTo(0, 0);
      ctx.lineTo(cornerSize, 0);
      ctx.stroke();

      // Top-right
      ctx.beginPath();
      ctx.moveTo(canvas.width - cornerSize, 0);
      ctx.lineTo(canvas.width, 0);
      ctx.lineTo(canvas.width, cornerSize);
      ctx.stroke();

      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - cornerSize);
      ctx.lineTo(0, canvas.height);
      ctx.lineTo(cornerSize, canvas.height);
      ctx.stroke();

      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(canvas.width - cornerSize, canvas.height);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(canvas.width, canvas.height - cornerSize);
      ctx.stroke();

      // Central crosshair
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const crosshairSize = 30;

      ctx.strokeStyle = `hsla(${h}, ${s}%, ${l}%, ${opacity * 2})`;
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(centerX - crosshairSize, centerY);
      ctx.lineTo(centerX + crosshairSize, centerY);
      ctx.moveTo(centerX, centerY - crosshairSize);
      ctx.lineTo(centerX, centerY + crosshairSize);
      ctx.stroke();

      // Scanning lines
      if (animated) {
        const scanY = ((time * 2) % canvas.height);
        ctx.strokeStyle = `hsla(${h}, ${s}%, ${l}%, ${opacity * 0.8})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(canvas.width, scanY);
        ctx.stroke();
      }

      time++;

      if (animated) {
        animationRef.current = requestAnimationFrame(drawGrid);
      }
    };

    drawGrid();

    if (animated) {
      animationRef.current = requestAnimationFrame(drawGrid);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, intensity, color, animated]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}