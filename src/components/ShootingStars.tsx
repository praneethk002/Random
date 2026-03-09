import { useEffect, useRef } from 'react';

interface ShootingStarsProps {
  minSpeed?: number;
  maxSpeed?: number;
  minDelay?: number;
  maxDelay?: number;
  starColor?: string;
  trailColor?: string;
  starHeight?: number;
  className?: string;
}

interface Star {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  length: number;
  opacity: number;
  animFrameId?: number;
}

export default function ShootingStars({
  minSpeed = 10,
  maxSpeed = 30,
  minDelay = 1200,
  maxDelay = 4200,
  starColor = '#9E00FF',
  trailColor = '#2EB9DF',
  starHeight = 1,
  className = '',
}: ShootingStarsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const starsRef = useRef<Star[]>([]);
  const nextIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    function rand(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    function createStar(): Star {
      const svg = svgRef.current;
      if (!svg) return { id: -1, x: 0, y: 0, angle: 0, speed: 0, length: 0, opacity: 0 };
      const { width, height } = svg.getBoundingClientRect();

      // Start from random edge position
      const side = Math.floor(Math.random() * 2); // 0=top, 1=left
      let x: number, y: number;
      if (side === 0) {
        x = rand(0, width);
        y = 0;
      } else {
        x = 0;
        y = rand(0, height * 0.5);
      }

      const angle = rand(25, 55); // degrees — diagonal downward-right
      const speed = rand(minSpeed, maxSpeed);
      const length = rand(80, 200);

      return {
        id: nextIdRef.current++,
        x,
        y,
        angle,
        speed,
        length,
        opacity: 1,
      };
    }

    function animateStar(star: Star) {
      const svg = svgRef.current;
      if (!svg || !mountedRef.current) return;
      const { width, height } = svg.getBoundingClientRect();

      const rad = (star.angle * Math.PI) / 180;
      const dx = Math.cos(rad) * star.speed * 0.016;
      const dy = Math.sin(rad) * star.speed * 0.016;

      star.x += dx;
      star.y += dy;

      // Fade out near edges
      const distanceFromEdge = Math.min(
        star.x / width,
        star.y / height,
        (width - star.x) / width,
        (height - star.y) / height,
      );
      star.opacity = Math.min(1, distanceFromEdge * 10);

      // Update SVG element
      const el = svg.querySelector(`#star-${star.id}`) as SVGLineElement | null;
      if (el) {
        const tailX = star.x - Math.cos(rad) * star.length;
        const tailY = star.y - Math.sin(rad) * star.length;
        el.setAttribute('x1', String(tailX));
        el.setAttribute('y1', String(tailY));
        el.setAttribute('x2', String(star.x));
        el.setAttribute('y2', String(star.y));
        el.setAttribute('opacity', String(star.opacity));
      }

      // Remove if out of bounds
      if (star.x > width + star.length || star.y > height + star.length) {
        const toRemove = svg.querySelector(`#star-${star.id}`);
        const gradToRemove = svg.querySelector(`#grad-${star.id}`);
        toRemove?.remove();
        gradToRemove?.remove();
        starsRef.current = starsRef.current.filter((s) => s.id !== star.id);
        return;
      }

      star.animFrameId = requestAnimationFrame(() => animateStar(star));
    }

    function spawnStar() {
      if (!mountedRef.current) return;
      const svg = svgRef.current;
      if (!svg) return;

      const star = createStar();
      if (star.id === -1) return;
      starsRef.current.push(star);

      const defs = svg.querySelector('defs')!;
      const rad = (star.angle * Math.PI) / 180;
      const tailX = star.x - Math.cos(rad) * star.length;
      const tailY = star.y - Math.sin(rad) * star.length;

      // Gradient
      const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      grad.setAttribute('id', `grad-${star.id}`);
      grad.setAttribute('gradientUnits', 'userSpaceOnUse');
      grad.setAttribute('x1', String(tailX));
      grad.setAttribute('y1', String(tailY));
      grad.setAttribute('x2', String(star.x));
      grad.setAttribute('y2', String(star.y));

      const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop1.setAttribute('offset', '0%');
      stop1.setAttribute('stop-color', trailColor);
      stop1.setAttribute('stop-opacity', '0');

      const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop2.setAttribute('offset', '100%');
      stop2.setAttribute('stop-color', starColor);
      stop2.setAttribute('stop-opacity', '1');

      grad.appendChild(stop1);
      grad.appendChild(stop2);
      defs.appendChild(grad);

      // Line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('id', `star-${star.id}`);
      line.setAttribute('x1', String(tailX));
      line.setAttribute('y1', String(tailY));
      line.setAttribute('x2', String(star.x));
      line.setAttribute('y2', String(star.y));
      line.setAttribute('stroke', `url(#grad-${star.id})`);
      line.setAttribute('stroke-width', String(starHeight));
      line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('opacity', '1');
      svg.appendChild(line);

      requestAnimationFrame(() => animateStar(star));

      // Schedule next spawn
      const delay = rand(minDelay, maxDelay);
      setTimeout(spawnStar, delay);
    }

    // Kick off with slight initial delay
    const initTimer = setTimeout(spawnStar, rand(0, maxDelay * 0.5));

    return () => {
      mountedRef.current = false;
      clearTimeout(initTimer);
      starsRef.current.forEach((s) => {
        if (s.animFrameId) cancelAnimationFrame(s.animFrameId);
      });
      starsRef.current = [];
    };
  }, [minSpeed, maxSpeed, minDelay, maxDelay, starColor, trailColor, starHeight]);

  return (
    <svg
      ref={svgRef}
      className={'shooting-stars-svg ' + (className || '')}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs />
    </svg>
  );
}
