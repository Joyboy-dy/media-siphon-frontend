import type { HTMLAttributes, ReactNode } from "react";

type DivProps = HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children: ReactNode;
};

export function Card({ className = "", children, ...props }: DivProps) {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }: DivProps) {
  return (
    <div className={`card-header ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }: HTMLAttributes<HTMLHeadingElement> & { className?: string; children: ReactNode }) {
  return (
    <h3 className={`card-title ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className = "", children, ...props }: DivProps) {
  return (
    <div className={`card-content ${className}`} {...props}>
      {children}
    </div>
  );
}
