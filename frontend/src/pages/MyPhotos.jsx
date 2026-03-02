import { useState } from "react"
import axios from "axios"

export default function MyPhotos() {
  const [email, setEmail] = useState("")
  const [photos, setPhotos] = useState([])
  const [guestName, setGuestName] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchPhotos = async () => {
    if (!email) { setStatus("❌ Please enter your email!"); return }
    try {
      setLoading(true)
      setStatus("")
      const res = await axios.get(`http://127.0.0.1:8000/api/my-photos/${email}`)
      setGuestName(res.data.name)
      setPhotos(res.data.photos)
      if (res.data.photos.length === 0) setStatus("😕 No photos found yet!")
    } catch (err) {
      setStatus(`❌ ${err.response?.data?.detail || "Something went wrong!"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center p-6">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-md mb-8">
        <h2 className="text-2xl font-bold text-purple-400 mb-1">My Photos</h2>
        <p className="text-gray-500 text-sm mb-6">Enter your email to find your photos!</p>

        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl p-3 mb-4 focus:outline-none focus:border-purple-500 placeholder-gray-600"
        />

        <button
          onClick={fetchPhotos}
          disabled={loading}
          className="w-full bg-purple-500 hover:bg-purple-400 text-white py-3 rounded-xl font-bold transition"
        >
          {loading ? "Searching..." : "Find My Photos 🔍"}
        </button>

        {status && <p className="mt-4 text-center text-sm text-gray-400">{status}</p>}
      </div>

      {photos.length > 0 && (
        <div className="w-full max-w-3xl">
          <h3 className="text-xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🎉 Hey {guestName}! Found {photos.length} photos of you!
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {photos.map((url, i) => (
              <div key={i} className="relative group rounded-2xl overflow-hidden border border-gray-800">
                <img src={url} alt={`photo-${i}`} className="w-full h-48 object-cover" />
                <a
                  href={url}
                  download
                  className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                >
                  <span className="text-white font-bold text-sm bg-purple-500 px-4 py-2 rounded-xl">⬇️ Download</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}