export type CommentType = {

  id: number;
  name: string;
  tag: string;
  avatar: string;
  text: string;
  likes: number;
  liked: boolean;
  time: string;
};

export type Post = {

  id: number;
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
  tag: "@anarz",
  avatar:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400",
  location: "Monterrey, MX",
};

const USE_MOCK = true;

const API_URL =
  "http://localhost:8080";

export async function getPosts() {

  if (USE_MOCK) {
    return [];

  }

  const response =
    await fetch(`${API_URL}/`);

  return response.json();
}


export async function createPost(
  data: Partial<Post>
) {

  if (USE_MOCK) {

    return data;
  }

  const response =
    await fetch(
      `${API_URL}/posts`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          data
        ),
      }
    );

  return response.json();
}


export async function likePost(
  id: number
) {

  if (USE_MOCK) {

    return true;
  }

  const response =
    await fetch(
      `${API_URL}/posts/${id}/like`,
      {
        method: "POST",
      }
    );

  return response.json();
}


export async function commentPost(
  id: number,
  text: string
) {

  if (USE_MOCK) {

    return {
      success: true,
      text,
    };
  }

  const response =
    await fetch(
      `${API_URL}/posts/${id}/comment`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          text,
        }),
      }
    );

  return response.json();
}

export async function followUser(
  username: string
) {

  if (USE_MOCK) {

    return true;
  }

  const response =
    await fetch(
      `${API_URL}/follow/${username}`,
      {
        method: "POST",
      }
    );

  return response.json();
}


export async function deletePost(
  id: number
) {

  if (USE_MOCK) {

    return true;
  }

  const response =
    await fetch(
      `${API_URL}/posts/${id}`,
      {
        method: "DELETE",
      }
    );

  return response.json();
}

export async function editPost(
  id: number,
  text: string
) {

  if (USE_MOCK) {

    return {
      success: true,
      text,
    };
  }

  const response =
    await fetch(
      `${API_URL}/posts/${id}`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          text,
        }),
      }
    );

  return response.json();
}