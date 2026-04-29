import { NavLink } from "react-router-dom";
import type { NavItem } from "../../types/app";
import { cn } from "../../utils/cn";

export function BottomTabBar({ items }: { items: NavItem[] }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(236,245,255,0.99))] backdrop-blur md:hidden">
      <div className="flex min-h-16 items-stretch gap-1 overflow-x-auto px-2 py-1.5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex min-w-[72px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 text-center text-[10px] font-semibold text-slate-500 transition-all duration-150",
                isActive
                  ? "bg-[linear-gradient(135deg,#0d3060,#1155a0)] text-white shadow-md"
                  : "hover:bg-slate-100 hover:text-slate-800",
              )
            }
          >
            {item.icon ? (
              <span className="text-lg leading-none">{item.icon}</span>
            ) : null}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
