import type { Post } from "../services/api";

export const mockPosts: Post[] = [

  {
    id: 1,
    name: "Sofia Ramirez",
    tag: "@sofiarmz",
    text: "Prueba prueba",
    likes: 14,
    comments: 3,
    avatar: "https://i.pravatar.cc/150?img=32"
  },

  {
    id: 2,
    name: "Melisa Cruz",
    tag: "@melisac",
    text: "Esta mega padre t-talk",
    likes: 27,
    comments: 5,
    avatar: "https://i.pravatar.cc/150?img=47"
  },

  {
    id: 3,
    name: "Eduardo Lopez",
    tag: "@edulopez",
    text: "Hola mundo",
    likes: 42,
    comments: 7,
    avatar: "https://i.pravatar.cc/150?img=12"
  }

];