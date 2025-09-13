import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export type SwitchProps = React.ComponentPropsWithoutRef<
  typeof SwitchPrimitives.Root
> & {
  mode?: "default" | "custom";
};

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, mode = "default", ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      mode === "custom"
        ? "bg-custom-background border-custom-border data-[state=checked]:bg-custom-checked data-[state=checked]:border-custom-checked-border"
        : "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input border-transparent",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full shadow-lg ring-0 transition-transform border",
        mode === "custom" 
          ? "bg-custom-thumb border-custom-thumb-border" 
          : "bg-background border-gray-300",
        "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
));

// Add custom styles for the 'custom' mode
const customStyles = `
  .bg-custom-background { background-color: #e5e7eb; }
  .bg-custom-thumb { background-color: #ffffff; }
  .border-custom-border { border-color: #9ca3af; }
  .bg-custom-checked { background-color: #10b981; }
  .border-custom-checked-border { border-color: #059669; }
  .border-custom-thumb-border { border-color: #6b7280; }
`;

// Inject custom styles into the document
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = customStyles;
  document.head.append(style);
}

Switch.displayName = "Switch";

// Example usage of the Switch component to avoid unused variable warning
const ExampleUsage = () => <Switch mode="custom" />;

export { Switch, ExampleUsage };
