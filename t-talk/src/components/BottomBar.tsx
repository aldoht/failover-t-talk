import {
  Home,
  Search,
  Users,
  User
} from "lucide-react";

interface Props {

  page: string;

  setPage: (
    page: string
  ) => void;
}

export default function BottomBar({
  page,
  setPage,
}: Props) {

  const items = [

    {
      id: "home",
      icon: Home,
    },

    {
      id: "search",
      icon: Search,
    },

    {
      id: "following",
      icon: Users,
    },

    {
      id: "profile",
      icon: User,
    },
  ];

  return (

    <div
      className="
      lg:hidden
      fixed
      bottom-0
      left-0
      right-0
      z-50
      backdrop-blur-2xl
      bg-white/40
      border-t
      border-white/20
      flex
      justify-around
      py-4
      "
    >

      {items.map((item) => {

        const Icon =
          item.icon;

        return (

          <button
            key={item.id}
            onClick={() =>
              setPage(item.id)
            }
            className={`
              transition
              ${
                page === item.id
                  ? "scale-110"
                  : "opacity-60"
              }
            `}
          >

            <Icon size={26} />

          </button>

        );
      })}

    </div>
  );
}