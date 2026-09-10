import React from 'react';

interface GuyFawkesIconProps {
  className?: string;
  size?: number;
  color?: string;
}

export const GuyFawkesIcon: React.FC<GuyFawkesIconProps> = ({
  className = '',
  size = 28,
  color = '#00FF66',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Face Contour - Geometric & Angular */}
      <polygon
        points="50,6 78,16 88,38 82,68 50,94 18,68 12,38 22,16"
        stroke={color}
        strokeWidth="3.5"
        strokeLinejoin="miter"
        fill="rgba(11, 14, 20, 0.9)"
      />

      {/* Characteristic Arched Eyebrows */}
      <path
        d="M24 32 Q35 24 45 32"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="square"
        fill="none"
      />
      <path
        d="M55 32 Q65 24 76 32"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="square"
        fill="none"
      />

      {/* Eyes Slits */}
      <polygon points="26,38 42,39 40,43 27,41" fill={color} />
      <polygon points="74,38 58,39 60,43 73,41" fill={color} />

      {/* Sharp Angular Nose */}
      <polyline
        points="50,33 50,56 43,58 57,58"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
        fill="none"
      />

      {/* Rosy Cheek Geometrics */}
      <circle cx="25" cy="53" r="3.5" fill={color} opacity="0.6" />
      <circle cx="75" cy="53" r="3.5" fill={color} opacity="0.6" />

      {/* Iconic Upside-Curved Mustache */}
      <path
        d="M26 62 Q38 67 50 63 Q62 67 74 62 Q66 73 50 68 Q34 73 26 62 Z"
        fill={color}
      />

      {/* Enigmatic Smile Mouth */}
      <path
        d="M32 75 Q50 83 68 75"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="square"
        fill="none"
      />

      {/* Pointed Goatee Beard */}
      <polygon
        points="46,81 54,81 50,91"
        fill={color}
      />

      {/* Tactical Glitch Crosshair Marks */}
      <line x1="50" y1="2" x2="50" y2="8" stroke={color} strokeWidth="2" />
      <line x1="92" y1="50" x2="98" y2="50" stroke={color} strokeWidth="2" />
      <line x1="2" y1="50" x2="8" y2="50" stroke={color} strokeWidth="2" />
    </svg>
  );
};
