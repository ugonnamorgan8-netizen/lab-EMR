import { NavLink } from "react-router-dom";
import type { NavItem } from "../../types/app";
import { cn } from "../../utils/cn";

export function BottomTabBar({ items }: { items: NavItem[] }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,247,255,0.97))] backdrop-blur md:hidden">
      {items.slice(0, 5).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex min-h-14 items-center justify-center px-2 text-center text-xs font-semibold text-slate-500",
              isActive && "text-brand-blue",
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}
