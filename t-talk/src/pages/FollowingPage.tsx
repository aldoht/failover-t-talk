import type { Post } from "../services/api";
import PostCard from "../components/PostCard";
import { Users } from "lucide-react";

interface Props {
  posts: Post[];
  onOpenPost?: (post: Post) => void;
  onLikePost?: (id: number) => void;
  onFollowPost?: (id: number) => void;
  onDeletePost?: (id: number) => void;
  onEditPost?: (id: number, text: string) => void;
}

export default function FollowingPage({
  posts,
  onOpenPost,
  onLikePost,
  onFollowPost, 
  onDeletePost,
  onEditPost,
}: Props) {
  const followingPosts = posts.filter((post) => post.following);

  return (
    <div className="space-y-4 animate-fade-in">
      {followingPosts.length > 0 ? (
        followingPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onOpen={() => onOpenPost?.(post)}
            onLike={() => onLikePost?.(post.id)}
            onFollow={() => onFollowPost?.(post.id)} 
            onDelete={() => onDeletePost?.(post.id)}
            onEdit={(newText) => onEditPost?.(post.id, newText)}
          />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-white/30 backdrop-blur-xl rounded-[32px] border border-white/20 p-6 text-center">
          <div className="p-4 bg-white/60 rounded-full text-gray-400 mb-4 shadow-sm">
            <Users size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Tu feed está vacío</h3>
          <p className="text-gray-500 text-sm max-w-sm mt-1">
            Aún no sigues a nadie o las personas que sigues no han publicado contenido reciente.
          </p>
        </div>
      )}
    </div>
  );
}