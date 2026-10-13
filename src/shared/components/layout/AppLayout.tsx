import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isSidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isSidebarOpen]);

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((value) => !value);

  return (
    <div className="min-h-screen bg-primary lg:flex">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar onToggleSidebar={toggleSidebar} />
        <main className="flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
