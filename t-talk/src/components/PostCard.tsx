import { useState } from "react";
import type { Post } from "../services/api";
import {
  Heart,
  MessageCircle,
  UserPlus,
  Check,
  Pencil,
  Trash2,
  MapPin,
  Clock3
} from "lucide-react";

interface Props {
  post: Post;
  onOpen?: () => void;
  onLike?: (id: number) => void;
  onFollow?: (id: number) => void;
  onDelete?: () => void;
  onEdit?: (text: string) => void;
}

export default function PostCard({
  post,
  onOpen,
  onLike,
  onFollow,
  onDelete,
  onEdit,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState(post.text);

  function handleFollow(e: React.MouseEvent) {
    e.stopPropagation();
    onFollow?.(post.id);
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    if (editing) {
      onEdit?.(editedText);
    }
    setEditing(!editing);
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    onDelete?.();
  }

  return (
    <div
      className="
      bg-white/40
      backdrop-blur-xl
      border border-white/30
      rounded-[24px]
      p-5
      hover:bg-white/60
      transition-all
      duration-300
      shadow-sm
      hover:shadow-md
      "
    >
      <div className="flex gap-4">
        <img
          src={post.avatar}
          alt={`Avatar de ${post.name}`}
          className="w-12 h-12 rounded-full object-cover shadow-inner shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div
            onClick={onOpen}
            className="flex items-start justify-between gap-4 cursor-pointer"
          >
            <div className="min-w-0">
              {/* name y arroba*/}
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-bold text-gray-900 text-[15px] hover:underline">
                  {post.name}
                </span>
                <span className="text-gray-400 text-xs truncate">
                  {post.tag}
                </span>
              </div>

              {/* hora y ubicación */}
              <div className="flex items-center gap-3 text-xs font-medium text-gray-400 mt-0.5 flex-wrap">
                <div className="flex items-center gap-1">
                  <Clock3 size={12} className="text-gray-400/80" />
                  <span>{post.time || "Ahora"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={12} className="text-gray-400/80" />
                  <span>{post.location || "Monterrey"}</span>
                </div>
              </div>
            </div>

           
            {!post.isOwnPost && (
              <button
                onClick={handleFollow}
                className={`
                  flex items-center gap-1.5
                  transition-all duration-200 active:scale-95
                  px-4 py-1.5
                  rounded-full
                  text-xs font-semibold
                  shadow-sm
                  ${
                    post.following
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-gray-950 text-white hover:bg-gray-800"
                  }
                `}
              >
                {post.following ? (
                  <>
                    <Check size={13} strokeWidth={2.5} />
                    Siguiendo
                  </>
                ) : (
                  <>
                    <UserPlus size={13} strokeWidth={2.5} />
                    Seguir
                  </>
                )}
              </button>
            )}
          </div>

          {/* editar texto*/}
          {editing ? (
            <div className="mt-3" onClick={(e) => e.stopPropagation()}>
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="
                w-full
                bg-white/70
                border border-gray-200/50
                focus:border-gray-300
                rounded-xl
                p-3
                outline-none
                resize-none
                text-[15px]
                text-gray-800
                transition-all
                focus:ring-2
                focus:ring-gray-900/5
                "
                rows={3}
                placeholder="¿Qué estás pensando?"
              />
            </div>
          ) : (
            <p
              onClick={onOpen}
              className="
              mt-3
              leading-relaxed
              text-[15px]
              text-gray-800
              cursor-pointer
              whitespace-pre-wrap
              break-words
              "
            >
              {post.text}
            </p>
          )}

          {/* poner imagen o video */}
          {post.image && !editing && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-white/20 shadow-sm max-h-[450px]">
              <img
                onClick={onOpen}
                src={post.image}
                alt="Contenido del post"
                className="w-full h-full object-cover cursor-pointer hover:scale-[1.01] transition-transform duration-300"
              />
            </div>
          )}

          {post.video && !editing && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-white/20 shadow-sm bg-black/5">
              <video
                controls
                onClick={(e) => e.stopPropagation()}
                className="w-full max-h-[450px] object-cover"
              >
                <source src={post.video} />
              </video>
            </div>
          )}

         
          <div className="flex items-center justify-between mt-4 pt-1">
            {/*  botones */}
            <div className="flex gap-6 text-gray-400 items-center">
              {/* like */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLike?.(post.id);
                }}
                className={`
                  flex items-center gap-1.5 text-xs font-semibold
                  transition-colors duration-200 active:scale-95
                  ${post.liked ? "text-pink-500" : "hover:text-pink-500"}
                `}
              >
                <Heart size={16} fill={post.liked ? "currentColor" : "none"} />
                <span>{post.likes}</span>
              </button>

              {/* comentar */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen?.();
                }}
                className="
                flex items-center gap-1.5 text-xs font-semibold
                hover:text-blue-500 transition-colors duration-200
                "
              >
                <MessageCircle size={16} />
                <span>{post.comments}</span>
              </button>
            </div>

            {/* acciones para publicaciones propias */}
            {post.isOwnPost && (
              <div className="flex gap-3">
                {/* boton editar */}
                <button
                  onClick={handleEdit}
                  className="
                  flex items-center gap-1 text-xs font-medium
                  text-gray-400 hover:text-gray-700 transition-colors
                  px-2 py-1 rounded-md hover:bg-white/50
                  "
                >
                  <Pencil size={13} />
                  <span>{editing ? "Guardar" : "Editar"}</span>
                </button>

                {/* eliminar */}
                <button
                  onClick={handleDelete}
                  className="
                  flex items-center gap-1 text-xs font-medium
                  text-gray-400 hover:text-red-600 transition-colors
                  px-2 py-1 rounded-md hover:bg-red-50/50
                  "
                >
                  <Trash2 size={13} />
                  <span>Eliminar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}