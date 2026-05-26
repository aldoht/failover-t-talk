import { useState } from "react";

import Sidebar from "./components/Sidebar";
import BottomBar from "./components/BottomBar";
import CreatePost from "./components/CreatePost";
import PostCard from "./components/PostCard";
import RightPanel from "./components/RightPanel";
import PostModal from "./components/PostModal";

import Login from "./pages/Login";
import SearchPage from "./pages/SearchPage";
import ProfilePage from "./pages/ProfilePage";
import FollowingPage from "./pages/FollowingPage";
import NotificationsPage from "./pages/NotificationPage";

import { mockPosts } from "./mock/posts";
import type { Post } from "./services/api";

export default function App() {
  const [loggedIn] = useState(true);
  const [page, setPage] = useState("home");
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [followedTags, setFollowedTags] = useState<string[]>([]);

  const handlePageChange = (newPage: string) => {
    if (newPage !== "search") {
      setSearchQuery(""); 
    }
    setPage(newPage);
  };

  function handleAddPost(post: Post) {
    setPosts([post, ...posts]);
  }

  function handleToggleLike(postId: string | number) {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const liked = !post.liked;
          return {
            ...post,
            liked,
            likes: liked ? post.likes + 1 : post.likes - 1,
          };
        }
        return post;
      })
    );

    if (selectedPost && selectedPost.id === postId) {
      const updatedLiked = !selectedPost.liked;
      setSelectedPost({
        ...selectedPost,
        liked: updatedLiked,
        likes: updatedLiked ? selectedPost.likes + 1 : selectedPost.likes - 1,
      });
    }
  }

  function handleToggleFollow(identifier: string | number) {
    let targetTag = "";

    if (typeof identifier === "number" || (typeof identifier === "string" && !identifier.startsWith("@"))) {
      if (identifier === 10 || identifier === "10") targetTag = "@sophia";
      else if (identifier === 11 || identifier === "11") targetTag = "@danlee";
      else if (identifier === 12 || identifier === "12") targetTag = "@daniel";
      else {
        const foundPost = posts.find((p) => p.id === identifier);
        if (foundPost) targetTag = foundPost.tag;
      }
    } else {
      targetTag = identifier as string;
    }

    if (!targetTag) return;

    setFollowedTags((prev) =>
      prev.includes(targetTag) ? prev.filter((t) => t !== targetTag) : [...prev, targetTag]
    );
  }

  function handleSearchTrend(hashtag: string) {
    setSearchQuery(hashtag); 
    setPage("search");       
  }

  const handleAddComment = (postId: string | number, text: string) => {
    const newComment = {
      id: Date.now().toString(),
      name: "Ana Ruiz",
      tag: "@anarz",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400",
      text: text,
      likes: 0,
      liked: false,
      time: "Ahora mismo",
    };

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments + 1,
            commentsData: [newComment, ...(post.commentsData || [])],
          };
        }
        return post;
      })
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({
        ...selectedPost,
        comments: selectedPost.comments + 1,
        commentsData: [newComment, ...(selectedPost.commentsData || [])],
      });
    }
  };

  const handleDeleteComment = (postId: string | number, commentId: string | number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: Math.max(0, post.comments - 1),
            commentsData: (post.commentsData || []).filter((c) => c.id !== commentId),
          };
        }
        return post;
      })
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({
        ...selectedPost,
        comments: Math.max(0, selectedPost.comments - 1),
        commentsData: (selectedPost.commentsData || []).filter((c) => c.id !== commentId),
      });
    }
  };

  function handleDeletePost(postId: string | number) {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
    setSelectedPost(null);
  }

  function handleEditPost(postId: string | number, newText: string) {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            text: newText,
          };
        }
        return post;
      })
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({
        ...selectedPost,
        text: newText,
      });
    }
  }

  if (!loggedIn) {
    return <Login />;
  }

  const basePostsWithState = posts.map((post) => ({
    ...post,
    following: followedTags.includes(post.tag),
  }));

  const rightPanelUsers = [
    { id: 10, name: "Sophia Bennett", tag: "@sophia", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400" },
    { id: 11, name: "Daniel Lee", tag: "@danlee", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400" },
    { id: 12, name: "Daniel Lee", tag: "@daniel", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400" },
  ];

  const ghostPosts: Post[] = rightPanelUsers
    .filter((user) => followedTags.includes(user.tag) && !posts.some((p) => p.tag === user.tag))
    .map((user) => ({
      id: user.id + 5000,
      name: user.name,
      tag: user.tag,
      avatar: user.avatar,
      text: `¡Hola! Soy ${user.name} (${user.tag}). Gracias por seguirme`,
      likes: 0,
      comments: 0,
      liked: false,
      following: true,
      isOwnPost: false,
      saved: false,
      time: "Ahora mismo", 
      commentsData: []     
    } as Post)); 
  const finalPostsForApp = [...ghostPosts, ...basePostsWithState];

  const legacyFollowedUserIds = rightPanelUsers
    .filter((u) => followedTags.includes(u.tag))
    .map((u) => u.id);

  function renderPage() {
    switch (page) {
      case "search":
        return (
          <SearchPage
            posts={finalPostsForApp}
            onOpenPost={(post) => setSelectedPost(post)}
            onLikePost={handleToggleLike}
            onFollowPost={(id) => {
              const matched = finalPostsForApp.find((p) => p.id === id);
              if (matched) handleToggleFollow(matched.tag);
            }}
            onDeletePost={handleDeletePost}
            onEditPost={handleEditPost}
            initialQuery={searchQuery}
          />
        );

      case "profile":
        return (
          <ProfilePage
            posts={finalPostsForApp}
            onOpenPost={(post) => setSelectedPost(post)}
            onLikePost={handleToggleLike}
            onFollowPost={(id) => {
              const matched = finalPostsForApp.find((p) => p.id === id);
              if (matched) handleToggleFollow(matched.tag);
            }}
            onDeletePost={handleDeletePost}
            onEditPost={handleEditPost}
          />
        );

      case "following":
        return (
          <FollowingPage
            posts={finalPostsForApp}
            onOpenPost={(post) => setSelectedPost(post)}
            onLikePost={handleToggleLike}
            onFollowPost={(id) => {
              const matched = finalPostsForApp.find((p) => p.id === id);
              if (matched) handleToggleFollow(matched.tag);
            }}
            onDeletePost={handleDeletePost}
            onEditPost={handleEditPost}
          />
        );

      case "notifications":
        return <NotificationsPage />;

      default:
        return (
          <>
            <CreatePost onAddPost={handleAddPost} />
            <div className="space-y-4 mt-4">
              {basePostsWithState.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onOpen={() => setSelectedPost(post)}
                  onLike={() => handleToggleLike(post.id)}
                  onFollow={() => handleToggleFollow(post.tag)}
                  onDelete={() => handleDeletePost(post.id)}
                  onEdit={(newText) => handleEditPost(post.id, newText)}
                />
              ))}
            </div>
          </>
        );
    }
  }

  return (
    <div className="min-h-screen text-gray-800 bg-gradient-to-br from-gray-50 via-gray-100 to-zinc-200/70 attachment-fixed font-sans antialiased">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-[260px_1fr_360px] gap-6 px-4 lg:px-6">
        
        <div className="hidden lg:block sticky top-0 h-screen py-6">
          <Sidebar page={page} setPage={handlePageChange} />
        </div>

        <main className="py-6 pb-32 lg:pb-6">
          <div className="bg-white/30 backdrop-blur-3xl border border-white/40 rounded-[32px] overflow-hidden shadow-xl min-h-[85vh]">
            
            <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/50 border-b border-gray-200/20 px-6 py-5 flex items-center justify-between">
              <h1 className="text-2xl font-black tracking-tight text-gray-900 capitalize">
                {page === "home" ? "Inicio" : page}
              </h1>
            </div>

            <div className="p-4 lg:p-6">{renderPage()}</div>
          </div>
        </main>

        <div className="hidden lg:block sticky top-0 h-screen py-6 overflow-y-auto no-scrollbar">
          <RightPanel 
            onSearchTrend={handleSearchTrend}
            onFollowSuggestion={(id) => {
              const user = rightPanelUsers.find((u) => u.id === id);
              if (user) handleToggleFollow(user.tag);
            }}
            followedUserIds={legacyFollowedUserIds} 
          />
        </div>
      </div>

      <BottomBar page={page} setPage={handlePageChange} />

      <PostModal
        post={selectedPost ? { ...selectedPost, following: followedTags.includes(selectedPost.tag) } : null}
        onClose={() => setSelectedPost(null)}
        onLike={handleToggleLike}
        onFollow={() => selectedPost && handleToggleFollow(selectedPost.tag)}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onEdit={handleEditPost}
        onDelete={() => {
          if (!selectedPost) return;
          handleDeletePost(selectedPost.id);
          setSelectedPost(null);
        }}
      />
    </div>
  );
}