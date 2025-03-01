"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Poppins } from "next/font/google";
import ntc from "ntcjs"; // Import ntcjs for color naming

const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

export default function Home() {
  const [vibe, setVibe] = useState("");
  const [moodBoard, setMoodBoard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gradientStyle, setGradientStyle] = useState({
    backgroundImage: "linear-gradient(45deg, #ff6f61, #ff9f1c, #ffcd56, #ff6f61)",
    backgroundSize: "200% 200%",
    backgroundPosition: "0% 50%",
    animation: "gradientShift 15s ease infinite",
  });

  // Update gradient when moodBoard changes
  useEffect(() => {
    if (moodBoard && moodBoard.colors.length >= 4) {
      const colors = moodBoard.colors.slice(0, 4);
      setGradientStyle({
        backgroundImage: `linear-gradient(45deg, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[3]})`,
        backgroundSize: "200% 200%",
        backgroundPosition: "0% 50%",
        animation: "gradientShift 15s ease infinite",
      });
    } else {
      setGradientStyle({
        backgroundImage: "linear-gradient(45deg, #ff6f61, #ff9f1c, #ffcd56, #ff6f61)",
        backgroundSize: "200% 200%",
        backgroundPosition: "0% 50%",
        animation: "gradientShift 15s ease infinite",
      });
    }
  }, [moodBoard]);

  const handleGenerate = async (inputVibe) => {
    if (!inputVibe) {
      setError("Please enter a vibe or select a color.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-moodboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibe: inputVibe }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API request failed: ${text}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMoodBoard({
        images: Array.isArray(data.images) ? data.images : [],
        colors: Array.isArray(data.colors) ? data.colors : [],
      });
      setVibe(inputVibe); // Update input field
    } catch (err) {
      setError(err.message || "Something went wrong. Try again!");
      setMoodBoard(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSwatchClick = (color) => {
    const colorName = ntc.name(color)[1].toLowerCase(); // Get color name and lowercase it
    handleGenerate(colorName); // Use color name as the new vibe
  };

  return (
    <div
      className={`${poppins.className} min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8`}
      style={gradientStyle}
    >
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 md:mb-8 drop-shadow-md"
      >
        Mood Board Generator
      </motion.h1>

      {/* Input & Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md flex flex-col gap-4"
      >
        <input
          type="text"
          value={vibe}
          onChange={(e) => setVibe(e.target.value)}
          placeholder="Enter a vibe (e.g., cozy autumn)"
          className="w-full p-3 rounded-lg border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm transition-all duration-300 text-sm sm:text-base"
          disabled={loading}
        />
        <button
          onClick={() => handleGenerate(vibe)}
          disabled={loading}
          className="w-full p-3 rounded-lg bg-white text-indigo-600 font-semibold shadow-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm sm:text-base"
        >
          {loading ? "Generating..." : "Create Mood Board"}
        </button>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-4 text-red-300 font-medium text-sm sm:text-base drop-shadow-md"
        >
          {error}
        </motion.p>
      )}

      {/* Mood Board */}
      {moodBoard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-8 w-full max-w-full sm:max-w-5xl"
        >
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6 text-center drop-shadow-md">
            Your Mood Board
          </h2>
          {moodBoard.images.length > 0 ? (
            <div className="image-grid">
              {moodBoard.images.map((img, i) => (
                <motion.img
                  key={i}
                  src={img || "/fallback-image.jpg"}
                  alt={`Mood board image ${i + 1}`}
                  className="w-full h-32 sm:h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  onError={(e) => (e.target.src = "/fallback-image.jpg")}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-300 text-center text-sm sm:text-base drop-shadow-md">No images available</p>
          )}
          {moodBoard.colors.length > 0 ? (
            <motion.div
              className="mt-6 flex flex-wrap gap-2 sm:gap-4 justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {moodBoard.colors.map((color, i) => (
                <motion.div
                  key={i}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-md hover:scale-110 transition-transform duration-300 border border-white/30 cursor-pointer"
                  style={{ backgroundColor: color || "#ccc" }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.05, duration: 0.3 }}
                  onClick={() => !loading && handleSwatchClick(color)}
                  title={ntc.name(color)[1]} // Optional: Show color name on hover
                />
              ))}
            </motion.div>
          ) : (
            <p className="mt-4 text-gray-300 text-center text-sm sm:text-base drop-shadow-md">No colors available</p>
          )}
        </motion.div>
      )}

      {/* Inline CSS for gradient animation and responsive grid */}
      <style jsx>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .image-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.5rem;
          width: 100%;
        }
        @media (min-width: 640px) {
          .image-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}