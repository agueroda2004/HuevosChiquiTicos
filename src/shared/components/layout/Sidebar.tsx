import { useState } from "react";
import { ChevronDown, LogOut, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useClerk, useUser } from "@clerk/react";

import { BRAND_LOGO_URL, BRAND_NAME } from "../../constants";
import { getActiveGroupId, homeItem, navGroups } from "./nav.config";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { pathname } = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const activeGroupId = getActiveGroupId(pathname);
  const HomeIcon = homeItem.icon;

  const displayName = user?.fullName ?? user?.username ?? "Usuario";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-third/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-third text-primary transition-transform duration-300 lg:sticky lg:top-0 lg:bottom-auto lg:z-auto lg:h-screen lg:w-64 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <img
              src={BRAND_LOGO_URL}
              alt={BRAND_NAME}
              className="h-9 w-9 rounded-full object-cover ring-1 ring-primary/30"
            />
            <span className="text-sm font-semibold">{BRAND_NAME}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="rounded-lg p-1.5 transition hover:bg-primary/10 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-2">
          <NavLink
            to={homeItem.to}
            end
            onClick={onClose}
            className={({ isActive }) =>
              `mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-primary font-semibold text-third"
                  : "text-primary/80 hover:bg-primary/10"
              }`
            }
          >
            <HomeIcon className="h-4 w-4" />
            {homeItem.label}
          </NavLink>

          {navGroups.map((group) => {
            const GroupIcon = group.icon;
            const isGroupOpen = overrides[group.id] ?? group.id === activeGroupId;

            return (
              <div key={group.id} className="mb-1">
                <button
                  type="button"
                  aria-expanded={isGroupOpen}
                  onClick={() =>
                    setOverrides((current) => ({ ...current, [group.id]: !isGroupOpen }))
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-primary/90 transition hover:bg-primary/10"
                >
                  <GroupIcon className="h-4 w-4" />
                  <span className="flex-1 text-left">{group.label}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isGroupOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isGroupOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <ul className="mt-1 space-y-1 pl-4">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon;

                        return (
                          <li key={item.to}>
                            <NavLink
                              to={item.to}
                              onClick={onClose}
                              className={({ isActive }) =>
                                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                                  isActive
                                    ? "bg-primary font-semibold text-third"
                                    : "text-primary/80 hover:bg-primary/10"
                                }`
                              }
                            >
                              <ItemIcon className="h-4 w-4" />
                              {item.label}
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-primary/15 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-primary/10 px-3 py-2.5">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-primary/70">{email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void signOut({ redirectUrl: "/sign-in" })}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-primary/90 transition hover:bg-primary/10"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
