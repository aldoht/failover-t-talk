import { useState } from "react";
import { createPost, CURRENT_USER } from "../services/api";
import type { Post } from "../services/api";

interface Props {
  onAddPost: (post: Post) => void;
}

export default function CreatePost({ onAddPost }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const newPost = await createPost(text);
      onAddPost(newPost);
      setText("");
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  return (
    <div className="p-6 border-b border-white/10">
      <div className="bg-white/40 backdrop-blur-xl border border-white/10 rounded-3xl p-5">
        <div className="flex gap-3 items-start">
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="¿Qué está pasando?"
            className="w-full bg-transparent outline-none resize-none text-lg text-gray-800 placeholder:text-gray-500"
            rows={4}
          />
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSubmit}
            className="bg-[#d6bfa7] hover:bg-[#c9ae91] text-gray-800 transition rounded-full px-6 py-3 font-semibold shadow-lg"
          >
            {loading ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}