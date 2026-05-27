import {
  Home,
  Search,
  Users,
  User,
  LogOut,
} from "lucide-react";

interface Props {
  page: string;
  setPage: (page: string) => void;
  
}

export default function Sidebar({
  page,
  setPage,
  
}: Props) {
  const items = [
    { id: "home", label: "Inicio", icon: Home },
    { id: "search", label: "Buscar", icon: Search },
    { id: "following", label: "Siguiendo", icon: Users },
    { id: "profile", label: "Perfil", icon: User },
  ];

  // Datos reales del usuario desde localStorage (se guardan al hacer login)
  const userName = localStorage.getItem("user_name") || "Usuario";
  const userTag = (localStorage.getItem("user_tag") || "").replace("@", "");
  const userAvatar = localStorage.getItem("user_profile_picture_url") ||
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400";

  function handleLogout() {
    localStorage.clear();
    window.location.reload();
  }

  return (
    <aside className="sticky top-6 h-[calc(100vh-48px)] w-full max-w-[280px]">
      <div className="h-full bg-white/40 backdrop-blur-2xl border border-white/30 rounded-[32px] p-5 shadow-xl flex flex-col justify-between">

        <div className="space-y-8">
          {/* Logo */}
          <div className="px-3 pt-2">
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-gray-950 via-gray-800 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
              T-Talk
              <span className="w-2 h-2 rounded-full bg-[#d6bfa7] block animate-pulse" />
            </h1>
          </div>

          {/* Navegación */}
          <nav className="space-y-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 text-[15px] font-semibold active:scale-[0.98] ${
                  isActive
                    ? "bg-gray-950 text-white shadow-md shadow-gray-950/10"
                    : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon size={20} strokeWidth={isActive ? 2.3 : 2} className={isActive ? "text-white" : "text-gray-400"} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
        </div>

        {/* Usuario actual */}
        <div
          onClick={() => setPage("profile")}
          className="group flex items-center justify-between gap-3 bg-white/50 hover:bg-white/80 border border-white/40 rounded-2xl p-3 shadow-sm cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={userAvatar}
              alt={userName}
              className="w-10 h-10 rounded-full object-cover border border-white shadow-sm shrink-0 group-hover:scale-105 transition-transform"
            />
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate leading-tight">{userName}</p>
              <p className="text-gray-400 text-xs truncate mt-0.5 font-medium">@{userTag}</p>
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); handleLogout(); }}
            className="text-gray-400 hover:text-red-500 p-1.5 rounded-xl hover:bg-red-50 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        </div>

      </div>
    </aside>
  );
}