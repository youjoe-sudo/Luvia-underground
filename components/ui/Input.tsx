import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

const baseInput =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-brand-cyan focus:outline-none focus:ring-1 focus:ring-brand-cyan';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className = '', ...rest },
  ref,
) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-xs font-medium text-white/70">{label}</span>}
      <input ref={ref} className={`${baseInput} ${className}`} {...rest} />
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className = '', ...rest },
  ref,
) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-xs font-medium text-white/70">{label}</span>}
      <textarea ref={ref} className={`${baseInput} ${className}`} {...rest} />
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  );
});
