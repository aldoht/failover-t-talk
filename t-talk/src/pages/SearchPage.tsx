import { useState, useEffect, useRef } from "react";
import { Search, X, SlidersHorizontal, Users, Hash, Layers, Heart, MessageCircle, UserPlus, Check, Loader2 } from "lucide-react";
import type { Post } from "../services/api";

interface Props {
  posts: Post[];
  followedTags: string[];
  onOpenPost: (post: Post) => void;
  onLikePost: (id: string) => void;
  onFollowPost: (tag: string) => void;
  onDeletePost?: (id: string) => void;
  onEditPost?: (id: string, text: string) => void;
  initialQuery?: string;
}

interface UserProfile {
  name: string;
  tag: string;
  profile_picture_url?: string;
  bio?: string;
}

export default function SearchPage({
  posts,
  followedTags, 
  onOpenPost,
  onLikePost,
  onFollowPost,
  initialQuery = "",
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<"all" | "users" | "tags">("all");
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
  const [userNotFound, setUserNotFound] = useState(false);
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const myTag = (localStorage.getItem("user_tag") || "").replace("@", "");

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Cargamos los tags que ya seguimos para el botón
 

  // Búsqueda de usuario en el backend con debounce
  useEffect(() => {
    if (activeFilter !== "users") {
      setFoundUser(null);
      setUserNotFound(false);
      return;
    }

    const cleanQuery = query.trim().replace("@", "");
    if (!cleanQuery) {
      setFoundUser(null);
      setUserNotFound(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const token = localStorage.getItem("token");
      setIsSearchingUser(true);
      setFoundUser(null);
      setUserNotFound(false);

      try {
        const res = await fetch(`http://localhost:8080/v1/users/${cleanQuery}`, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (res.ok) {
          const data: UserProfile = await res.json();
          setFoundUser(data);
        } else {
          setUserNotFound(true);
        }
      } catch {
        setUserNotFound(true);
      } finally {
        setIsSearchingUser(false);
      }
    }, 500);
  }, [query, activeFilter]);

  async function handleFollowUser(tag: string) {
    onFollowPost(tag.replace("@", ""));  
  }

  const filteredPosts = (posts || []).filter((post) => {
    const q = query.toLowerCase();
    const matchesQuery =
      post.name.toLowerCase().includes(q) ||
      post.tag.toLowerCase().includes(q) ||
      post.text.toLowerCase().includes(q);

    if (!matchesQuery) return false;

    if (activeFilter === "users") {
      return (
        post.name.toLowerCase().includes(q) ||
        post.tag.toLowerCase().includes(q)
      );
    }

    if (activeFilter === "tags") {
      return post.text.includes("#") && post.text.toLowerCase().includes(q);
    }

    return true;
  });

  return (
    <div className="w-full bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[32px] p-6 shadow-sm flex flex-col h-[calc(100vh-48px)] overflow-hidden transition-all duration-300">

      {/* Barra de búsqueda */}
      <div className="relative flex items-center mb-4 shrink-0">
        <Search className="absolute left-4 text-gray-400" size={18} strokeWidth={2.2} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar personas, #hashtags o temas..."
          className="w-full bg-gray-50/60 border border-gray-100 focus:border-gray-200 focus:bg-white rounded-2xl pl-11 pr-10 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200/50 transition"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 pb-4 border-b border-gray-100 shrink-0 overflow-x-auto no-scrollbar">
        {[
          { key: "all", icon: <Layers size={13} />, label: "Contenido" },
          { key: "users", icon: <Users size={13} />, label: "Personas" },
          { key: "tags", icon: <Hash size={13} />, label: "Tendencias" },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
              activeFilter === key
                ? "bg-gray-950 text-white shadow-sm"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Resultados */}
      <div className="flex-1 overflow-y-auto no-scrollbar pt-4">
        {query.trim() === "" ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-3 shadow-inner">
              <SlidersHorizontal size={24} />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Explora T-Talk</h3>
            <p className="text-xs text-gray-400 max-w-xs mt-1 leading-relaxed">
              Escribe palabras clave para descubrir comunidades o encontrar creadores en Monterrey.
            </p>
          </div>
        ) : activeFilter === "users" ? (
          // --- Búsqueda de usuarios por tag ---
          <div className="space-y-3 animate-fade-in">
            {isSearchingUser ? (
              <div className="flex items-center justify-center py-12 gap-2 text-gray-400 text-xs font-medium">
                <Loader2 size={16} className="animate-spin" />
                Buscando usuario...
              </div>
            ) : foundUser ? (
              <>
                <p className="text-[11px] font-bold text-gray-400 px-1 uppercase tracking-wider mb-2">
                  Usuario encontrado
                </p>
                <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={foundUser.profile_picture_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400"}
                      alt={foundUser.name}
                      className="w-12 h-12 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate">{foundUser.name}</p>
                      <p className="text-gray-400 text-xs truncate">@{(foundUser.tag || "").replace("@", "")}</p>
                      {foundUser.bio && (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-2">{foundUser.bio}</p>
                      )}
                    </div>
                  </div>

                  {/* No mostramos el botón si es el propio usuario */}
                  {(foundUser.tag || "").replace("@", "") !== myTag && (
                    <button
                      onClick={() => handleFollowUser(foundUser.tag)}
                      className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm transition active:scale-95 ${
                        followedTags.includes((foundUser.tag || "").replace("@", ""))
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-gray-950 text-white hover:bg-gray-800"
                      }`}
                    >
                      {followedTags.includes((foundUser.tag || "").replace("@", "")) ? (
                        <><Check size={13} strokeWidth={2.5} />Siguiendo</>
                      ) : (
                        <><UserPlus size={13} strokeWidth={2.5} />Seguir</>
                      )}
                    </button>
                  )}
                </div>

                {/* Posts del usuario encontrado en el feed local */}
                {filteredPosts.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <p className="text-[11px] font-bold text-gray-400 px-1 uppercase tracking-wider">
                      Publicaciones ({filteredPosts.length})
                    </p>
                    {filteredPosts.map((post) => (
                      <PostResult key={post.id} post={post} onOpenPost={onOpenPost} onLikePost={onLikePost} />
                    ))}
                  </div>
                )}
              </>
            ) : userNotFound ? (
              <div className="text-center py-8 text-gray-400 text-xs font-medium">
                No se encontró ningún usuario con el tag "{query.replace("@", "")}".
              </div>
            ) : null}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs font-medium">
            No se encontraron coincidencias para "{query}" en esta categoría.
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            <p className="text-[11px] font-bold text-gray-400 px-1 uppercase tracking-wider">
              Resultados encontrados ({filteredPosts.length})
            </p>
            {filteredPosts.map((post) => (
              <PostResult key={post.id} post={post} onOpenPost={onOpenPost} onLikePost={onLikePost} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente auxiliar para mostrar un post en resultados
function PostResult({
  post,
  onOpenPost,
  onLikePost,
}: {
  post: Post;
  onOpenPost: (post: Post) => void;
  onLikePost: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onOpenPost(post)}
      className="p-4 bg-gray-50/50 hover:bg-gray-100/70 border border-gray-100 rounded-2xl transition duration-200 flex flex-col gap-2 cursor-pointer active:scale-[0.99]"
    >
      <div className="flex items-center gap-2.5">
        <img src={post.avatar} alt={post.name} className="w-8 h-8 rounded-full object-cover" />
        <div className="min-w-0">
          <p className="font-bold text-xs text-gray-900 truncate leading-tight">{post.name}</p>
          <p className="text-gray-400 text-[11px] truncate">{post.tag}</p>
        </div>
      </div>
      <p className="text-gray-700 text-xs leading-relaxed line-clamp-2 pl-0.5">{post.text}</p>
      <div className="flex items-center gap-4 text-gray-400 text-[11px] font-medium pt-1 pl-0.5">
        <button
          onClick={(e) => { e.stopPropagation(); onLikePost(post.id); }}
          className={`flex items-center gap-1 transition ${post.liked ? "text-pink-500" : "hover:text-pink-500"}`}
        >
          <Heart size={12} fill={post.liked ? "currentColor" : "none"} /> {post.likes}
        </button>
        <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.comments}</span>
      </div>
    </div>
  );
}