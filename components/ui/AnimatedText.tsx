"use client";

import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  charDelay?: number;
}

export const AnimatedText = ({ 
  text, 
  className = '', 
  delay = 0, 
  charDelay = 50 
}: AnimatedTextProps) => {
  const { elementRef, isVisible } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: '50px',
  });

  return (
    <div ref={elementRef} className={className}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="inline-block transition-all duration-500 ease-out"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: `${delay + (index * charDelay)}ms`,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
};