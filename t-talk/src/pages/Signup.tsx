import { useState } from "react";
import { User, AtSign, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function Signup({ onSuccess }: { onSuccess?: () => void }) {
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !tag.trim() || !email.trim() || !password.trim()) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    const formattedTag = tag.startsWith("@") ? tag.slice(1).trim() : tag.trim();

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          tag: formattedTag,
          email: email.trim(),
          password: password,
        }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          const text = await response.text().catch(() => "");
          if (text.toLowerCase().includes("email")) {
            throw new Error("Este correo electrónico ya está registrado. Intenta iniciar sesión.");
          } else if (text.toLowerCase().includes("tag")) {
            throw new Error("Este nombre de usuario (@tag) ya está en uso. Elige otro.");
          } else {
            throw new Error("El correo o nombre de usuario ya están registrados.");
          }
        } else if (response.status === 400) {
          const text = await response.text().catch(() => "");
          if (text.toLowerCase().includes("password")) {
            throw new Error("La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 carácter especial (!@#$&*_-) y 2 dígitos.");
          } else if (text.toLowerCase().includes("email")) {
            throw new Error("El formato del correo electrónico no es válido.");
          } else if (text.toLowerCase().includes("tag")) {
            throw new Error("El tag solo puede tener letras, números, _ y ! (máx. 15 caracteres).");
          } else if (text.toLowerCase().includes("name")) {
            throw new Error("El nombre solo puede tener letras y espacios (1-30 caracteres).");
          } else {
            throw new Error("Datos inválidos. Revisa los campos e intenta de nuevo.");
          }
        } else {
          throw new Error("Error del servidor. Inténtalo más tarde.");
        }
      }

      const data = await response.json();

      if (data.token) {
        localStorage.setItem("token", data.token);

        localStorage.setItem("user_tag", formattedTag);
        localStorage.setItem("user_name", name.trim());

        try {
          const userRes = await fetch(`http://localhost:8080/v1/users/${formattedTag}`, {
            headers: { "Authorization": `Bearer ${data.token}` },
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            localStorage.setItem("user_name", userData.name || name.trim());
            localStorage.setItem("user_profile_picture_url", userData.profile_picture_url || "");
          }
        } catch {
          
        }
      }

      if (onSuccess) {
        onSuccess?.();
      } else {
        window.location.href = "/";
      }

    } catch (err: any) {
      console.error("Error en el registro:", err);
      setError(err.message || "Hubo un problema al crear la cuenta. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5efe6] flex items-center justify-center px-4 overflow-hidden relative selection:bg-[#d6c2a8] selection:text-gray-900">
      <div className="absolute w-[500px] h-[500px] bg-[#e7c6a5] rounded-full blur-[120px] top-[-100px] right-[-100px] opacity-70 pointer-events-none" />
      <div className="absolute w-[350px] h-[350px] bg-[#d6b49f] rounded-full blur-[100px] bottom-[-80px] left-[-80px] opacity-60 pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl rounded-[40px] overflow-hidden border border-white/40 shadow-[0_24px_50px_rgba(0,0,0,0.06)] bg-white/40 backdrop-blur-2xl grid md:grid-cols-2 min-h-[620px]">

        <div className="hidden md:block relative overflow-hidden" style={{ minHeight: "520px" }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full select-none pointer-events-none">
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
              <line key={i} x1={i * 16 - 20} y1={0} x2={i * 16 - 50} y2={600} stroke="#300a04" strokeWidth="0.8" opacity="0.5" />
            ))}
            <path d="M0,0 C70,100 50,250 40,380 C30,480 50,550 0,600 L0,0Z" fill="url(#ttPurple)" opacity="0.97" />
            <path d="M500,0 C475,50 435,95 415,175 C398,240 425,295 405,360 C385,425 345,455 338,520 C330,565 355,585 345,600 L500,600 Z" fill="url(#ttOrange)" />
            <path d="M500,0 C468,55 450,110 448,178 C446,238 462,292 450,355 C440,408 420,440 425,498 C428,540 452,565 452,600 L500,600 Z" fill="url(#ttBright)" opacity="0.85" />
            <path d="M500,0 C455,30 395,75 368,158 C345,228 380,298 352,378 C328,442 278,468 272,538 C268,574 292,592 282,600 L500,600 Z" fill="#bf4010" opacity="0.38" />
            <path d="M500,5 C462,62 450,125 450,192 C450,254 464,306 453,372 C443,428 427,460 430,518 C433,558 455,578 458,600" fill="none" stroke="url(#ttRim)" strokeWidth="1.2" />
            <g transform="translate(210, 218)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                const isMain = i % 2 === 0;
                const len = isMain ? 22 : 12;
                const rad = (angle * Math.PI) / 180;
                const x2 = Math.sin(rad) * len;
                const y2 = -Math.cos(rad) * len;
                return <line key={angle} x1="0" y1="0" x2={x2} y2={y2} stroke="#f0dfc0" strokeWidth={isMain ? "2" : "1.2"} strokeLinecap="round" opacity="0.95" />;
              })}
              <circle cx="0" cy="0" r="3" fill="#f0dfc0" opacity="0.9" />
            </g>
            <text x="210" y="318" textAnchor="middle" fontSize="62" fontWeight="700" letterSpacing="4" fill="#f0dfc0" opacity="0.95" style={{ fontFamily: "Georgia, serif" }}>T-Talk</text>
          </svg>
        </div>

        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div>
            <p className="text-[#8b7355] font-black text-xs uppercase tracking-widest mb-2">Empieza ahora</p>
            <h1 className="text-4xl font-black text-[#2d2d2d] tracking-tight mb-8">Crear cuenta</h1>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="group flex items-center bg-white/50 border border-white/60 focus-within:border-[#8b7355]/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#8b7355]/5 rounded-2xl px-4 py-3.5 transition duration-200">
              <User className="text-gray-400 group-focus-within:text-[#8b7355] mr-3 shrink-0" size={18} />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo" className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium text-sm" disabled={isLoading} />
            </div>

            <div className="group flex items-center bg-white/50 border border-white/60 focus-within:border-[#8b7355]/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#8b7355]/5 rounded-2xl px-4 py-3.5 transition duration-200">
              <AtSign className="text-gray-400 group-focus-within:text-[#8b7355] mr-3 shrink-0" size={18} />
              <input type="text" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Nombre de usuario (@usuario)" className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium text-sm" disabled={isLoading} />
            </div>

            <div className="group flex items-center bg-white/50 border border-white/60 focus-within:border-[#8b7355]/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#8b7355]/5 rounded-2xl px-4 py-3.5 transition duration-200">
              <Mail className="text-gray-400 group-focus-within:text-[#8b7355] mr-3 shrink-0" size={18} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium text-sm" disabled={isLoading} />
            </div>

            <div className="group flex items-center bg-white/50 border border-white/60 focus-within:border-[#8b7355]/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#8b7355]/5 rounded-2xl px-4 py-3.5 transition duration-200">
              <Lock className="text-gray-400 group-focus-within:text-[#8b7355] mr-3 shrink-0" size={18} />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium text-sm" disabled={isLoading} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-[#8b7355] transition ml-2 shrink-0 focus:outline-none" tabIndex={-1}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Hint de contraseña */}
            <p className="text-[11px] text-gray-400 font-medium px-1">
              Mín. 8 caracteres · 1 mayúscula · 1 especial (!@#$&*_-) · 2 números
            </p>

            {error && (
              <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl animate-fade-in">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-[#d6c2a8] hover:bg-[#ccb59c] text-[#2d2d2d] font-bold text-sm shadow-sm transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {isLoading ? (
                <><Loader2 size={16} className="animate-spin text-[#2d2d2d]" /><span>Creando espacio...</span></>
              ) : (
                <span>Registrarse</span>
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <a href="/login" className="inline-block font-bold text-sm text-[#8b7355] hover:text-[#2d2d2d] underline decoration-transparent hover:decoration-current transition duration-200">
              Ya tengo una cuenta
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}