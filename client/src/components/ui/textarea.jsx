import * as React from "react"
import { cn } from "@/lib/utils"
import { useFormContext } from "react-hook-form"
import { AlertTriangle } from "lucide-react"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  let error;
  const context = useFormContext();
  if (context?.formState?.errors && props.name) {
    error = props.name.split('.').reduce((o, i) => o?.[i], context.formState.errors);
  }

  return (
    <div className="relative w-full">
      <textarea
        data-slot="textarea"
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          error ? "border-red-500 bg-red-50 pr-8" : "",
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
Textarea.displayName = "Textarea"

export { Textarea }
