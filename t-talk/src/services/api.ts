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

export const currentUser = {
  name: localStorage.getItem("user_name") || "Ana Ruiz",
  tag: localStorage.getItem("user_tag") || "anarz",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400",
  location: "Monterrey, MX",
};

const USE_MOCK = false;
const API_URL = "http://localhost:8080/v1";

interface BackendPost {
  post_id: string;
  user_name: string;
  user_tag: string;
  user_profile_pic_url: string;
  text: string;
  created_at: string;
  media_urls: string[];
  like_count: number;
}

interface BackendComment {
  comment_id: string;
  post_id: string;
  text: string;
  created_at: string;
  parent_comment_id: string | null;
  root_comment_id: string;
  user_name: string;
  user_tag: string;
  user_profile_pic_url: string;
  media_urls: string[];
  like_count: number;
}

function mapBackendPostToFrontend(bp: BackendPost): Post {
  return {
    id: bp.post_id,
    name: bp.user_name,
    tag: `@${bp.user_tag}`,
    avatar: bp.user_profile_pic_url,
    text: bp.text,
    likes: bp.like_count,
    comments: 0, 
    liked: false, 
    following: false,
    image: bp.media_urls?.[0] || undefined, 
    time: new Date(bp.created_at).toLocaleDateString(), 
    location: "Monterrey", 
    isOwnPost: bp.user_tag === localStorage.getItem("user_tag"),
    reposts: 0,
    views: "0",
    commentsData: []
  };
}

function mapBackendCommentToFrontend(bc: BackendComment): CommentType {
  return {
    id: bc.comment_id,
    name: bc.user_name,
    tag: `@${bc.user_tag}`,
    avatar: bc.user_profile_pic_url,
    text: bc.text,
    likes: bc.like_count,
    liked: false,
    time: new Date(bc.created_at).toLocaleDateString()
  };
}

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
}

export async function login(body: any) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("Credenciales inválidas");
  const res = await response.json();
  localStorage.setItem("token", res.token);
  return res;
}

export async function createPost(data: { text: string; media_urls?: string[] }) {
  const response = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      text: data.text,
      media_urls: data.media_urls || []
    }),
  });
  return response.ok;
}

export async function likePost(id: string) {
  const response = await fetch(`${API_URL}/posts/${id}/likes`, {
    method: "POST",
    headers: getAuthHeaders()
  });
  return response.ok;
}

export async function deletePost(id: string) {
  const response = await fetch(`${API_URL}/posts/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  return response.ok;
}

export async function editPost(id: string, text: string) {
  const response = await fetch(`${API_URL}/posts/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ text }),
  });
  return response.json();
}

// NUEVA FUNCIÓN AÑADIDA: Para obtener los comentarios del backend
// services/api.ts
export async function getComments(postId: string) {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`http://localhost:8080/v1/posts/${postId}/comments`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      }
    });
    
    if (!response.ok) return []; // Si falla, devolvemos array vacío
    
    const data = await response.json();
    return data; // Esto debería ser el array de comentarios
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    return [];
  }
}