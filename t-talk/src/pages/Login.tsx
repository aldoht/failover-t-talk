export default function Login() {
  return (
    <div className="min-h-screen bg-[#f5efe6] flex items-center justify-center px-4 overflow-hidden relative">
      <div className="absolute w-[500px] h-[500px] bg-[#f6c7a1] rounded-full blur-[120px] top-[-100px] left-[-100px] opacity-70"></div>
      <div className="absolute w-[400px] h-[400px] bg-[#d7b8a3] rounded-full blur-[100px] bottom-[-100px] right-[-100px] opacity-60"></div>
      <div className="absolute w-[300px] h-[300px] bg-[#e7d7c9] rounded-full blur-[100px] top-[40%] left-[45%] opacity-50"></div>

      <div className="relative z-10 w-full max-w-5xl rounded-[40px] overflow-hidden border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.08)] bg-white/30 backdrop-blur-2xl grid md:grid-cols-2">

        <div className="p-12 flex flex-col justify-center">
          <p className="text-[#8b7355] font-semibold mb-3 tracking-wide">Log In</p>
          <h1 className="text-6xl font-black text-[#2d2d2d] leading-none mb-5">Bienvenido</h1>
          <p className="text-gray-600 mb-10 text-lg">Lo que esta pasando ahora</p>

          <input
            type="email"
            placeholder="Correo"
            className="w-full mb-4 px-5 py-4 rounded-2xl bg-white/40 border border-white/40 outline-none text-gray-800 placeholder:text-gray-500 backdrop-blur-md"
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full mb-6 px-5 py-4 rounded-2xl bg-white/40 border border-white/40 outline-none text-gray-800 placeholder:text-gray-500 backdrop-blur-md"
          />

          <button className="w-full py-4 rounded-2xl bg-[#d6c2a8] hover:bg-[#ccb59c] transition text-[#2d2d2d] font-semibold">
            Entrar
          </button>

          <p className="text-center text-gray-600 mt-6">¿No tienes cuenta?</p>
          <a href="/signup" className="text-center mt-2 font-semibold text-[#8b7355] hover:opacity-70">
            Crear cuenta
          </a>
        </div>

        <div
          className="hidden md:block relative overflow-hidden"
          style={{ minHeight: "520px" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 500 600"
            preserveAspectRatio="xMidYMid slice"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          >
            <defs>
              <linearGradient id="ttBg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#120608" />
                <stop offset="50%" stopColor="#200a06" />
                <stop offset="100%" stopColor="#0a0408" />
              </linearGradient>
              <linearGradient id="ttOrange" x1="10%" y1="100%" x2="90%" y2="0%">
                <stop offset="0%" stopColor="#6b1a04" />
                <stop offset="35%" stopColor="#bb3f0c" />
                <stop offset="65%" stopColor="#e06820" />
                <stop offset="100%" stopColor="#f09e55" />
              </linearGradient>
              <linearGradient id="ttBright" x1="20%" y1="100%" x2="80%" y2="0%">
                <stop offset="0%" stopColor="#a02e08" />
                <stop offset="50%" stopColor="#e05c1a" />
                <stop offset="100%" stopColor="#f8b870" />
              </linearGradient>
              <linearGradient id="ttPurple" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#120608" />
                <stop offset="55%" stopColor="#1e0a1e" />
                <stop offset="100%" stopColor="#08060e" />
              </linearGradient>
              <linearGradient id="ttRim" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#f8c07a" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#c04010" stopOpacity="0" />
              </linearGradient>
            </defs>

            <rect width="500" height="600" fill="url(#ttBg)" />

            {Array.from({ length: 32 }).map((_, i) => (
              <line
                key={i}
                x1={i * 16 - 20}
                y1={0}
                x2={i * 16 - 50}
                y2={600}
                stroke="#300a04"
                strokeWidth="0.8"
                opacity="0.5"
              />
            ))}

            <path
              d="M0,0 C70,100 50,250 40,380 C30,480 50,550 0,600 L0,0Z"
              fill="url(#ttPurple)"
              opacity="0.97"
            />

            <path
              d="
                M500,0
                C475,50 435,95 415,175
                C398,240 425,295 405,360
                C385,425 345,455 338,520
                C330,565 355,585 345,600
                L500,600 Z
              "
              fill="url(#ttOrange)"
            />

            <path
              d="
                M500,0
                C468,55 450,110 448,178
                C446,238 462,292 450,355
                C440,408 420,440 425,498
                C428,540 452,565 452,600
                L500,600 Z
              "
              fill="url(#ttBright)"
              opacity="0.85"
            />

            <path
              d="
                M500,0
                C455,30 395,75 368,158
                C345,228 380,298 352,378
                C328,442 278,468 272,538
                C268,574 292,592 282,600
                L500,600 Z
              "
              fill="#bf4010"
              opacity="0.38"
            />
            <path
              d="
                M500,5
                C462,62 450,125 450,192
                C450,254 464,306 453,372
                C443,428 427,460 430,518
                C433,558 455,578 458,600
              "
              fill="none"
              stroke="url(#ttRim)"
              strokeWidth="1.2"
            />

            <g transform="translate(210, 218)">
            
              {[0,45,90,135,180,225,270,315].map((angle, i) => {
                const isMain = i % 2 === 0;
                const len = isMain ? 22 : 12;
                const rad = (angle * Math.PI) / 180;
                const x2 = Math.sin(rad) * len;
                const y2 = -Math.cos(rad) * len;
                return (
                  <line
                    key={angle}
                    x1="0" y1="0"
                    x2={x2} y2={y2}
                    stroke="#f0dfc0"
                    strokeWidth={isMain ? "2" : "1.2"}
                    strokeLinecap="round"
                    opacity="0.95"
                  />
                );
              })}
              <circle cx="0" cy="0" r="3" fill="#f0dfc0" opacity="0.9" />
            </g>

            
            <text
              x="210"
              y="318"
              textAnchor="middle"
              className="tt-serif"
              fontSize="62"
              fontWeight="700"
              letterSpacing="4"
              fill="#f0dfc0"
              opacity="0.95"
            >
              T-Talk
            </text>

          </svg>
        </div>

      </div>
    </div>
  );
}