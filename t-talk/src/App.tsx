import { useState } from "react";
import Sidebar from "./components/Sidebar";
import CreatePost from "./components/CreatePost";
import PostCard from "./components/PostCard";
import RightPanel from "./components/RightPanel";
import { mockPosts } from "./mock/posts";
import type { Post } from "./services/api";
import Login from "./pages/Login";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(true);
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  function handleAddPost(post: Post) {
    setPosts([post, ...posts]);
  }

  if (!loggedIn) {
  return <Login />;
}
  return (
    <div className="min-h-screen text-gray-800">

      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-[260px_1fr_360px] gap-6 px-6">

        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <main className="py-6">

          <div
            className="
            border-white/10
            backdrop-blur-2xl
            border border-white/10
            rounded-[32px]
            overflow-hidden
            shadow-2xl
            "
          >
            <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/20 border-b border-white/10 p-6">
              <h1 className="text-3xl font-bold">
                Home
              </h1>
            </div>

            <CreatePost onAddPost={handleAddPost} />

            <div className="p-4 space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

          </div>
        </main>

        <div className="hidden lg:block py-6">
          <RightPanel />
        </div>

      </div>
    </div>
  );
}