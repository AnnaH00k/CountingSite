"use client";

import React, { useEffect, useRef, useState } from "react";

interface FloatingNumber {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  number: string;
  size: number;
}

const FloatingNumbersBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const numbersRef = useRef<FloatingNumber[]>([]);

  // Generate random numbers 0-9
  const generateRandomNumber = (): string => {
    return Math.floor(Math.random() * 10).toString();
  };

  // Initialize floating numbers
  const initializeNumbers = (width: number, height: number) => {
    const numbers: FloatingNumber[] = [];
    const numCount = Math.floor((width * height) / 15000); // Adjust density based on screen size

    for (let i = 0; i < numCount; i++) {
      numbers.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5, // Slower movement
        vy: (Math.random() - 0.5) * 0.5,
        number: generateRandomNumber(),
        size: Math.random() * 20 + 10, // Size between 10-30
      });
    }

    numbersRef.current = numbers;
  };

  // Check collision between two numbers
  const checkCollision = (
    num1: FloatingNumber,
    num2: FloatingNumber
  ): boolean => {
    const margin = 2;
    const distance = Math.sqrt(
      Math.pow(num1.x - num2.x, 2) + Math.pow(num1.y - num2.y, 2)
    );
    return distance < (num1.size + num2.size) / 2 + margin;
  };

  // Update number positions
  const updateNumbers = (width: number, height: number) => {
    numbersRef.current.forEach((num) => {
      // Update position
      num.x += num.vx;
      num.y += num.vy;

      // Bounce off edges
      if (num.x <= 0 || num.x >= width) {
        num.vx = -num.vx;
        num.x = Math.max(0, Math.min(width, num.x));
      }
      if (num.y <= 0 || num.y >= height) {
        num.vy = -num.vy;
        num.y = Math.max(0, Math.min(height, num.y));
      }

      // Keep within bounds
      num.x = Math.max(0, Math.min(width, num.x));
      num.y = Math.max(0, Math.min(height, num.y));
    });

    // Handle collisions
    for (let i = 0; i < numbersRef.current.length; i++) {
      for (let j = i + 1; j < numbersRef.current.length; j++) {
        const num1 = numbersRef.current[i];
        const num2 = numbersRef.current[j];

        if (checkCollision(num1, num2)) {
          // Calculate collision response
          const dx = num2.x - num1.x;
          const dy = num2.y - num1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 0) {
            const overlap = (num1.size + num2.size) / 2 + 2 - distance;
            const separationX = (dx / distance) * overlap * 0.5;
            const separationY = (dy / distance) * overlap * 0.5;

            num1.x -= separationX;
            num1.y -= separationY;
            num2.x += separationX;
            num2.y += separationY;

            // Swap velocities for elastic collision
            const tempVx = num1.vx;
            const tempVy = num1.vy;
            num1.vx = num2.vx;
            num1.vy = num2.vy;
            num2.vx = tempVx;
            num2.vy = tempVy;
          }
        }
      }
    }
  };

  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;

    // Update numbers
    updateNumbers(width, height);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw numbers
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)"; // 10% opacity white
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    numbersRef.current.forEach((num) => {
      ctx.font = `bold ${num.size}px Arial`;
      ctx.fillText(num.number, num.x, num.y);
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  // Handle resize
  const handleResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    setDimensions({ width, height });

    if (canvasRef.current) {
      canvasRef.current.width = width;
      canvasRef.current.height = height;
    }

    // Reinitialize numbers with new dimensions
    initializeNumbers(width, height);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default FloatingNumbersBackground;
