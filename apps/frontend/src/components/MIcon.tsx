import React from 'react';

export interface MIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: number | string;
}

export const MIcon = React.forwardRef<HTMLSpanElement, MIconProps>(
  ({ name, size, className = "", style, ...props }, ref) => {
    const parsedSize = typeof size === 'number' ? `${size}px` : size;

    const combinedStyle: React.CSSProperties = {
      fontFamily: "'Material Symbols Outlined'",
      fontWeight: "normal",
      fontStyle: "normal",
      fontSize: parsedSize || "inherit",
      lineHeight: 1,
      letterSpacing: "normal",
      textTransform: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      whiteSpace: "nowrap",
      wordWrap: "normal",
      direction: "ltr",
      WebkitFontFeatureSettings: "'liga'",
      fontFeatureSettings: "'liga'",
      WebkitFontSmoothing: "antialiased",
      fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24", // Outlined, weight 300 to match lucide
      userSelect: "none",
      width: parsedSize || "inherit",
      height: parsedSize || "inherit",
      ...style,
    };

    return (
      <span
        ref={ref}
        className={`material-symbols-outlined shrink-0 ${className}`}
        style={combinedStyle}
        {...props}
      >
        {name}
      </span>
    );
  }
);

MIcon.displayName = "MIcon";
