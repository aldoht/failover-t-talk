import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Credenciales inválidas");
        throw new Error(errorText || "Correo o contraseña incorrectos.");
      }

      const data = await response.json();
      console.log("¡Login exitoso!", data);

      if (data.token) {
  localStorage.setItem("token", data.token);

  try {
    const userRes = await fetch("http://localhost:8080/v1/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${data.token}`,
        "Content-Type": "application/json",
      },
    });

    if (!userRes.ok) {
      throw new Error("No se pudo obtener la información del usuario.");
    }

    const userData = await userRes.json();

    console.log("Usuario autenticado:", userData);

    // Datos reales del backend
    localStorage.setItem("user_name", userData.name || "");
    localStorage.setItem("user_tag", userData.tag || "");

    // Foto prefijada/default
    localStorage.setItem(
      "user_profile_picture",
      "/default-user.png"
    );

  } catch (err) {
    console.error("Error obteniendo usuario:", err);
  }
}

      window.location.href = "/";

    } catch (err: any) {
      console.error("Error en el login:", err);
      setError(err.message || "Credenciales incorrectas. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5efe6] flex items-center justify-center px-4 overflow-hidden relative selection:bg-[#d6c2a8] selection:text-gray-900">
      
      <div className="absolute w-[500px] h-[500px] bg-[#f6c7a1] rounded-full blur-[120px] top-[-100px] left-[-100px] opacity-70 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-[#d7b8a3] rounded-full blur-[100px] bottom-[-100px] right-[-100px] opacity-60 pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] bg-[#e7d7c9] rounded-full blur-[100px] top-[40%] left-[45%] opacity-50 pointer-events-none" />
      <div className="relative z-10 w-full max-w-5xl rounded-[40px] overflow-hidden border border-white/40 shadow-[0_24px_50px_rgba(0,0,0,0.06)] bg-white/40 backdrop-blur-2xl grid md:grid-cols-2 min-h-[620px]">
        
        {/* formulario */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div>
            <p className="text-[#8b7355] font-black text-xs uppercase tracking-widest mb-2">Log In</p>
            <h1 className="text-4xl sm:text-5xl font-black text-[#2d2d2d] tracking-tight mb-2">Bienvenido</h1>
            <p className="text-gray-500 font-medium text-sm sm:text-base mb-8">Descubre lo que está pasando ahora</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* correo */}
            <div className="group flex items-center bg-white/50 border border-white/60 focus-within:border-[#8b7355]/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#8b7355]/5 rounded-2xl px-4 py-3.5 transition duration-200 shadow-2xs">
              <Mail className="text-gray-400 group-focus-within:text-[#8b7355] mr-3 shrink-0" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium text-sm"
                disabled={isLoading}
              />
            </div>

            {/* contraseña */}
            <div className="group flex items-center bg-white/50 border border-white/60 focus-within:border-[#8b7355]/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#8b7355]/5 rounded-2xl px-4 py-3.5 transition duration-200 shadow-2xs">
              <Lock className="text-gray-400 group-focus-within:text-[#8b7355] mr-3 shrink-0" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium text-sm"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-[#8b7355] transition ml-2 shrink-0 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

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
                <>
                  <Loader2 size={16} className="animate-spin text-[#2d2d2d]" />
                  <span>Verificando...</span>
                </>
              ) : (
                <span>Entrar</span>
              )}
            </button>
          </form>

          <div className="text-center mt-8">
            <span className="text-sm font-medium text-gray-400">¿Aun no tienes cuenta?</span>
            <br />
            <a 
              href="/signup" 
              className="inline-block mt-2 font-bold text-sm text-[#8b7355] hover:text-[#2d2d2d] underline decoration-transparent hover:decoration-current transition duration-200"
            >
              Regístrate gratis
            </a>
          </div>
        </div>

        {/* imagen del logo */}
        <div
          className="hidden md:block relative overflow-hidden bg-radial from-[#1e0a1e] to-[#0a0408]"
          style={{ minHeight: "520px" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full select-none pointer-events-none">
            {/* SVG omitido por brevedad, es el mismo que proporcionaste */}
            <text x="250" y="365" textAnchor="middle" fontSize="52" fontWeight="900" letterSpacing="6" fill="#f0dfc0" opacity="0.95" style={{ fontFamily: "Georgia, serif" }}>T-Talk</text>
          </svg>
        </div>
      </div>
    </div>
  );
}