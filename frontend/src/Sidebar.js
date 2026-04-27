import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Activity, Bell, Settings } from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation(); // helps highlight active page

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  
  ];

  return (
    <div className="w-64 h-screen bg-white border-r p-6">
      
      <h2 className="text-2xl font-bold mb-8 text-yellow-600">
        🐝 HiveAI
      </h2>

      <ul className="space-y-4">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <li
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                isActive
                  ? "bg-yellow-100 text-yellow-700"
                  : "hover:bg-gray-100"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Sidebar;