export type CommentType = {
  id: string | number;
  name: string;
  tag: string;
  avatar: string;
  text: string;
  likes: number;
  liked: boolean;
  time: string;
};

export type Post = {
  id: string | number;
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
  commentsData?: CommentType[];
};

export const currentUser = {
  name: "Ana Ruiz",
  tag: "anarz",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400",
  location: "Monterrey, MX",
};

const USE_MOCK = true;
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
    location: "Desconocida", 
    isOwnPost: bp.user_tag === currentUser.tag,
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

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Error de autenticación");
    throw new Error(errorText);
  }

  const res = await response.json();
  localStorage.setItem("token", res.token);
  return res;
}

export async function signup(body: any) {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Error al registrarse");
    throw new Error(errorText);
  }

  const res = await response.json();
  localStorage.setItem("token", res.token);
  return res;
}

export async function getPosts(): Promise<Post[]> {
  if (USE_MOCK) {
    return [];
  }

  const response = await fetch(`${API_URL}/users/${currentUser.tag}/posts`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) return [];
  const data: BackendPost[] = await response.json();
  return data.map(mapBackendPostToFrontend);
}

export async function createPost(data: Partial<Post>) {
  if (USE_MOCK) {
    return data;
  }

  const response = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      text: data.text,
      url: data.image || "" 
    }),
  });

  return response.ok;
}

export async function likePost(id: string | number) {
  if (USE_MOCK) {
    return true;
  }

  const response = await fetch(`${API_URL}/posts/${id}/likes`, {
    method: "POST",
    headers: getAuthHeaders()
  });

  return response.ok;
}

export async function unlikePost(id: string | number) {
  if (USE_MOCK) {
    return true;
  }

  const response = await fetch(`${API_URL}/posts/${id}/likes/me`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  return response.ok;
}

export async function commentPost(id: string | number, text: string) {
  if (USE_MOCK) {
    return { success: true, text };
  }

  const response = await fetch(`${API_URL}/posts/${id}/comments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      text: text,
      url: ""
    }),
  });

  return response.ok;
}

export async function followUser(tag: string) {
  if (USE_MOCK) {
    return true;
  }

  const cleanTag = tag.replace("@", "");
  const response = await fetch(`${API_URL}/users/${cleanTag}/followers`, {
    method: "POST",
    headers: getAuthHeaders()
  });

  return response.ok;
}

export async function deletePost(id: string | number) {
  if (USE_MOCK) {
    return true;
  }
  const response = await fetch(`${API_URL}/posts/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  return response.ok;
}

export async function editPost(id: string | number, text: string) {
  if (USE_MOCK) {
    return { success: true, text };
  }
  const response = await fetch(`${API_URL}/posts/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ text }),
  });

  return response.json();
}