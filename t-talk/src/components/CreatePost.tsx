import { useRef, useState, useEffect } from "react";
import { Image, Video, X, Link2 } from "lucide-react";

type Props = {
  onAddPost: (post: any) => void;
};

export default function CreatePost({ onAddPost }: Props) {
  const [text, setText] = useState("");
  const [mediaUrl, setMediaUrl] = useState(""); 
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [previewMedia, setPreviewMedia] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  const [myUserData, setMyUserData] = useState({
    name: "Cargando...",
    tag: "...",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400"
  });

  
  useEffect(() => {
    const savedName = localStorage.getItem("user_name");
    const savedTag = localStorage.getItem("user_tag");
    const savedAvatar = localStorage.getItem("user_profile_picture_url");

    if (savedName || savedTag) {
      setMyUserData({
        name: savedName || "Usuario de T-Talk",
        tag: savedTag || "usuario",
        avatar: savedAvatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400"
      });
    }
  }, []);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const MAX_CHARS = 280;
  const isPostEmpty = !text.trim() && !previewMedia && !mediaUrl;

  async function handleCreatePost() {
    if (isPostEmpty || isLoading) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("No hay una sesión activa. Por favor, inicia sesión de nuevo.");
      return;
    }

    setIsLoading(true);

    try {
    
      const response = await fetch("http://localhost:8080/v1/posts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
          url: previewMedia || mediaUrl || null, 
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo publicar en el servidor");
      }

      onAddPost({
        text: text.trim(),
        media_urls: previewMedia || mediaUrl ? [previewMedia || mediaUrl] : [],
      });
      
      setText("");
      setMediaUrl("");
      setPreviewMedia("");
      setMediaType(null);
      setShowUrlInput(false);

    } catch (err) {
      console.error("Error al crear el post en AWS:", err);
      alert("Hubo un error al publicar tu post. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }


  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewMedia(url);
    setMediaType("image");
    setMediaUrl(""); 
  }

  
  function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewMedia(url);
    setMediaType("video");
    setMediaUrl(""); 
  }

  function handleRemoveMedia() {
    setPreviewMedia("");
    setMediaType(null);
  }

  return (
    <div className="bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[32px] p-6 shadow-sm transition-all duration-300">
      <div className="flex gap-4 items-start">
        <img
          src={myUserData.avatar}
          alt={myUserData.name}
          className="w-11 h-11 rounded-full object-cover shadow-inner shrink-0 mt-1"
        />

        <div className="flex-1 min-w-0">
          
          <div className="mb-2">
            <p className="font-bold text-gray-900 text-sm leading-tight">{myUserData.name}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">@{myUserData.tag}</p>
          </div>

          <textarea
            value={text}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) {
                setText(e.target.value);
              }
            }}
            placeholder="¿Qué está pasando?"
            className="w-full bg-transparent text-gray-800 placeholder:text-gray-400 text-[16px] leading-relaxed outline-none resize-none pt-1"
            rows={3}
            disabled={isLoading}
          />

          {previewMedia && (
            <div className="relative mt-3 rounded-2xl overflow-hidden border border-gray-100 shadow-sm max-h-[350px] bg-black/5">
              {mediaType === "image" ? (
                <img src={previewMedia} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <video controls className="w-full max-h-[350px] object-cover">
                  <source src={previewMedia} />
                </video>
              )}
              <button
                onClick={handleRemoveMedia}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {showUrlInput && (
            <div className="mt-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-3 animate-fade-in">
              <input
                value={mediaUrl}
                onChange={(e) => {
                  setMediaUrl(e.target.value);
                  if (e.target.value) {
                    setPreviewMedia("");
                   
                    setMediaType(e.target.value.match(/\.(mp4|webm|ogg)/i) ? "video" : "image");
                  }
                }}
                placeholder="Pegar URL de foto o video (http://...)"
                className="w-full bg-white border border-gray-200 px-3 py-2 text-xs rounded-xl outline-none focus:border-gray-300 text-gray-700 transition"
                disabled={isLoading}
              />
            </div>
          )}

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageUpload}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            hidden
            onChange={handleVideoUpload}
          />

          <div className="border-t border-gray-100 mt-4 pt-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => imageInputRef.current?.click()}
                className="p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100/70 transition-colors"
                title="Subir Imagen desde dispositivo"
                disabled={isLoading}
              >
                <Image size={18} strokeWidth={2.2} />
              </button>

              <button
                onClick={() => videoInputRef.current?.click()}
                className="p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100/70 transition-colors"
                title="Subir Video desde dispositivo"
                disabled={isLoading}
              >
                <Video size={18} strokeWidth={2.2} />
              </button>

              <button
                onClick={() => setShowUrlInput(!showUrlInput)}
                className={`p-2 rounded-full transition-colors ${showUrlInput ? "text-gray-900 bg-gray-100" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100/70"}`}
                title="Insertar enlace multimedia"
                disabled={isLoading}
              >
                <Link2 size={18} strokeWidth={2.2} />
              </button>
            </div>

            <div className="flex items-center gap-4">
              {text.length > 0 && (
                <span
                  className={`text-[11px] font-bold tracking-tight transition-colors duration-150 ${
                    text.length > 250 ? "text-red-500" : "text-gray-400"
                  }`}
                >
                  {MAX_CHARS - text.length}
                </span>
              )}

              <button
                onClick={handleCreatePost}
                disabled={isPostEmpty || isLoading}
                className={`
                  px-5
                  py-2
                  rounded-full
                  text-xs
                  font-bold
                  transition-all
                  duration-200
                  shadow-sm
                  ${
                    isPostEmpty || isLoading
                      ? "bg-[#d6bfa7]/40 text-[#a38d77] cursor-not-allowed shadow-none"
                      : "bg-[#d6bfa7] hover:bg-[#c9ae91] text-gray-900 hover:shadow active:scale-95"
                  }
                `}
              >
                {isLoading ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}