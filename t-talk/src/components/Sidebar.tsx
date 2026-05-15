export default function Sidebar() {
  return (
    <aside className="py-6 sticky top-0 h-screen">

      <div
        className="
        h-full
        border-white/10
        backdrop-blur-2xl
        border border-white/10
        rounded-[32px]
        p-6
        shadow-2xl
        flex flex-col justify-between
        "
      >

        <div>

          <h1 className="text-4xl font-bold mb-10 tracking-tight">
            T-Talk
          </h1>

          <nav className="space-y-3">

            <button className="w-full text-left px-5 py-4 rounded-2xl hover:bg-white/50 transition text-lg">
              Inicio
            </button>

            <button className="w-full text-left px-5 py-4 rounded-2xl hover:bg-white/50 transition text-lg">
              Perfil
            </button>

            <button className="w-full text-left px-5 py-4 rounded-2xl hover:bg-white/50 transition text-lg">
              Siguiendo
            </button>

          </nav>
        </div>

        <div
          className="
          border-white/10
          border border-white/10
          rounded-2xl
          p-4
          "
        >
          <p className="font-semibold">Ana Ruiz</p>
          <p className="text-gray-500">@anarz</p>
        </div>

      </div>
    </aside>
  );
}