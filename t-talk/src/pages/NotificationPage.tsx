import { useState } from "react";
import { Heart, MessageCircle, UserPlus, Check, CheckCheck, BellOff, SlidersHorizontal } from "lucide-react";

export type NotificationType = "like" | "follow" | "comment";

export interface Notification {
  id: number;
  type: NotificationType;
  text: string;
  time: string;
  unread: boolean;
  user: {
    name: string;
    avatar: string;
    tag: string;
  };
}

// configuracion de iconos
const NOTIFICATION_CONFIG = {
  like: {
    icon: Heart,
    bgClass: "bg-pink-50 text-pink-500 border-pink-100/50",
    actionText: "le dio me gusta a tu publicación",
  },
  follow: {
    icon: UserPlus,
    bgClass: "bg-blue-50 text-blue-500 border-blue-100/50",
    actionText: "comenzó a seguirte",
  },
  comment: {
    icon: MessageCircle,
    bgClass: "bg-amber-50 text-amber-600 border-amber-100/50",
    actionText: "comentó en tu publicación",
  },
};

// Datos simulados 
const initialNotifications: Notification[] = [
  {
    id: 1,
    type: "like",
    user: { name: "Sophia Bennett", tag: "@sophia", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400" },
    text: "le dio me gusta a tu publicación de UI/UX",
    time: "Hace 2 min",
    unread: true,
  },
  {
    id: 2,
    type: "follow",
    user: { name: "Daniel Lee", tag: "@danlee", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400" },
    text: "comenzó a seguir tu perfil",
    time: "Hace 10 min",
    unread: true,
  },
  {
    id: 3,
    type: "comment",
    user: { name: "Emma Watson", tag: "@emma", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400" },
    text: 'comentó: "¡Excelente combinación de colores analógicos!"',
    time: "Hace 25 min",
    unread: false,
  },
];

export default function NotificationsPage() {

  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => n.unread).length;

  // marcar una sola notificación como leída
  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  // marcar todo como leído
  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return n.unread;
    return true;
  });

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl mx-auto pb-12 w-full">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl border border-white/40 p-5 rounded-[28px] shadow-sm">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Centro de Actividad</h2>
          <p className="text-xs font-medium text-gray-400 mt-0.5">
            Tienes {unreadCount} {unreadCount === 1 ? "notificación pendiente" : "notificaciones pendientes"}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="self-start sm:self-center bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs border border-gray-200/60 px-4 py-2.5 rounded-full transition flex items-center gap-1.5 active:scale-95 shadow-2xs"
          >
            <CheckCheck size={14} className="text-emerald-500" />
            Marcar todo leído
          </button>
        )}
      </div>

      <div className="flex items-center justify-between border-b border-gray-200/40 px-2 text-xs font-bold">
        <div className="flex gap-5">
          <button
            onClick={() => setFilter("all")}
            className={`pb-3 px-1 transition-all relative ${
              filter === "all" ? "text-gray-950 border-b-2 border-gray-950" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`pb-3 px-1 transition-all relative flex items-center gap-1.5 ${
              filter === "unread" ? "text-gray-950 border-b-2 border-gray-950" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            No leídas
            {unreadCount > 0 && (
              <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="text-gray-400 pb-3 flex items-center gap-1 font-medium text-[11px]">
          <SlidersHorizontal size={12} /> Filtros activos
        </div>
      </div>

      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => {
            const config = NOTIFICATION_CONFIG[notification.type];
            const IconComponent = config.icon;

            return (
              <div
                key={notification.id}
                onClick={() => notification.unread && handleMarkAsRead(notification.id)}
                className={`
                  group relative bg-white/80 backdrop-blur-2xl border rounded-[24px] p-4 
                  flex items-center justify-between gap-4 transition-all duration-300
                  ${notification.unread 
                    ? "border-white/80 shadow-xs cursor-pointer hover:bg-white hover:shadow-md" 
                    : "border-gray-100/70 bg-white/40 opacity-80"
                  }
                `}
              >
                
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="relative shrink-0 select-none">
                    <img
                      src={notification.user.avatar}
                      alt={notification.user.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-xl flex items-center justify-center border-2 border-white shadow-inner ${config.bgClass}`}>
                      <IconComponent size={11} strokeWidth={2.5} />
                    </div>
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm text-gray-700 leading-snug break-words">
                      <span className="font-black text-gray-900 group-hover:underline cursor-pointer">
                        {notification.user.name}
                      </span>{" "}
                      <span className="text-gray-400 text-xs font-semibold mr-1">
                        {notification.user.tag}
                      </span>{" "}
                      <span className={notification.unread ? "font-semibold text-gray-800" : "font-medium text-gray-500"}>
                        {notification.text}
                      </span>
                    </p>
                    <span className="text-[10px] font-bold text-gray-400 block tracking-wide uppercase">
                      {notification.time}
                    </span>
                  </div>
                </div>

                {/* lado derecho*/}
                <div className="shrink-0 flex items-center">
                  {notification.unread ? (
                    <div className="flex items-center gap-2">
                      {/* Botón para marcar leído */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-emerald-500 bg-gray-50 rounded-xl transition duration-200 hover:scale-105"
                        title="Marcar como leído"
                      >
                        <Check size={14} strokeWidth={2.5} />
                      </button>

                      <div 
                        className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                        title="Nueva notificación"
                      />
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest hidden group-hover:block select-none">
                      Leída
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white/30 border border-dashed border-gray-200 rounded-[32px] flex flex-col items-center justify-center p-6">
            <div className="w-12 h-12 bg-gray-100 border border-gray-200/50 rounded-2xl flex items-center justify-center text-gray-400 mb-3 shadow-inner">
              <BellOff size={20} strokeWidth={1.8} />
            </div>
            <h4 className="text-sm font-bold text-gray-800 tracking-tight">Todo al corriente</h4>
            <p className="text-xs text-gray-400 font-medium max-w-xs mt-1">
              {filter === "all" 
                ? "No tienes alertas ni interacciones registradas en tu perfil por el momento."
                : "No te quedan notificaciones sin leer. ¡Buen trabajo!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}