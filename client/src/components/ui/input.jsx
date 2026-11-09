import * as React from "react"
import { cn } from "@/lib/utils"
import { useFormContext } from "react-hook-form"
import { AlertTriangle } from "lucide-react"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  let error;
  const context = useFormContext();
  if (context?.formState?.errors && props.name) {
    error = props.name.split('.').reduce((o, i) => o?.[i], context.formState.errors);
  }

  return (
    <div className="relative w-full">
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          error ? "border-red-500 bg-red-50 pr-8" : "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <AlertTriangle className="absolute right-2 top-2.5 h-4 w-4 text-red-500" />
      )}
      {error && (
        <p className="text-red-500 text-xs mt-1 font-medium">{error.message}</p>
      )}
    </div>
  )
})
Input.displayName = "Input"

export { Input }
