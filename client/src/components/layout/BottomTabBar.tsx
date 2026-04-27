import { NavLink } from "react-router-dom";
import type { NavItem } from "../../types/app";
import { cn } from "../../utils/cn";

export function BottomTabBar({ items }: { items: NavItem[] }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-white/70 bg-white/90 backdrop-blur md:hidden">
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
