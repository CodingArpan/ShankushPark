import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  TicketIcon,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Home,
  CreditCard,
  ComponentIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    title: "Visitors",
    href: "/visitors",
    icon: <Users className="w-5 h-5" />,
    submenu: [
      {
        title: "Verify Visitor",
        href: "/visitors/verify",
      },
      {
        title: "Visitor List",
        href: "/visitors",
      },
    ],
  },
  // {
  //   title: "Bookings",
  //   href: "/bookings",
  //   icon: <TicketIcon className="w-5 h-5" />,
  // },
  // {
  //   title: "Reports",
  //   href: "/reports",
  //   icon: <BarChart3 className="w-5 h-5" />,
  // },

  // {
  //   title: "Settings",
  //   href: "/settings",
  //   icon: <Settings className="w-5 h-5" />,
  // },
];

const Sidebar = () => {
  const location = useLocation();
  const [open, setOpen] = React.useState(true);
  const [openSubMenus, setOpenSubMenus] = React.useState({});

  const toggleSubMenu = (title) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isActive = (href) => {
    return (
      location.pathname === href || location.pathname.startsWith(`${href}/`)
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-card text-card-foreground h-screen transition-all duration-300",
        open ? "w-64" : "w-20"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <Link
          to="/"
          className={cn(
            "flex items-center gap-2 font-bold text-xl",
            !open && "justify-center"
          )}
        >
          {open ? (
            <>
              <Home className="w-6 h-6 text-primary" />
              <span>AmusePark</span>
            </>
          ) : (
            <Home className="w-6 h-6 text-primary" />
          )}
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.title} className="space-y-1">
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleSubMenu(item.title)}
                    className={cn(
                      "flex items-center w-full py-2 px-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
                      isActive(item.href) &&
                        "bg-accent text-accent-foreground font-medium",
                      !open && "justify-center"
                    )}
                  >
                    {item.icon}
                    {open && (
                      <>
                        <span className="ml-3 flex-1 text-left">
                          {item.title}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={cn(
                            "w-4 h-4 transition-transform",
                            openSubMenus[item.title] && "transform rotate-180"
                          )}
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </>
                    )}
                  </button>
                  {open && openSubMenus[item.title] && (
                    <ul className="mt-1 ml-4 space-y-1">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.title}>
                          <Link
                            to={subItem.href}
                            className={cn(
                              "flex items-center py-2 px-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
                              isActive(subItem.href) &&
                                "bg-accent/50 text-accent-foreground"
                            )}
                          >
                            <span className="ml-3">{subItem.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center py-2 px-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
                    isActive(item.href) &&
                      "bg-accent text-accent-foreground font-medium",
                    !open && "justify-center"
                  )}
                >
                  {item.icon}
                  {open && <span className="ml-3">{item.title}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t mt-auto">
        <button
          className={cn(
            "flex items-center w-full py-2 px-3 rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors",
            !open && "justify-center"
          )}
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          <LogOut className="w-5 h-5" />
          {open && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
