import * as React from 'react'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`flex min-h-[80px] w-full rounded-md border border-brand-gray-700 bg-brand-gray-800 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-brand-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
