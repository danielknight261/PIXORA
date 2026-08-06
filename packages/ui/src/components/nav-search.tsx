import { Search } from "lucide-react";
import { Input } from "@pixora/ui/components/ui/input";
import { cn } from "@pixora/ui/lib/utils";

export type NavSearchProps = {
  placeholder?: string;
  className?: string;
  onSubmit?: (query: string) => void;
};

export function NavSearch({
  placeholder = "Search products…",
  className,
  onSubmit,
}: NavSearchProps) {
  return (
    <form
      className={cn("relative w-full", className)}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        const q = String(data.get("q") ?? "").trim();
        if (q && onSubmit) onSubmit(q);
        else if (q) window.location.href = `/products?q=${encodeURIComponent(q)}`;
      }}
    >
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        name="q"
        type="search"
        placeholder={placeholder}
        className="h-10 rounded-full bg-muted/50 pl-10 pr-4"
      />
    </form>
  );
}
