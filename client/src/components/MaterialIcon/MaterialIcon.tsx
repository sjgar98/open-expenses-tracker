import type { CSSProperties } from 'react';

interface MaterialIconProps {
  children: React.ReactNode;
  color?: string;
  size?: number;
  style?: CSSProperties;
}

export default function MaterialIcon({ children, color, size, style }: MaterialIconProps) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        userSelect: 'none',
        verticalAlign: 'middle',
        color: color ?? 'currentColor',
        fontSize: size ?? 'inherit',
        ...(style ?? {}),
      }}
    >
      {children}
    </span>
  );
}

