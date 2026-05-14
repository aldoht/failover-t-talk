const USE_MOCK = true;
export const API_URL = "http://localhost:8080";

export const CURRENT_USER = {
  name: "Ana Ruiz",
  tag: "@anarz",
  avatar: "https://i.pravatar.cc/150?img=5",
};

export type Post = {
  id: number;
  name: string;
  tag: string;
  text: string;
  likes: number;
  comments: number;
  avatar?: string;
};

export async function createPost(text: string): Promise<Post> {
  if (USE_MOCK) {
    return {
      id: Date.now(),
      name: CURRENT_USER.name,
      tag: CURRENT_USER.tag,
      avatar: CURRENT_USER.avatar,
      text,
      likes: 0,
      comments: 0,
    };
  }
  const response = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return response.json();
}