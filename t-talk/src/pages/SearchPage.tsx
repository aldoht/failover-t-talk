import { useState, useEffect } from "react";
import { Search, X, SlidersHorizontal, Users, Hash, Layers, Heart, MessageCircle } from "lucide-react";
import type { Post } from "../services/api"; 

interface Props {
  posts: Post[];
  onOpenPost: (post: Post) => void;
  onLikePost: (id: number) => void;
  onFollowPost: (id: number) => void;
  onDeletePost?: (id: number) => void;
  onEditPost?: (id: number, text: string) => void;
  initialQuery?: string;
}

export default function SearchPage({ 
  posts, 
  onOpenPost, 
  onLikePost, 
  onFollowPost,
  initialQuery = "" 
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<"all" | "users" | "tags">("all");
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleClear = () => setQuery("");

  const filteredPosts = (posts || []).filter((post) => {
    const matchesQuery =
      post.name.toLowerCase().includes(query.toLowerCase()) ||
      post.tag.toLowerCase().includes(query.toLowerCase()) ||
      post.text.toLowerCase().includes(query.toLowerCase());

    if (!matchesQuery) return false;

    if (activeFilter === "users") {
      return (
        post.name.toLowerCase().includes(query.toLowerCase()) ||
        post.tag.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (activeFilter === "tags") {
      return post.text.toLowerCase().includes("#") && post.text.toLowerCase().includes(query.toLowerCase());
    }

    return true;
  });

  return (
    <div className="w-full bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[32px] p-6 shadow-sm flex flex-col h-[calc(100vh-48px)] overflow-hidden transition-all duration-300">
      
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
          <button onClick={handleClear} className="absolute right-4 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200/50 transition">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex gap-2 pb-4 border-b border-gray-100 shrink-0 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveFilter("all")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
            activeFilter === "all" ? "bg-gray-950 text-white shadow-sm" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
        >
          <Layers size={13} />
          Todo
        </button>
        <button
          onClick={() => setActiveFilter("users")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
            activeFilter === "users" ? "bg-gray-950 text-white shadow-sm" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
        >
          <Users size={13} />
          Personas
        </button>
        <button
          onClick={() => setActiveFilter("tags")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
            activeFilter === "tags" ? "bg-gray-950 text-white shadow-sm" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
        >
          <Hash size={13} />
          Tendencias
        </button>
      </div>

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
              <div 
                key={post.id} 
                onClick={() => onOpenPost(post)}
                className="p-4 bg-gray-50/50 hover:bg-gray-100/70 border border-gray-100 rounded-2xl transition duration-200 flex flex-col gap-2 cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={post.avatar} alt={post.name} className="w-8 h-8 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-gray-900 truncate leading-tight">{post.name}</p>
                      <p className="text-gray-400 text-[11px] truncate">{post.tag}</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 text-xs leading-relaxed line-clamp-2 pl-0.5">
                  {post.text}
                </p>

                <div className="flex items-center gap-4 text-gray-400 text-[11px] font-medium pt-1 pl-0.5">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onLikePost(post.id);
                    }} 
                    className={`flex items-center gap-1 transition ${post.liked ? "text-pink-500" : "hover:text-pink-500"}`}
                  >
                    <Heart size={12} fill={post.liked ? "currentColor" : "none"} /> {post.likes}
                  </button>
                  <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.comments}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}