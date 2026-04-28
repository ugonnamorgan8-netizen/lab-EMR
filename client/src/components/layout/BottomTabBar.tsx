import { NavLink } from "react-router-dom";
import type { NavItem } from "../../types/app";
import { cn } from "../../utils/cn";

export function BottomTabBar({ items }: { items: NavItem[] }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(236,245,255,0.98))] backdrop-blur md:hidden">
      <div className="flex min-h-16 items-stretch gap-1 overflow-x-auto px-2 py-2">
        {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex min-w-[92px] flex-1 items-center justify-center rounded-xl px-3 text-center text-xs font-semibold text-slate-700",
              isActive && "bg-white text-slate-900 shadow-[0_10px_18px_rgba(15,47,88,0.08)]",
            )
          }
        >
          {item.label}
        </NavLink>
        ))}
      </div>
    </div>
  );
}
