'use client';
import * as React from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'accent' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground shadow-glow hover:brightness-110 active:scale-[.98]',
  accent: 'bg-accent text-accent-foreground hover:brightness-110 active:scale-[.98]',
  secondary: 'bg-foreground text-background hover:opacity-90 active:scale-[.98]',
  outline: 'border border-border bg-card text-foreground hover:bg-muted',
  ghost: 'text-foreground hover:bg-muted',
  danger: 'bg-danger text-white hover:brightness-110',
};
const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-md gap-1.5',
  md: 'h-11 px-5 text-sm rounded-lg gap-2',
  lg: 'h-13 px-7 text-base rounded-xl gap-2 py-3.5',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
