import { useState, useEffect } from "react";
import { Flame, Sparkles, UserPlus, Check, Loader2 } from "lucide-react";

interface TrendItem {
  hashtag: string;
  postsCount: string;
}

interface SuggestionUser {
  tag: string;
  name: string;
  profile_picture_url?: string;
  bio?: string;
}

type Props = {
  onSearchTrend?: (trend: string) => void;
  onFollowSuggestion?: (tag: string) => void;
  followedUserIds?: string[];
};

const trends: TrendItem[] = [
  { hashtag: "#Monterrey", postsCount: "8.1K posts" },
  { hashtag: "#Clima", postsCount: "21K posts" },
  { hashtag: "#Humor", postsCount: "6.7K posts" },
  { hashtag: "#Canción", postsCount: "12.4K posts" },
  { hashtag: "#Supermercado", postsCount: "3.2K posts" },
];

export default function RightPanel({ onSearchTrend, onFollowSuggestion, followedUserIds = [] }: Props) {
  const [suggestions, setSuggestions] = useState<SuggestionUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const myTag = (localStorage.getItem("user_tag") || "").replace("@", "");

  useEffect(() => {
    const loadSuggestions = async () => {
      const token = localStorage.getItem("token");
      if (!token || !myTag) return;

      try {
        // Traemos los followers del usuario actual como sugerencias
        // (personas que te siguen pero tú no sigues de vuelta)
        const [followersRes, followingRes] = await Promise.all([
          fetch(`http://localhost:8080/v1/users/${myTag}/followers`, {
            headers: { "Authorization": `Bearer ${token}` },
          }),
          fetch(`http://localhost:8080/v1/users/${myTag}/following`, {
            headers: { "Authorization": `Bearer ${token}` },
          }),
        ]);

        const followers: SuggestionUser[] = followersRes.ok ? await followersRes.json() : [];
        const following: SuggestionUser[] = followingRes.ok ? await followingRes.json() : [];

        const followingTags = new Set(
          (following || []).map((u) => (u.tag || "").replace("@", ""))
        );

        // Sugerimos a quienes te siguen pero tú no sigues de vuelta
        const notFollowedBack = (followers || [])
          .filter((u) => {
            const cleanTag = (u.tag || "").replace("@", "");
            return cleanTag !== myTag && !followingTags.has(cleanTag);
          })
          .slice(0, 3); // máximo 3 sugerencias

        setSuggestions(notFollowedBack);
      } catch (err) {
        console.error("Error cargando sugerencias:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSuggestions();
  }, []);

  return (
    <div className="space-y-4 animate-fade-in sticky top-6 h-[calc(100vh-48px)] overflow-y-auto no-scrollbar w-full max-w-[320px]">

      {/* Tendencias */}
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

      {/* Sugerencias de usuarios */}
      <div className="bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[32px] p-5 shadow-sm">
        <div className="flex items-center gap-2 px-1 mb-4">
          <Sparkles size={18} className="text-[#d6bfa7]" fill="currentColor" />
          <h2 className="text-[16px] font-bold tracking-tight text-gray-950">A quién seguir</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 size={16} className="animate-spin text-gray-400" />
          </div>
        ) : suggestions.length === 0 ? (
          <p className="text-xs text-gray-400 font-medium px-1 text-center py-2">
            No hay sugerencias por ahora.
          </p>
        ) : (
          <div className="space-y-4 px-1">
            {suggestions.map((user) => {
              const cleanTag = (user.tag || "").replace("@", "");
              const isFollowed = followedUserIds.includes(cleanTag);

              return (
                <div key={cleanTag} className="flex items-center justify-between gap-3 group">
                  <div className="flex gap-2.5 items-center min-w-0">
                    <img
                      src={user.profile_picture_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400"}
                      className="w-9 h-9 rounded-full object-cover border border-white shadow-sm shrink-0 transition-transform group-hover:scale-105"
                      alt={user.name}
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-gray-900 truncate leading-tight hover:underline">
                        {user.name}
                      </p>
                      <p className="text-gray-400 text-[11px] truncate mt-0.5 font-medium">
                        @{cleanTag}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onFollowSuggestion?.(cleanTag)}
                    className={`font-bold text-[11px] transition-all duration-150 px-3.5 py-1.5 rounded-full flex items-center gap-1 shrink-0 shadow-sm active:scale-95 ${
                      isFollowed
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-gray-950 text-white hover:bg-gray-800"
                    }`}
                  >
                    {isFollowed ? (
                      <><Check size={12} strokeWidth={2.5} /><span>Siguiendo</span></>
                    ) : (
                      <><UserPlus size={12} strokeWidth={2.5} /><span>Seguir</span></>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}