import { useState, useEffect } from "react";
import type { Post } from "../services/api";
import PostCard from "../components/PostCard";
import { Users, Loader2 } from "lucide-react";

interface Props {
  posts: Post[];
  onOpenPost?: (post: Post) => void;
  onLikePost?: (id: string) => void;
  onFollowPost?: (tag: string) => void;
  onDeletePost?: (id: string) => void;
  onEditPost?: (id: string, text: string) => void;
}

interface BackendPost {
  post_id: string;
  user_name: string;
  user_tag: string;
  user_profile_pic_url?: string;
  text: string;
  created_at: string;
  media_urls?: string[];
  like_count: number;
  comment_count?: number;
}

export default function FollowingPage({
  onOpenPost,
  onLikePost,
  onFollowPost,
  onDeletePost,
  onEditPost,
}: Props) {
  const [followingPosts, setFollowingPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFollowingFeed = async () => {
      const token = localStorage.getItem("token");
      let myTag = (localStorage.getItem("user_tag") || "").replace("@", "");
      if (!token || !myTag) return;

      try {
        
        const followingRes = await fetch(`http://localhost:8080/v1/users/${myTag}/following`, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (!followingRes.ok) return;

        const followingList: { tag: string }[] = await followingRes.json();

        if (!followingList || followingList.length === 0) {
          setFollowingPosts([]);
          return;
        }

        const allPostsArrays = await Promise.all(
          followingList.map(async (user) => {
            const cleanTag = (user.tag || "").replace("@", "");
            try {
              const res = await fetch(`http://localhost:8080/v1/users/${cleanTag}/posts`, {
                headers: { "Authorization": `Bearer ${token}` },
              });
              if (!res.ok) return [];
              const data: BackendPost[] = await res.json();
              return data || [];
            } catch {
              return [];
            }
          })
        );

        const mapped: Post[] = allPostsArrays
          .flat()
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map((p) => {
            const rawTag = p.user_tag || "usuario";
            const cleanTag = rawTag.startsWith("@") ? rawTag : `@${rawTag}`;
            return {
              id: p.post_id,
              name: p.user_name || "Usuario",
              tag: cleanTag,
              avatar:
                p.user_profile_pic_url ||
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400",
              text: p.text,
              time: new Date(p.created_at).toLocaleDateString(),
              likes: p.like_count,
              comments: p.comment_count || 0,
              liked: false,
              following: true,
              isOwnPost: false,
              location: "Monterrey, MX",
              commentsData: [],
              image: p.media_urls && p.media_urls.length > 0 ? p.media_urls[0] : undefined,
            };
          });

        setFollowingPosts(mapped);
      } catch (err) {
        console.error("Error cargando feed de following:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFollowingFeed();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500 gap-2 font-medium text-sm">
        <Loader2 className="animate-spin" size={24} />
        <span>Cargando tu feed...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {followingPosts.length > 0 ? (
        followingPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onOpen={() => onOpenPost?.(post)}
            onLike={(id: string) => onLikePost?.(id)}
            onFollow={(tag: string) => onFollowPost?.(tag)}
            onDelete={(id: string) => onDeletePost?.(id)}
            onEdit={(id: string, newText: string) => onEditPost?.(id, newText)}
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