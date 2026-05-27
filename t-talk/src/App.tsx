import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import BottomBar from "./components/BottomBar";
import CreatePost from "./components/CreatePost";
import PostCard from "./components/PostCard";
import PostModal from "./components/PostModal";
import SearchPage from "./pages/SearchPage";
import ProfilePage from "./pages/ProfilePage";
import FollowingPage from "./pages/FollowingPage";

import type { Post } from "./services/api";

export interface BackendPost {
  post_id: string;
  user_name: string;
  user_tag: string;
  user_profile_pic_url?: string;
  text: string;
  created_at: string;
  media_urls?: string[];
  like_count: number;
  comment_count?: number;
  is_liked?: boolean;
  _following?: boolean; 
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [page, setPage] = useState("home");
  const [posts, setPosts] = useState<BackendPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BackendPost | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [followedTags, setFollowedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());

  const loadPosts = async () => {
  const token = localStorage.getItem("token");
  let myTag = localStorage.getItem("user_tag");
  if (!token || !myTag) return;
  myTag = myTag.replace("@", "");

  try {
    const [myPostsRes, followingRes] = await Promise.all([
      fetch(`/v1/users/${myTag}/posts`, {
        headers: { "Authorization": `Bearer ${token}` },
      }),
      fetch(`/v1/users/${myTag}/following`, {
        headers: { "Authorization": `Bearer ${token}` },
      }),
    ]);

    const myPosts: BackendPost[] = myPostsRes.ok ? await myPostsRes.json() : [];
    const followingList: { tag: string }[] = followingRes.ok ? await followingRes.json() : [];

    const cleanFollowedTags = (followingList || []).map((u) =>
      (u.tag || "").replace("@", "")
    );
    setFollowedTags(cleanFollowedTags); 

    const followingPostsArrays = await Promise.all(
      cleanFollowedTags.map(async (tag) => {
        try {
          const res = await fetch(`/v1/users/${tag}/posts`, {
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

    const allPosts = [...(myPosts || []), ...followingPostsArrays.flat()];
    const uniquePosts = Array.from(
      new Map(allPosts.map((p) => [p.post_id, p])).values()
    );
    uniquePosts.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const likedIds = new Set(
   uniquePosts.filter((p) => p.is_liked).map((p) => p.post_id)
    );
    setLikedPostIds(likedIds);

    setPosts(uniquePosts.map((p) => ({
      ...p,
      _following: cleanFollowedTags.includes((p.user_tag || "").replace("@", ""))
    })));

  } catch (err) {
    console.error("Error recuperando el feed:", err);
  }
};
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      loadPosts().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const handlePageChange = (newPage: string) => {
    if (newPage !== "search") setSearchQuery("");
    setPage(newPage);
  };

  function handleAddPost(_newPost: any) {
  loadPosts();
}

  async function handleToggleLike(postId: string) {
    const token = localStorage.getItem("token");
    if (!token) return;

    const alreadyLiked = likedPostIds.has(postId);

    try {
      if (alreadyLiked) {
        await fetch(`/v1/posts/${postId}/likes/me`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` },
        });
        setPosts((prev) =>
          prev.map((p) =>
            p.post_id === postId ? { ...p, like_count: Math.max(0, p.like_count - 1) } : p
          )
        );
        setLikedPostIds((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
      } else {
        await fetch(`/v1/posts/${postId}/likes`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
        });
        setPosts((prev) =>
          prev.map((p) =>
            p.post_id === postId ? { ...p, like_count: p.like_count + 1 } : p
          )
        );
        setLikedPostIds((prev) => new Set(prev).add(postId));
      }
    } catch (err) {
      console.error("Error al togglear like:", err);
    }
  }

  async function handleToggleFollow(targetTag: string) {
    const token = localStorage.getItem("token");
    const cleanTag = targetTag.replace("@", "");
    if (!token) return;

    const isFollowing = followedTags.includes(cleanTag);
    try {
      const url = `/v1/users/${cleanTag}/followers`;
      const response = await fetch(isFollowing ? `${url}/me` : url, {
        method: isFollowing ? "DELETE" : "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        setFollowedTags((prev) =>
          isFollowing ? prev.filter((t) => t !== cleanTag) : [...prev, cleanTag]
        );
      
        loadPosts();
      }
    } catch (err) {
      console.error("Error al seguir:", err);
    }
  }

  const handleAddComment = async (postId: string, text: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await fetch(`/v1/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      setPosts((prev) =>
        prev.map((post) =>
          post.post_id === postId
            ? { ...post, comment_count: (post.comment_count || 0) + 1 }
            : post
        )
      );
    } catch (err) {
      console.error("Error al comentar:", err);
    }
  };

  async function handleDeletePost(postId: string) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`/v1/posts/${postId}/me`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (response.ok) {
        setPosts((prev) => prev.filter((post) => post.post_id !== postId));
        setSelectedPost(null);
      }
    } catch (err) {
      console.error("Error al borrar post:", err);
    }
  }

  async function handleDeleteComment(postId: string, commentId: string) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`/v1/comments/${commentId}/me`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (response.ok) {
        setPosts((prev) =>
          prev.map((post) =>
            post.post_id === postId
              ? { ...post, comment_count: Math.max(0, (post.comment_count || 0) - 1) }
              : post
          )
        );
        return true;
      }
    } catch (err) {
      console.error("Error al borrar comentario:", err);
    }
    return false;
  }

  async function handleEditPost(postId: string, newText: string) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`/v1/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newText }),
      });
    } catch (err) {
      console.error("Error editando post:", err);
    }

    setPosts((prev) =>
      prev.map((post) => post.post_id === postId ? { ...post, text: newText } : post)
    );
  }

  if (isLoading) return (
    <div className="min-h-screen bg-[#f5efe6] flex items-center justify-center font-bold text-gray-400">
      Iniciando T-Talk...
    </div>
  );

  if (!isLoggedIn) {
  window.location.href = "/login";
  return null;
}

  const mapToPost = (p: BackendPost): Post => {
    const rawTag = p.user_tag || "usuario";
    const cleanTag = rawTag.startsWith("@") ? rawTag : `@${rawTag}`;
    return {
      id: p.post_id,
      name: p.user_name || "Usuario",
      tag: cleanTag,
      avatar:
        p.user_profile_pic_url ||
        "https://upload.wikimedia.org/wikipedia/commons/b/b1/Missing-image-232x150.png",
      text: p.text,
      time: new Date(p.created_at).toLocaleDateString(),
      likes: p.like_count,
      comments: p.comment_count || 0,
      liked: likedPostIds.has(p.post_id),
      following: p._following ?? followedTags.includes(rawTag.replace("@", "")),
      isOwnPost:
        rawTag.replace("@", "") ===
        (localStorage.getItem("user_tag") || "").replace("@", ""),
      location: "Monterrey, MX",
      commentsData: [],
      image: p.media_urls && p.media_urls.length > 0 ? p.media_urls[0] : undefined,
    };
  };

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const legacyMappedPosts: Post[] = sortedPosts.map(mapToPost);

  function renderPage() {
    switch (page) {
      case "search":
        return (
          <SearchPage
            posts={legacyMappedPosts}
            followedTags={followedTags}  
            onOpenPost={(post: any) =>
              setSelectedPost(posts.find((p) => p.post_id === String(post.id)) || null)
            }
            onLikePost={(id: any) => handleToggleLike(String(id))}
            onFollowPost={(tag: any) => handleToggleFollow(String(tag))}
            onDeletePost={(id: any) => handleDeletePost(String(id))}
            onEditPost={(id: any, txt: string) => handleEditPost(String(id), txt)}
            initialQuery={searchQuery}
          />
        );

      case "profile":
        return (
          <ProfilePage
            posts={legacyMappedPosts}
            onOpenPost={(post: any) =>
              setSelectedPost(posts.find((p) => p.post_id === String(post.id)) || null)
            }
            onLikePost={(id: any) => handleToggleLike(String(id))}
            onFollowPost={(tag: any) => handleToggleFollow(String(tag))}
            onDeletePost={(id: any) => handleDeletePost(String(id))}
            onEditPost={(id: any, txt: string) => handleEditPost(String(id), txt)}
          />
        );

      case "following":
        return (
          <FollowingPage
            posts={legacyMappedPosts}
            onOpenPost={(post: any) =>
              setSelectedPost(posts.find((p) => p.post_id === String(post.id)) || null)
            }
            onLikePost={(id: any) => handleToggleLike(String(id))}
            onFollowPost={(tag: any) => handleToggleFollow(String(tag))}
            onDeletePost={(id: any) => handleDeletePost(String(id))}
            onEditPost={(id: any, txt: string) => handleEditPost(String(id), txt)}
          />
        );

     
      default:
        return (
          <>
            <CreatePost onAddPost={handleAddPost} />
            <div className="space-y-4 mt-4">
              {legacyMappedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onOpen={() =>
                    setSelectedPost(posts.find((p) => p.post_id === post.id) || null)
                  }
                  onLike={(id: string) => handleToggleLike(id)}
                  onFollow={(tag: string) => handleToggleFollow(tag)}
                  onDelete={(id: string) => handleDeletePost(id)}
                  onEdit={(id: string, newText: string) => handleEditPost(id, newText)}
                />
              ))}
            </div>
          </>
        );
    }
  }

  return (
    <div className="min-h-screen text-gray-800 bg-gradient-to-br from-gray-50 via-gray-100 to-zinc-200/70 attachment-fixed font-sans antialiased">
      <div className="max-w-[1700px] mx-auto grid lg:grid-cols-[260px_minmax(0,1fr)] gap-6 px-4 lg:px-6">
        <div className="hidden lg:block sticky top-0 h-screen py-6">
          <Sidebar page={page} setPage={handlePageChange} />
        </div>
        <main className="py-6 pb-32 lg:pb-6 w-full">
          <div className="bg-white/40 backdrop-blur-3xl border border-white/40 rounded-[32px] overflow-hidden shadow-xl min-h-[85vh] w-full">
            <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/50 border-b border-gray-200/20 px-6 py-5 flex items-center justify-between">
              <h1 className="text-2xl font-black tracking-tight text-gray-900 capitalize">
                {page === "home" ? "Inicio" : page}
              </h1>
            </div>
            <div className="p-4 lg:p-6">{renderPage()}</div>
          </div>
        </main>
      </div>
      <BottomBar page={page} setPage={handlePageChange} />
      <PostModal
        post={selectedPost ? mapToPost(selectedPost) : null}
        onClose={() => setSelectedPost(null)}
        onLike={(id) => handleToggleLike(id)}
        onFollow={() => selectedPost && handleToggleFollow(selectedPost.user_tag)}
        onAddComment={(id, txt) => handleAddComment(id, txt)}
        onDeleteComment={(commentId) =>
          selectedPost && handleDeleteComment(selectedPost.post_id, commentId)
        }
        onEdit={(id, txt) => handleEditPost(id, txt)}
        onDelete={() => selectedPost && handleDeletePost(selectedPost.post_id)}
      />
    </div>
  );
}