'use client';
import * as React from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-2xl border border-border bg-card text-card-foreground shadow-soft', className)} {...props} />;
}

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', className)}
      {...props}
    />
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30',
        className,
      )}
      {...props}
    />
  ),
);
Select.displayName = 'Select';

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('mb-1.5 block text-sm font-semibold text-foreground', className)} {...props} />;
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('text-xs font-bold uppercase tracking-[0.18em] text-primary', className)}>{children}</span>
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
