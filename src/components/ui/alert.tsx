import React from "react";

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "warning" | "info";
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "border border-border bg-card text-fg",
      destructive: "border border-destructive/30 bg-destructive/10 text-destructive",
      warning: "border border-yellow-500/30 bg-yellow-500/10 text-yellow-700",
      info: "border border-blue-500/30 bg-blue-500/10 text-blue-700",
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={`rounded-lg border px-4 py-3 text-sm ${variantStyles[variant]} ${className}`}
        {...props}
      />
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = "", ...props }, ref) => (
  <h5
    ref={ref}
    className={` font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm [&_p]:leading-relaxed ${className}`}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
