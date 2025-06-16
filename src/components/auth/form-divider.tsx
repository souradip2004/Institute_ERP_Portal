import { Separator } from "@/components/ui/separator";

export function FormDivider() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <Separator className="w-full" />
      </div>
      
    </div>
  );
}