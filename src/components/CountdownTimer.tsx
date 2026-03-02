'use client';

import { useEffect, useRef, useCallback } from 'react';

interface CountdownTimerProps {
  duration: number; // milliseconds (e.g., 20000)
  startedAt: number; // timestamp from server
  onTimeUp: () => void;
}

const CIRCLE_RADIUS = 54;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
const STROKE_WIDTH = 8;
const VIEW_BOX_SIZE = 128;
const CENTER = VIEW_BOX_SIZE / 2;

function getTimerColor(remainingSeconds: number): string {
  if (remainingSeconds > 10) return '#22c55e'; // green-500
  if (remainingSeconds > 5) return '#eab308'; // yellow-500
  return '#ef4444'; // red-500
}

function getTimerGlow(remainingSeconds: number): string {
  if (remainingSeconds > 10) return 'drop-shadow(0 0 8px rgba(34,197,94,0.4))';
  if (remainingSeconds > 5) return 'drop-shadow(0 0 8px rgba(234,179,8,0.4))';
  return 'drop-shadow(0 0 8px rgba(239,68,68,0.5))';
}

function getTextColorClass(remainingSeconds: number): string {
  if (remainingSeconds > 10) return 'text-green-600';
  if (remainingSeconds > 5) return 'text-yellow-500';
  return 'text-red-500';
}

export default function CountdownTimer({ duration, startedAt, onTimeUp }: CountdownTimerProps) {
  const svgCircleRef = useRef<SVGCircleElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const firedRef = useRef(false);
  const onTimeUpRef = useRef(onTimeUp);

  // Keep callback ref fresh without triggering effect re-runs
  onTimeUpRef.current = onTimeUp;

  const animate = useCallback(() => {
    const now = Date.now();
    const elapsed = now - startedAt;
    const remaining = Math.max(0, duration - elapsed);
    const fraction = remaining / duration; // 1 = full, 0 = depleted
    const remainingSeconds = Math.ceil(remaining / 1000);

    // Update SVG circle stroke
    if (svgCircleRef.current) {
      const offset = CIRCLE_CIRCUMFERENCE * (1 - fraction);
      svgCircleRef.current.style.strokeDashoffset = String(offset);
      svgCircleRef.current.style.stroke = getTimerColor(remainingSeconds);
    }

    // Update text
    if (textRef.current) {
      const displaySeconds = Math.ceil(remaining / 1000);
      textRef.current.textContent = String(displaySeconds);

      // Update text color class
      const colorClass = getTextColorClass(remainingSeconds);
      textRef.current.className = `text-5xl font-black tabular-nums transition-colors duration-300 ${colorClass}`;
    }

    // Update container glow filter
    if (containerRef.current) {
      containerRef.current.style.filter = getTimerGlow(remainingSeconds);
    }

    // Fire onTimeUp when timer reaches 0
    if (remaining <= 0 && !firedRef.current) {
      firedRef.current = true;
      onTimeUpRef.current();
      return; // stop animation loop
    }

    if (remaining > 0) {
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [duration, startedAt]);

  useEffect(() => {
    firedRef.current = false;
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [animate]);

  // Initial display seconds
  const initialRemaining = Math.max(0, duration - (Date.now() - startedAt));
  const initialSeconds = Math.ceil(initialRemaining / 1000);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center justify-center"
      style={{ width: VIEW_BOX_SIZE, height: VIEW_BOX_SIZE, filter: getTimerGlow(initialSeconds) }}
    >
      <svg
        width={VIEW_BOX_SIZE}
        height={VIEW_BOX_SIZE}
        viewBox={`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`}
        className="absolute inset-0"
      >
        {/* Background ring */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={CIRCLE_RADIUS}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={STROKE_WIDTH}
        />
        {/* Animated foreground ring - depletes clockwise from the top */}
        <circle
          ref={svgCircleRef}
          cx={CENTER}
          cy={CENTER}
          r={CIRCLE_RADIUS}
          fill="none"
          stroke={getTimerColor(initialSeconds)}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCLE_CIRCUMFERENCE}
          strokeDashoffset={0}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
          style={{ transition: 'stroke 0.3s ease' }}
        />
      </svg>
      {/* Seconds number in center */}
      <span
        ref={textRef}
        className={`text-5xl font-black tabular-nums transition-colors duration-300 ${getTextColorClass(initialSeconds)}`}
      >
        {initialSeconds}
      </span>
    </div>
  );
}
