import { useEffect, useState } from "react";
import type { Post } from "../services/api";
import {
  Heart,
  MessageCircle,
  UserPlus,
  Check,
  Trash2,
  X,
  MapPin,
  Clock3,
  Send,
} from "lucide-react";

type Props = {
  post: Post | null;
  onClose: () => void;
  onLike: (id: string) => void;
  onFollow: (id: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onEdit: (postId: string, text: string) => void;
  onDelete: () => void;
};

interface BackendComment {
  comment_id: string;
  user_name: string;
  user_tag: string;
  user_profile_pic_url?: string;
  text: string;
  created_at: string;
  like_count: number;
  liked?: boolean;
}

export default function PostModal({
  post,
  onClose,
  onLike,
  onFollow,
  onAddComment,
  onDeleteComment,
  onEdit,
  onDelete,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [comment, setComment] = useState("");
  const [liveComments, setLiveComments] = useState<BackendComment[]>([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const myTag = (localStorage.getItem("user_tag") || "").replace("@", "");

  const fetchComments = async (postId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/v1/posts/${postId}/comments`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data: BackendComment[] = await res.json();
      setLiveComments(data || []);
    } catch (err) {
      console.error("Error cargando comentarios:", err);
    }
  };

  useEffect(() => {
    if (post) {
      document.body.style.overflow = "hidden";
      setEditedText(post.text);
      setLiked(post.liked ?? false);
      setLikeCount(post.likes);
      fetchComments(post.id);
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [post]);

  if (!post) return null;

  async function handleToggleLike() {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (liked) {
      // Unlike
      await fetch(`/v1/posts/${post!.id}/likes/me`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      setLiked(false);
      setLikeCount((c) => Math.max(0, c - 1));
    } else {
      // Like
      await fetch(`/v1/posts/${post!.id}/likes`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });
      setLiked(true);
      setLikeCount((c) => c + 1);
    }

    onLike(post!.id);
  }

  async function handleSubmitComment() {
    if (!comment.trim() || !post) return;

    const textoComentario = comment;
    setComment("");

    await onAddComment(post.id, textoComentario);

    await fetchComments(post.id);
  }

  async function handleDeleteComment(commentId: string) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/v1/comments/${commentId}/me`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        setLiveComments((prev) => prev.filter((c) => c.comment_id !== commentId));
        onDeleteComment(post!.id, commentId);
      }
    } catch (err) {
      console.error("Error borrando comentario:", err);
    }
  }

  async function handleToggleCommentLike(commentId: string) {
  const token = localStorage.getItem("token");
  if (!token) return;

  const comment = liveComments.find((c) => c.comment_id === commentId);
  if (!comment) return;

  const alreadyLiked = comment.liked ?? false;

  try {
    if (alreadyLiked) {
      await fetch(`/v1/comments/${commentId}/likes/me`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
    } else {
      await fetch(`/v1/comments/${commentId}/likes`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });
    }

    setLiveComments((prev) =>
      prev.map((c) =>
        c.comment_id === commentId
          ? {
              ...c,
              liked: !alreadyLiked,
              like_count: alreadyLiked
                ? Math.max(0, c.like_count - 1)
                : c.like_count + 1,
            }
          : c
      )
    );
  } catch (err) {
    console.error("Error al togglear like en comentario:", err);
  }
}


  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white/90 backdrop-blur-2xl border border-white/40 rounded-[32px] shadow-2xl h-[85vh] flex flex-col overflow-hidden animate-fade-in"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/40 backdrop-blur-sm sticky top-0 z-10">
          <h3 className="font-bold text-gray-900 text-sm tracking-wide uppercase">Publicación</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center text-gray-500"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 no-scrollbar">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <img src={post.avatar} alt={post.name} className="w-12 h-12 rounded-full object-cover shadow-inner" />
              <div>
                <h2 className="font-bold text-gray-900 text-[16px] leading-tight">{post.name}</h2>
                <p className="text-gray-400 text-xs mt-0.5">{post.tag}</p>
                <div className="flex items-center gap-3 text-xs font-medium text-gray-400 mt-1.5">
                  <div className="flex items-center gap-1"><Clock3 size={12} /><span>{post.time}</span></div>
                  <div className="flex items-center gap-1"><MapPin size={12} /><span>{post.location}</span></div>
                </div>
              </div>
            </div>

            {!post.isOwnPost ? (
              <button
                onClick={() => onFollow(post.id)}
                className={`flex items-center gap-1.5 transition-all duration-200 active:scale-95 px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                  post.following ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-gray-950 text-white hover:bg-gray-800"
                }`}
              >
                {post.following ? (
                  <><Check size={13} strokeWidth={2.5} />Siguiendo</>
                ) : (
                  <><UserPlus size={13} strokeWidth={2.5} />Seguir</>
                )}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={onDelete}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  Eliminar
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl p-4 outline-none resize-none text-[16px] text-gray-800 focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300"
              rows={4}
            />
          ) : (
            <p className="text-[17px] leading-relaxed text-gray-800 whitespace-pre-wrap break-words">{post.text}</p>
          )}

          {post.image && !editing && (
            <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm max-h-[450px]">
              <img src={post.image} alt="Contenido" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex items-center gap-6 border-y border-gray-200/30 py-3.5 text-gray-400">
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-1.5 text-xs font-semibold transition duration-150 ${liked ? "text-pink-500" : "hover:text-pink-500"}`}
            >
              <Heart size={18} fill={liked ? "currentColor" : "none"} />
              <span>{likeCount} Me gusta</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
              <MessageCircle size={18} />
              <span>{liveComments.length} Comentarios</span>
            </div>
          </div>

          <div className="bg-white/60 border border-gray-200/50 rounded-2xl p-3 shadow-inner">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escribe una respuesta amable..."
              className="w-full bg-transparent outline-none resize-none text-[14px] text-gray-800 placeholder:text-gray-400"
              rows={2}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSubmitComment}
                disabled={!comment.trim()}
                className="bg-gray-950 hover:bg-gray-800 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 rounded-full flex items-center gap-1.5 transition shadow-sm duration-150 active:scale-95"
              >
                <Send size={12} />
                <span>Responder</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {liveComments.map((c) => {
              const isMyComment = (c.user_tag || "").replace("@", "") === myTag;
              return (
                <div key={c.comment_id} className="bg-white/40 border border-gray-200/30 rounded-2xl p-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex gap-3 min-w-0">
                      <img
                        src={c.user_profile_pic_url || "https://upload.wikimedia.org/wikipedia/commons/b/b1/Missing-image-232x150.png"}
                        alt={c.user_name}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{c.user_name}</div>
                        <div className="text-gray-400 text-xs">@{(c.user_tag || "").replace("@", "")}</div>
                      </div>
                    </div>
                   
                    {isMyComment && (
                      <button
                        onClick={() => handleDeleteComment(c.comment_id)}
                        className="text-gray-300 hover:text-red-400 transition p-1 rounded-full hover:bg-red-50 shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                    <p className="text-gray-700 text-[14px] mt-2.5">{c.text}</p>
                    <button
                      onClick={() => handleToggleCommentLike(c.comment_id)}
                      className={`flex items-center gap-1 mt-2 text-xs font-semibold transition-colors duration-150 active:scale-95 ${
                        c.liked ? "text-pink-500" : "text-gray-400 hover:text-pink-500"
                      }`}
                    >
                      <Heart size={13} fill={c.liked ? "currentColor" : "none"} />
                      <span>{c.like_count}</span>
                    </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}