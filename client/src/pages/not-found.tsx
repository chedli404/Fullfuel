import { Link } from 'wouter';
import { Home, ArrowLeft, Music, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
        <div className="text-center max-w-2xl mx-auto">
          {/* Animated 404 */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="relative">
              <h1 className="text-[150px] md:text-[200px] font-black text-transparent bg-gradient-to-r from-primary via-primary to-white bg-clip-text leading-none">
                404
              </h1>
              <div className="absolute inset-0 text-[150px] md:text-[200px] font-black text-primary opacity-20 animate-pulse">
                404
              </div>
            </div>
          </motion.div>

          {/* Error message */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-400 text-lg mb-2">
              Looks like this beat dropped off the playlist
            </p>
            <p className="text-gray-500 text-base">
              The page you're looking for doesn't exist or has been moved
            </p>
          </motion.div>

          {/* Animated music visualizer bars */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="flex justify-center items-end space-x-1 mb-12 h-16"
          >
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="bg-primary rounded-t"
                style={{ width: '4px' }}
                animate={{
                  height: [8, 32, 16, 48, 24, 8],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-primary text-black px-6 py-3 rounded font-semibold hover:bg-primary/90 transition-colors"
              >
                <Home className="h-5 w-5" />
                <span>Back to Home</span>
              </motion.button>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 bg-[#1A1A1A] text-white px-6 py-3 rounded font-semibold hover:bg-[#222] transition-colors border border-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Go Back</span>
            </button>
          </motion.div>

          {/* Popular links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12 pt-8 border-t border-gray-800"
          >
            <p className="text-gray-400 text-sm mb-4">Or explore these popular sections:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/videos" className="text-primary hover:text-white transition-colors text-sm">
                Videos
              </Link>
              <Link to="/music" className="text-primary hover:text-white transition-colors text-sm">
                Music
              </Link>
              <Link to="/gallery" className="text-primary hover:text-white transition-colors text-sm">
                Gallery
              </Link>
              <Link to="/shop" className="text-primary hover:text-white transition-colors text-sm">
                Shop
              </Link>
              <Link to="/about" className="text-primary hover:text-white transition-colors text-sm">
                About
              </Link>
            </div>
          </motion.div>

          {/* Floating elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                y: [-20, 20, -20],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-1/4 left-1/4 text-primary/20"
            >
              <Music className="h-8 w-8" />
            </motion.div>
            <motion.div
              animate={{
                y: [20, -20, 20],
                rotate: [360, 180, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-1/3 right-1/4 text-primary/20"
            >
              <Zap className="h-6 w-6" />
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
