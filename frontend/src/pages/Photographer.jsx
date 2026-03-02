import { useState } from "react"
import axios from "axios"

export default function Photographer() {
  const [eventId, setEventId] = useState("")
  const [photos, setPhotos] = useState([])
  const [previews, setPreviews] = useState([])
  const [uploadStatus, setUploadStatus] = useState("")
  const [matchStatus, setMatchStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const [matching, setMatching] = useState(false)

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files)
    setPhotos(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const handleUpload = async () => {
    if (!eventId || photos.length === 0) { setUploadStatus("❌ Please enter event ID and select photos!"); return }
    const formData = new FormData()
    formData.append("event_id", eventId)
    photos.forEach(p => formData.append("photos", p))
    try {
      setLoading(true)
      setUploadStatus("")
      const res = await axios.post("http://127.0.0.1:8000/api/upload-photos", formData)
      setUploadStatus(`✅ ${res.data.message}`)
    } catch (err) {
      setUploadStatus(`❌ ${err.response?.data?.detail || "Upload failed!"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleMatch = async () => {
    if (!eventId) { setMatchStatus("❌ Please enter event ID!"); return }
    try {
      setMatching(true)
      setMatchStatus("")
      const res = await axios.post(`http://127.0.0.1:8000/api/match-photos?event_id=${eventId}`)
      const matchCount = Object.keys(res.data.matches).length
      setMatchStatus(`✅ Matching complete! Found photos for ${matchCount} guests! Emails sent! 📧`)
    } catch (err) {
      setMatchStatus(`❌ ${err.response?.data?.detail || "Matching failed!"}`)
    } finally {
      setMatching(false)
    }
  }

  return (
    <div className="flex justify-center p-6">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-pink-400 mb-1">Photographer Portal</h2>
        <p className="text-gray-500 text-sm mb-6">Upload event photos and match them to guests!</p>

        <input
          type="text"
          placeholder="Event ID (e.g. wedding-001)"
          value={eventId}
          onChange={e => setEventId(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl p-3 mb-4 focus:outline-none focus:border-pink-500 placeholder-gray-600"
        />

        <label className="block w-full border-2 border-dashed border-gray-700 hover:border-pink-500 rounded-xl p-4 text-center cursor-pointer transition mb-4">
          {previews.length > 0
            ? <div className="grid grid-cols-3 gap-2">
                {previews.map((p, i) => <img key={i} src={p} className="w-full h-20 object-cover rounded-lg" />)}
              </div>
            : <div><div className="text-3xl mb-2">📁</div><div className="text-gray-500 text-sm">Select Photos to Upload</div></div>
          }
          <input type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
        </label>

        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-pink-500 hover:bg-pink-400 text-white py-3 rounded-xl font-bold transition mb-3"
        >
          {loading ? "Uploading..." : "Upload Photos ⬆️"}
        </button>

        {uploadStatus && <p className="mb-4 text-center text-sm text-gray-400">{uploadStatus}</p>}

        <button
          onClick={handleMatch}
          disabled={matching}
          className="w-full bg-gray-800 border border-pink-500 hover:bg-pink-500 text-white py-3 rounded-xl font-bold transition"
        >
          {matching ? "Matching faces..." : "Match Faces 🤖"}
        </button>

        {matchStatus && <p className="mt-4 text-center text-sm text-gray-400">{matchStatus}</p>}
      </div>
    </div>
  )
}