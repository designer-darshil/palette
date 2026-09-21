import React from 'react';

interface RainbowRollerPreloaderProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  ariaLabel?: string;
}

export const RainbowRollerPreloader: React.FC<RainbowRollerPreloaderProps> = ({
  className = '',
  width = 700,
  height = 400,
  ariaLabel = 'Loading content...',
}) => {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`relative flex items-center justify-center overflow-hidden select-none ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        backgroundColor: '#F8F8F8',
      }}
    >
      <svg
        viewBox="0 0 700 400"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <style>{`
            .rainbow-roller-rock {
              transform-origin: 350px 200px;
              animation: rainbowRollerRockAnim 1.4s ease-in-out infinite;
            }
            @keyframes rainbowRollerRockAnim {
              0%, 100% {
                transform: rotate(0deg);
              }
              50% {
                transform: rotate(10deg);
              }
            }
            .roller-stroke-dark {
              stroke: #222225;
              stroke-width: 2.2;
              stroke-linecap: round;
              stroke-linejoin: round;
            }
            .roller-metal-stem {
              fill: none;
              stroke: #36363B;
              stroke-width: 2.2;
              stroke-linecap: round;
              stroke-linejoin: round;
            }
          `}</style>
          <clipPath id="reactRollerCylinderClip">
            <rect x="-24" y="-13" width="48" height="26" rx="8" ry="8" />
          </clipPath>
        </defs>

        {/* Clean off-white background */}
        <rect width="700" height="400" fill="#F8F8F8" />

        {/* Centered Roller with Rocking Animation */}
        <g className="rainbow-roller-rock" transform="translate(350, 200)">
          {/* Base 45 deg clockwise posture */}
          <g transform="rotate(45)">

            {/* Metal Neck Connector */}
            <path
              d="M 22 -4 
                 C 28 -4, 33 -2, 33 5
                 L 33 22
                 C 33 28, 26 31, 20 31
                 L 10 31
                 C 5 31, 2 34, 2 40
                 L 2 48"
              className="roller-metal-stem"
            />

            {/* Ferrule */}
            <path
              d="M -2 47 L 6 47 C 7 47, 7 49, 6 49 L -2 49 C -3 49, -3 47, -2 47 Z"
              fill="#D5D5DC"
              className="roller-stroke-dark"
            />

            {/* Light Tan Wooden Handle */}
            <path
              d="M -2 49 
                 L -4 74 
                 C -4 79, 8 79, 8 74 
                 L 6 49 
                 Z"
              fill="#EAD7B7"
              className="roller-stroke-dark"
            />

            {/* Roller Cylinder & Rainbow Stripes */}
            <g>
              <g clipPath="url(#reactRollerCylinderClip)">
                {/* Red */}
                <path d="M -25 -15 L -16 -15 C -15 -5, -17 5, -16 15 L -25 15 Z" fill="#F03E3E" />
                {/* Orange */}
                <path d="M -16 -15 L -8 -15 C -7 -5, -9 5, -8 15 L -16 15 C -17 5, -15 -5, -16 -15 Z" fill="#FA8C16" />
                {/* Yellow */}
                <path d="M -8 -15 L 0 -15 C 1 -5, -1 5, 0 15 L -8 15 C -9 5, -7 -5, -8 -15 Z" fill="#FADB14" />
                {/* Green */}
                <path d="M 0 -15 L 8 -15 C 9 -5, 7 5, 8 15 L 0 15 C -1 5, 1 -5, 0 -15 Z" fill="#52C41A" />
                {/* Cyan / Blue */}
                <path d="M 8 -15 L 16 -15 C 17 -5, 15 5, 16 15 L 8 15 C 7 5, 9 -5, 8 -15 Z" fill="#1890FF" />
                {/* Purple */}
                <path d="M 16 -15 L 26 -15 L 26 15 L 16 15 C 15 5, 17 -5, 16 -15 Z" fill="#9254DE" />
              </g>

              {/* Roller Outline */}
              <rect
                x="-24"
                y="-13"
                width="48"
                height="26"
                rx="8"
                ry="8"
                fill="none"
                className="roller-stroke-dark"
              />

              {/* Organic wave separators */}
              <path d="M -16 -13 C -15 -3, -17 3, -16 13" fill="none" stroke="#222225" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M -8 -13 C -7 -3, -9 3, -8 13" fill="none" stroke="#222225" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M 0 -13 C 1 -3, -1 3, 0 13" fill="none" stroke="#222225" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M 8 -13 C 9 -3, 7 3, 8 13" fill="none" stroke="#222225" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M 16 -13 C 17 -3, 15 3, 16 13" fill="none" stroke="#222225" strokeWidth="1.2" strokeLinecap="round" />

              {/* Center Pin */}
              <circle cx="-24" cy="0" r="2.5" fill="#36363B" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
