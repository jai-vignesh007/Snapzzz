import { useState } from "react"
import Register from "./pages/Register"
import MyPhotos from "./pages/MyPhotos"
import Photographer from "./pages/Photographer"

export default function App() {
  const [page, setPage] = useState("home")

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* NAV */}
      <nav className="border-b border-gray-800 bg-gray-950 bg-opacity-80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        {page !== "home" ? (
          <button
            onClick={() => setPage("home")}
            className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition"
          >
            ← Back
          </button>
        ) : <div className="w-16" />}
        <h1
          className="text-xl font-bold cursor-pointer bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent"
          onClick={() => setPage("home")}
        >
           SnapZZZZ
        </h1>
        <div className="w-16" />
      </nav>

      {/* HOME */}
      {page === "home" && (
        <div className="flex flex-col items-center justify-center min-h-[90vh] gap-8 p-6 relative overflow-hidden">
          {/* Glow effects */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500 opacity-10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-pink-500 opacity-10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center z-10">
            <div className="text-6xl mb-4">💍</div>
            <h2 className="text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
              WeddingSnap
            </h2>
            <p className="text-gray-400 max-w-md text-lg">
              Find your wedding photos instantly using AI face recognition
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full max-w-2xl z-10">
            <button
              onClick={() => setPage("register")}
              className="flex-1 bg-gray-900 border border-cyan-500 hover:border-cyan-300 hover:shadow-cyan-500/30 hover:shadow-lg text-white px-8 py-6 rounded-2xl text-lg font-semibold transition flex flex-col items-center gap-2 group"
            >
              <span className="text-3xl">👤</span>
              <span className="text-cyan-400 group-hover:text-cyan-300">I'm a Guest</span>
              <span className="text-xs font-normal text-gray-500">Register your face</span>
            </button>
            <button
              onClick={() => setPage("myphotos")}
              className="flex-1 bg-gray-900 border border-purple-500 hover:border-purple-300 hover:shadow-purple-500/30 hover:shadow-lg text-white px-8 py-6 rounded-2xl text-lg font-semibold transition flex flex-col items-center gap-2 group"
            >
              <span className="text-3xl">🖼️</span>
              <span className="text-purple-400 group-hover:text-purple-300">My Photos</span>
              <span className="text-xs font-normal text-gray-500">View matched photos</span>
            </button>
            <button
              onClick={() => setPage("photographer")}
              className="flex-1 bg-gray-900 border border-pink-500 hover:border-pink-300 hover:shadow-pink-500/30 hover:shadow-lg text-white px-8 py-6 rounded-2xl text-lg font-semibold transition flex flex-col items-center gap-2 group"
            >
              <span className="text-3xl">📷</span>
              <span className="text-pink-400 group-hover:text-pink-300">Photographer</span>
              <span className="text-xs font-normal text-gray-500">Upload event photos</span>
            </button>
          </div>
        </div>
      )}

      {page === "register" && <Register onSuccess={() => setPage("myphotos")} />}
      {page === "myphotos" && <MyPhotos />}
      {page === "photographer" && <Photographer />}
    </div>
  )
}