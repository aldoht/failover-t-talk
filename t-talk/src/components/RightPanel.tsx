import { useState } from "react";
import { Flame, Sparkles, UserPlus, Check } from "lucide-react";

interface TrendItem {
  hashtag: string;
  postsCount: string;
}

interface SuggestionUser {
  id: number;
  name: string;
  tag: string;
  avatar: string;
}

type Props = {
  // Callback para cambiar la página y setear el query de búsqueda
  onSearchTrend?: (trend: string) => void;

  onFollowSuggestion?: (userId: number) => void;
 
  followedUserIds?: number[];
};

export default function RightPanel({ onSearchTrend, onFollowSuggestion, followedUserIds = [] }: Props) {
  const trends: TrendItem[] = [
    { hashtag: "#Mundial", postsCount: "12.4K posts" },
    { hashtag: "#Monterrey", postsCount: "8.1K posts" },
    { hashtag: "#Clima", postsCount: "21K posts" },
    { hashtag: "#Marvel", postsCount: "3.2K posts" },
    { hashtag: "#TTalk", postsCount: "6.7K posts" },
  ];

  // Mocks para usuarios sugeridos
  const [suggestions] = useState<SuggestionUser[]>([
    {
      id: 10,
      name: "Sophia Alvarez",
      tag: "@sophia",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400",
    },
    {
      id: 11,
      name: "Daniel Díaz",
      tag: "@danieldiaz",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400",
    },
  ]);

  return (
    <div className="space-y-4 animate-fade-in sticky top-6 h-[calc(100vh-48px)] overflow-y-auto no-scrollbar w-full max-w-[320px]">
      
      {/* tendencias */}
      <div className="bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[32px] p-5 shadow-sm">
        <div className="flex items-center gap-2 px-1 mb-4">
          <Flame size={18} className="text-orange-500" fill="currentColor" />
          <h2 className="text-[16px] font-bold tracking-tight text-gray-950">Tendencias para ti</h2>
        </div>

        <div className="space-y-1.5">
          {trends.map((item) => (
            <button
              key={item.hashtag}
              onClick={() => onSearchTrend?.(item.hashtag)}
              className="w-full text-left hover:bg-gray-50/80 active:scale-[0.99] transition-all rounded-2xl px-4 py-3 border border-transparent block group"
            >
              <span className="text-gray-400 text-[11px] font-semibold block tracking-wide">
                Tendencia en Monterrey
              </span>
              <span className="font-bold text-gray-900 mt-0.5 text-sm block group-hover:text-gray-950">
                {item.hashtag}
              </span>
              <span className="text-gray-400 text-[11px] font-medium block mt-1">
                {item.postsCount}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* sugerencias de usuarios */}
      <div className="bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[32px] p-5 shadow-sm">
        <div className="flex items-center gap-2 px-1 mb-4">
          <Sparkles size={18} className="text-[#d6bfa7]" fill="currentColor" />
          <h2 className="text-[16px] font-bold tracking-tight text-gray-950">A quién seguir</h2>
        </div>

        <div className="space-y-4 px-1">
          {suggestions.map((user) => {
            const isFollowed = followedUserIds.includes(user.id);

            return (
              <div key={user.id} className="flex items-center justify-between gap-3 group">
                <div className="flex gap-2.5 items-center min-w-0 cursor-pointer">
                  <img 
                    src={user.avatar} 
                    className="w-9 h-9 rounded-full object-cover border border-white shadow-sm shrink-0 transition-transform group-hover:scale-105" 
                    alt={user.name} 
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-gray-900 truncate leading-tight hover:underline">
                      {user.name}
                    </p>
                    <p className="text-gray-400 text-[11px] truncate mt-0.5 font-medium">
                      {user.tag}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onFollowSuggestion?.(user.id)}
                  className={`
                    font-bold text-[11px] transition-all duration-150 
                    px-3.5 py-1.5 rounded-full flex items-center gap-1 shrink-0 shadow-sm
                    active:scale-95
                    ${
                      isFollowed
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-gray-950 text-white hover:bg-gray-800"
                    }
                  `}
                >
                  {isFollowed ? (
                    <>
                      <Check size={12} strokeWidth={2.5} />
                      <span>Siguiendo</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={12} strokeWidth={2.5} />
                      <span>Seguir</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}