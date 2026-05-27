export type CommentType = {
  id: string;
  name: string;
  tag: string;
  avatar: string;
  text: string;
  likes: number;
  liked: boolean;
  time: string;
};

export type Post = {
  id: string;
  name: string;
  tag: string;
  avatar: string;
  text: string;
  likes: number;
  comments: number;
  liked?: boolean;
  following?: boolean;
  image?: string;
  video?: string;
  time: string;
  location: string;
  isOwnPost?: boolean;
  saved?: boolean;
  reposts?: number;
  views?: string;
  commentsData: CommentType[];
};

const API_URL = "http://localhost:8080/v1";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Auth
export async function login(body: { email: string; password: string }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Credenciales inválidas");
  const data = await res.json();
  localStorage.setItem("token", data.token);
  return data;
}

// Posts
export async function createPost(data: { text: string; url?: string }) {
  const res = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ text: data.text, url: data.url ?? null }),
  });
  return res.ok;
}

export async function deletePost(id: string) {
  const res = await fetch(`${API_URL}/posts/${id}/me`, {  // ✅ ruta correcta
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.ok;
}

export async function editPost(id: string, text: string) {
  const res = await fetch(`${API_URL}/posts/${id}`, {     // pendiente backend
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ text }),
  });
  return res.ok;
}

export async function likePost(id: string) {
  const res = await fetch(`${API_URL}/posts/${id}/likes`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return res.ok;
}

export async function unlikePost(id: string) {
  const res = await fetch(`${API_URL}/posts/${id}/likes/me`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.ok;
}

// Comentarios
export async function getComments(postId: string) {
  const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return [];
  return res.json();
}

export async function addComment(postId: string, text: string) {
  const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ text }),
  });
  return res.ok;
}

export async function deleteComment(commentId: string) {
  const res = await fetch(`${API_URL}/comments/${commentId}/me`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.ok;
}

export async function likeComment(id: string) {
  const res = await fetch(`${API_URL}/comments/${id}/likes`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return res.ok;
}

export async function unlikeComment(id: string) {
  const res = await fetch(`${API_URL}/comments/${id}/likes/me`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.ok;
}

// Usuarios
export async function getUser(tag: string) {
  const res = await fetch(`${API_URL}/users/${tag}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getUserPosts(tag: string) {
  const res = await fetch(`${API_URL}/users/${tag}/posts`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getFollowers(tag: string) {
  const res = await fetch(`${API_URL}/users/${tag}/followers`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getFollowing(tag: string) {
  const res = await fetch(`${API_URL}/users/${tag}/following`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return [];
  return res.json();
}

export async function followUser(tag: string) {
  const res = await fetch(`${API_URL}/users/${tag}/followers`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return res.ok;
}

export async function unfollowUser(tag: string) {
  const res = await fetch(`${API_URL}/users/${tag}/followers/me`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.ok;
}

export async function deleteAccount() {
  const res = await fetch(`${API_URL}/users/me`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.ok;
}