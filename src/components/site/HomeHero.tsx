import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Import slider images (fallbacks)
import slide1 from "@/assets/portfolio/branding.png";
import slide2 from "@/assets/portfolio/packaging.png";
import slide3 from "@/assets/portfolio/brochure.png";
import slide4 from "@/assets/portfolio/cosmetics.png";

const DEFAULT_SLIDES = [slide1, slide2, slide3, slide4];

export function HomeHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSlides() {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'hero_slider')
          .maybeSingle();
        
        if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
          setSlides(data.value);
        } else {
          setSlides(DEFAULT_SLIDES);
        }
      } catch (err) {
        setSlides(DEFAULT_SLIDES);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSlides();
  }, []);

  const activeSlides = slides.length > 0 ? slides : DEFAULT_SLIDES;

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSlides]);

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center pt-20">
      {/* Background Image Slider */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${activeSlides[currentSlide]})` }}
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Protective Overlays */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-tr from-brand/30 via-transparent to-brand-purple/30 opacity-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] rounded-full glass border-white/10 text-brand font-black mb-10 shadow-sm">
            <Sparkles size={14} className="text-brand" /> The Premium Studio Standard
          </span>

          <h1 className="text-5xl md:text-8xl font-black leading-[1] tracking-tighter text-white pb-6 drop-shadow-2xl">
            Premium branding,<br />
            & print solutions<br />
            <span className="text-gradient-brand">for growing businesses</span>
          </h1>

          <p className="mt-8 text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            Wings Design Studio blends elite print craft with strategic digital design to elevate ambitious brands into industry leaders.
          </p>

          <div className="mt-12 flex flex-wrap gap-5 justify-center">
            <Link to="/contact" className="group relative px-10 py-5 rounded-2xl bg-gradient-brand text-brand-foreground font-black shadow-glow hover:scale-105 active:scale-95 transition-all overflow-hidden">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span className="relative flex items-center gap-2 text-lg">
                Start Your Project <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link to="/portfolio" className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl glass border-white/5 shadow-elegant hover:bg-white/10 hover:scale-105 active:scale-95 transition-all font-black text-lg text-white">
              View Our Work
            </Link>
          </div>
        </motion.div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-3 mt-12">
          {activeSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-8 bg-brand' : 'w-2 bg-white/30 hover:bg-white/50'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Minimalist Stats Bar */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-20 py-10 border-t border-white/10 flex flex-wrap justify-center gap-10 md:gap-20"
        >
          {[["12+", "Years Experience"], ["500+", "Premium Brands"], ["100%", "Quality Promise"]].map(([n, l]) => (
            <div key={l} className="space-y-1">
              <div className="text-3xl md:text-4xl font-black text-white leading-none tracking-tighter">{n}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-black">{l}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
