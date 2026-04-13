import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  NavLink,
  useNavigate,
  type NavLinkRenderProps,
} from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Tags,
  Wallet,
  X,
} from "lucide-react";
import { logoutUser } from "../../store/slices/userSlice";
import { useState } from "react";

// ── Logo ─────────────────────────────────────────────
function AppIcon() {
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent2 shrink-0">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-4 h-4 text-fg"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 7H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
        <path d="M16 3H8L4 7h16l-4-4z" />
        <circle cx="17" cy="13" r="1" fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
}

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser()).unwrap();
    navigate("/login");
  };

  const navClass = ({ isActive }: NavLinkRenderProps): string =>
    `flex gap-3 items-center rounded-md px-3 py-2 ${
      isActive
        ? "bg-accent2 text-fg"
        : "hover:bg-accent2 hover:text-fg text-fg/80"
    }`;

  return (
    <>
      {/* ── Mobile Top Button ── */}
      <Button
  onClick={() => setOpen(true)}
  className="sm:hidden fixed bottom-6 left-4 z-50 h-12 w-12 rounded-full bg-accent2 text-fg shadow-lg flex items-center justify-center"
>
  <LayoutDashboard size={20} />
</Button>

      {/* ── Overlay ── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
          className={`
    fixed  z-50 top-0 bottom-0 left-0
    w-64 sm:h-screen
    flex flex-col justify-between
    border-r border-border bg-white
    sm:bg-accent2/15 text-fg
    px-3 py-6
    transform transition-transform duration-200
    ${open ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
  `}
      >
        {/* ── Top (Logo) ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppIcon />
            <span className="font-semibold text-sm">Expense Tracker</span>
          </div>

          {/* Close button (mobile only) */}
          <Button
            variant="ghost"
            className="sm:hidden"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </Button>
        </div>

        {/* ── Navigation ── */}
        <ul className="flex flex-col gap-3 flex-1 my-9">
          <NavLink
            to="/"
            className={navClass}
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard size={20} />
            <span className="text-sm font-medium">Dashboard</span>
          </NavLink>

          <NavLink
            to="/categories"
            className={navClass}
            onClick={() => setOpen(false)}
          >
            <Tags size={20} />
            <span className="text-sm font-medium">Categories</span>
          </NavLink>

          <NavLink
            to="/budgets"
            className={navClass}
            onClick={() => setOpen(false)}
          >
            <Wallet size={20} />
            <span className="text-sm font-medium">Budgets</span>
          </NavLink>

          <NavLink
            to="/expenses"
            className={navClass}
            onClick={() => setOpen(false)}
          >
            <Receipt size={20} />
            <span className="text-sm font-medium">Expenses</span>
          </NavLink>
        </ul>

        {/* ── Bottom (User) ── */}
        {user?.role === "guest" ? (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 hover:bg-accent2/20 py-2 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className="text-sm">Login now</span>
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 hover:bg-accent2/20 cursor-pointer"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm truncate">
                  {user?.name || "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-40">
              <DropdownMenuLabel className="text-sm">
                {user?.name || "User"}
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-500 cursor-pointer"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </aside>
    </>
  );
}