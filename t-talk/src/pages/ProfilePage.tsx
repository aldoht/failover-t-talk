import { useState, useEffect } from "react";
import PostCard from "../components/PostCard";
import { Pencil, MapPin, Sparkles, X, Check, Loader2 } from "lucide-react";
import type { Post } from "../services/api";

interface Props {
  posts?: Post[]; // Recibimos los posts desde App.tsx
  onOpenPost?: (post: any) => void;
  onLikePost?: (id: string) => void;
  onFollowPost?: (tag: string) => void;
  onDeletePost?: (id: string) => void;
  onEditPost?: (id: string, text: string) => void;
}

export default function ProfilePage({
  posts = [],
  onOpenPost,
  onLikePost,
  onFollowPost,
  onDeletePost,
  onEditPost,
}: Props) {
  const [activeTab, setActiveTab] = useState<"posts" | "liked">("posts");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    name: "",
    tag: "",
    bio: "",
    profile_picture_url: "",
    location: "Monterrey, MX",
  });

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [tempName, setTempName] = useState("");
  const [tempBio, setTempBio] = useState("");
  const [tempLocation, setTempLocation] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      let myTag = localStorage.getItem("user_tag");
      if (!myTag || myTag === "null" || myTag === "undefined") {
        myTag = "usuario"; 
      }
      myTag = myTag.replace("@", "");

      try {
        const userRes = await fetch(`http://localhost:8080/v1/users/${myTag}`);
        const followersRes = await fetch(`http://localhost:8080/v1/users/${myTag}/followers`);
        const followingRes = await fetch(`http://localhost:8080/v1/users/${myTag}/following`);

        if (userRes.ok) {
          const userData = await userRes.json();
          setProfileData({
            name: userData.name || localStorage.getItem("user_name") || "Usuario",
            tag: userData.tag || myTag,
            bio: userData.bio || "¡Hola! Estoy usando T-Talk.",
            profile_picture_url: userData.profile_picture_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400",
            location: "Monterrey, MX",
          });
        } else {
           // Fallback seguro si el servidor falla
           setProfileData({
            name: localStorage.getItem("user_name") || "Usuario",
            tag: myTag,
            bio: "¡Hola! Estoy usando T-Talk.",
            profile_picture_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400",
            location: "Monterrey, MX",
          });
        }

        if (followersRes.ok) {
          const followersData = await followersRes.json();
          setFollowersCount(followersData.length || 0);
        }
        if (followingRes.ok) {
          const followingData = await followingRes.json();
          setFollowingCount(followingData.length || 0);
        }
      } catch (err) {
        console.error("Error conectando con la API:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Filtramos para mostrar solo los posts que le pertenecen al usuario
  const myTag = (localStorage.getItem("user_tag") || "").replace("@", "");
  const postsToRender = activeTab === "posts" ? posts.filter(p => p.tag.replace("@", "") === myTag) : []; 

  function handleSaveProfile() {
    if (!tempName.trim()) return;
    setProfileData((prev) => ({ ...prev, name: tempName, bio: tempBio, location: tempLocation }));
    setIsEditingProfile(false);
  }

  function handleOpenModal() {
    setTempName(profileData.name);
    setTempBio(profileData.bio);
    setTempLocation(profileData.location);
    setIsEditingProfile(true);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500 gap-2 font-medium text-sm">
        <Loader2 className="animate-spin text-[#8b7355]" size={24} />
        <span>Cargando perfil...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto pb-12 w-full">
      <div className="bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[32px] overflow-hidden shadow-sm">
        <div className="h-40 bg-gradient-to-tr from-[#e6ccb2] via-[#ede0d4] to-[#ddc3a5] relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
        </div>

        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-start gap-4">
            <div className="relative">
              <img
                src={profileData.profile_picture_url}
                alt={profileData.name}
                className="w-24 h-24 rounded-full border-4 border-white shadow-sm -mt-12 object-cover transition-transform duration-300 hover:scale-105"
              />
              <h2 className="text-2xl font-black mt-3 tracking-tight text-gray-900 leading-tight">
                {profileData.name}
              </h2>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-0.5 rounded-full">
                  @{profileData.tag}
                </span>
                <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                  <MapPin size={12} /> {profileData.location}
                </span>
              </div>
            </div>

            <button
              onClick={handleOpenModal}
              className="mt-4 bg-gray-950 hover:bg-gray-800 text-white font-bold text-xs shadow-sm hover:shadow transition-all duration-200 px-4 py-2 rounded-full flex items-center gap-1.5 active:scale-95"
            >
              <Pencil size={12} />
              Editar perfil
            </button>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-gray-600 font-medium max-w-xl">
            {profileData.bio}
          </p>

          <div className="flex gap-6 mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-lg text-gray-900">{postsToRender.length}</span>
              <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">Publicaciones</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-lg text-gray-900">{followersCount}</span>
              <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">Followers</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-lg text-gray-900">{followingCount}</span>
              <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">Following</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-100 flex gap-6 px-4 text-xs font-bold shrink-0">
        <button
          onClick={() => setActiveTab("posts")}
          className={`pb-3 px-1 transition-all ${activeTab === "posts" ? "text-gray-950 border-b-2 border-gray-950" : "text-gray-400 hover:text-gray-600"}`}
        >
          Mis Publicaciones
        </button>
        <button
          onClick={() => setActiveTab("liked")}
          className={`pb-3 px-1 transition-all ${activeTab === "liked" ? "text-gray-950 border-b-2 border-gray-950" : "text-gray-400 hover:text-gray-600"}`}
        >
          Me gusta
        </button>
      </div>

      <div className="space-y-4">
        {postsToRender.length > 0 ? (
          postsToRender.map((post) => (
            <PostCard
              key={post.id}
              post={post} // ¡Ahora sí pasamos el post limpio desde App!
              onOpen={() => onOpenPost?.(post)}
              onLike={() => onLikePost?.(post.id)}
              onFollow={() => onFollowPost?.(post.tag)}
              onDelete={() => onDeletePost?.(post.id)}
              onEdit={(newText) => onEditPost?.(post.id, newText)}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white/30 border border-dashed border-gray-200 rounded-[24px] text-gray-400 text-xs font-medium">
            {activeTab === "posts" ? "Aún no has creado ninguna publicación pública." : "Aún no le has dado 'Me gusta' a ninguna publicación."}
          </div>
        )}
      </div>

      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setIsEditingProfile(false)}>
          <div className="bg-white/95 backdrop-blur-2xl border border-white rounded-[28px] p-6 shadow-xl w-full max-w-md space-y-4 transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles size={14} className="text-[#d6bfa7]" fill="currentColor" /> Editar tu Perfil
              </h3>
              <button onClick={() => setIsEditingProfile(false)} className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 rounded-full">
                <X size={14} />
              </button>
            </div>
            <div className="space-y-3.5">
              <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Nombre Público</label><input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3 py-2 text-xs text-gray-900 font-medium outline-none focus:border-gray-300 transition" /></div>
              <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Ubicación</label><input type="text" value={tempLocation} onChange={(e) => setTempLocation(e.target.value)} className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl px-3 py-2 text-xs text-gray-900 font-medium outline-none focus:border-gray-300 transition" /></div>
              <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Biografía</label><textarea value={tempBio} onChange={(e) => setTempBio(e.target.value)} rows={3} className="w-full bg-gray-50/50 border border-gray-200/60 rounded-xl p-3 text-xs text-gray-700 font-medium outline-none focus:border-gray-300 transition resize-none leading-relaxed" /></div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={handleSaveProfile} disabled={!tempName.trim()} className="bg-gray-950 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs px-5 py-2 rounded-full flex items-center gap-1.5 shadow-sm transition active:scale-95">
                <Check size={12} strokeWidth={2.5} />Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}