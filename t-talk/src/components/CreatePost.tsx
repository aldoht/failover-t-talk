import { useRef, useState } from "react";
import { Image, Video, X, Link2 } from "lucide-react";
import { currentUser, type Post } from "../services/api";

type Props = {
  onAddPost: (post: Post) => void;
};

export default function CreatePost({ onAddPost }: Props) {
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [showUrlInputs, setShowUrlInputs] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewVideo, setPreviewVideo] = useState("");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const MAX_CHARS = 280;
  const isPostEmpty = !text.trim() && !previewImage && !previewVideo && !imageUrl && !videoUrl;

  function handleCreatePost() {
    if (isPostEmpty) return;

    const newPost: Post = {
      id: Date.now(),
      name: currentUser.name,
      tag: currentUser.tag,
      avatar: currentUser.avatar,
      text,
      image: previewImage || imageUrl,
      video: previewVideo || videoUrl,
      likes: 0,
      comments: 0,
      liked: false,
      following: false,
      time: "Ahora", 
      location: currentUser.location,
      isOwnPost: true,
      commentsData: []
    };

    onAddPost(newPost);
    
    setText("");
    setImageUrl("");
    setVideoUrl("");
    setPreviewImage("");
    setPreviewVideo("");
    setShowUrlInputs(false);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const image = URL.createObjectURL(file);
    setPreviewImage(image);
    setImageUrl("");
  }

  function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const video = URL.createObjectURL(file);
    setPreviewVideo(video);
    setVideoUrl(""); 
  }

  return (
    <div className="bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[32px] p-6 shadow-sm transition-all duration-300">
      <div className="flex gap-4 items-start">
        {/* foto del usuario */}
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-11 h-11 rounded-full object-cover shadow-inner shrink-0 mt-1"
        />

        <div className="flex-1 min-w-0">
          {/* info usuario */}
          <div className="mb-2">
            <p className="font-bold text-gray-900 text-sm leading-tight">{currentUser.name}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{currentUser.location}</p>
          </div>

          {/* área de texto */}
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
          />

          {/* preview imagen subida */}
          {previewImage && (
            <div className="relative mt-3 rounded-2xl overflow-hidden border border-gray-100 shadow-sm max-h-[350px]">
              <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
              <button
                onClick={() => setPreviewImage("")}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* preview video subido */}
          {previewVideo && (
            <div className="relative mt-3 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-black/5">
              <video controls className="w-full max-h-[350px] object-cover">
                <source src={previewVideo} />
              </video>
              <button
                onClick={() => setPreviewVideo("")}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* para que ponga una url */}
          {showUrlInputs && (
            <div className="mt-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-3 animate-fade-in">
              <input
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  if (e.target.value) setPreviewImage(""); 
                }}
                placeholder="Pegar URL de Imagen (http://...)"
                className="w-full bg-white border border-gray-200 px-3 py-2 text-xs rounded-xl outline-none focus:border-gray-300 text-gray-700 transition"
              />
              <input
                value={videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value);
                  if (e.target.value) setPreviewVideo(""); 
                }}
                placeholder="Pegar URL de Video (http://...)"
                className="w-full bg-white border border-gray-200 px-3 py-2 text-xs rounded-xl outline-none focus:border-gray-300 text-gray-700 transition"
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
              >
                <Image size={18} strokeWidth={2.2} />
              </button>

              <button
                onClick={() => videoInputRef.current?.click()}
                className="p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100/70 transition-colors"
                title="Subir Video desde dispositivo"
              >
                <Video size={18} strokeWidth={2.2} />
              </button>

              <button
                onClick={() => setShowUrlInputs(!showUrlInputs)}
                className={`p-2 rounded-full transition-colors ${showUrlInputs ? "text-gray-900 bg-gray-100" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100/70"}`}
                title="Insertar enlaces de red"
              >
                <Link2 size={18} strokeWidth={2.2} />
              </button>
            </div>

            {/* contador de largo de texto*/}
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
                disabled={isPostEmpty}
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
                    isPostEmpty
                      ? "bg-[#d6bfa7]/40 text-[#a38d77] cursor-not-allowed shadow-none"
                      : "bg-[#d6bfa7] hover:bg-[#c9ae91] text-gray-900 hover:shadow active:scale-95"
                  }
                `}
              >
                Publicar
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}