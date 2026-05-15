import { useState } from "react";
import type { Post } from "../services/api";

import {
  Heart,
  MessageCircle,
  UserPlus,
  Check
} from "lucide-react";

interface Props {
  post: Post;
}

export default function PostCard({ post }: Props) {

  const [liked, setLiked] = useState(false);

  const [likes, setLikes] = useState(post.likes);

  const [following, setFollowing] = useState(false);

  const [showComments, setShowComments] = useState(false);

  const [comment, setComment] = useState("");

  function handleLike() {

    setLiked(!liked);

    setLikes(
      liked ? likes - 1 : likes + 1
    );
  }

  return (

    <div
      className="
      bg-white/40
      backdrop-blur-xl
      border border-white/30
      rounded-3xl
      p-5
      hover:bg-white/60
      transition
      "
    >

      <div className="flex gap-4">

    <img
          src={post.avatar}
          alt="avatar"
          className="
          w-14
          h-14
          rounded-full
          object-cover
          "
        />

        <div className="flex-1">

          <div className="flex items-center gap-2">

            <p className="font-bold">
              {post.name}
            </p>

            <p className="text-gray-500">
              {post.tag}
            </p>

          </div>

          <p className="mt-3 leading-relaxed text-[15px]">
            {post.text}
          </p>

          <div className="flex gap-8 mt-5 text-gray-500 items-center">

            {/* LIKE */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 hover:text-pink-400 transition ${
                liked ? "text-pink-400" : ""
              }`}
            >
              <Heart size={18} />
              {likes}
            </button>

            {/* Comentario */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 hover:text-blue-400 transition"
            >
              <MessageCircle size={18} />
              {post.comments}
            </button>

            {/* seguir */}
            <button
              onClick={() => setFollowing(!following)}
              className={`
                flex items-center gap-2
                transition
                px-4
                py-2
                rounded-full
                text-sm
                ${
                  following
                    ? "bg-green-100 text-green-700"
                    : "hover:text-green-500"
                }
              `}
            >

              {following ? (
                <>
                  <Check size={16} />
                  Siguendo
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Seguir
                </>
              )}

            </button>

          </div>

          {/* seccion de comentarios */}
          {showComments && (

            <div
              className="
              mt-5
              bg-white/50
              backdrop-blur-xl
              border border-white/30
              rounded-3xl
              p-5
              "
            >

              <h3 className="font-semibold text-lg mb-4">
                Comentarios
              </h3>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="
                w-full
                bg-white/60
                rounded-2xl
                p-4
                outline-none
                resize-none
                text-gray-800
                placeholder:text-gray-500
                "
                rows={3}
              />

              <div className="flex justify-end mt-4">

                <button
                  className="
                  bg-[#d6bfa7]
                  hover:bg-[#c9ae91]
                  px-5
                  py-2
                  rounded-full
                  transition
                  "
                >
                  Comentar
                </button>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}