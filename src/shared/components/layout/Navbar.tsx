import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";

import { getActiveSectionLabel } from "./nav.config";

type NavbarProps = {
  onToggleSidebar: () => void;
};

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-secondary/20 bg-primary/80 px-4 py-3 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Abrir menú"
        className="rounded-xl p-2 text-third transition hover:bg-secondary/10 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <p className="text-sm font-semibold text-third">{getActiveSectionLabel(pathname)}</p>
    </header>
  );
}
