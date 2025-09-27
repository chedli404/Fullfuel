// client/src/components/StatsCounter.tsx
import { useState, useEffect, useRef } from 'react';
import { Users,  Calendar, Music, Youtube , Video, TrendingUp    } from 'lucide-react';

const StatsCounter = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState([0, 0, 0, 0, 0, 0]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<NodeJS.Timeout[]>([]);

  const stats = [
    { icon: <Users className="h-8 w-8 text-primary" />, value: 2500, label: "Active Users" },
    { icon: <Calendar className="h-8 w-8 text-primary" />, value: 1200, label: "Events Hosted" },
    { icon: <Music className="h-8 w-8 text-primary" />, value: 180, label: "Featured Artists" },
    { icon: <Youtube className="h-8 w-8 text-primary" />, value: 3220, label: "YouTube Subscribers" },
    { icon: <Video className="h-8 w-8 text-primary" />, value: 19, label: "Live Streams" },
    { icon: <TrendingUp className="h-8 w-8 text-primary" />, value: 608448, label: "Views" },

  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          animateCounters();
        } else {
          setIsVisible(false);
          resetCounters();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
      clearAllTimers();
    };
  }, []);

  const clearAllTimers = () => {
    animationRef.current.forEach(timer => clearInterval(timer));
    animationRef.current = [];
  };

  const resetCounters = () => {
    clearAllTimers();
    setCounts([0, 0, 0, 0]);
  };

  const animateCounters = () => {
    clearAllTimers();
    
    const duration = 3000;
    const steps = 60;
    
    stats.forEach((stat, index) => {
      let current = 0;
      const increment = stat.value / steps;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          current = stat.value;
          clearInterval(timer);
        }
        
        setCounts(prev => {
          const newCounts = [...prev];
          newCounts[index] = Math.floor(current);
          return newCounts;
        });
      }, duration / steps);

      animationRef.current.push(timer);
    });
  };

  const formatNumber = (num: number) => {
    if (!num || num === undefined) return '0'; 
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <section ref={sectionRef} className="py-16 bg-[#121212]">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our <span className="text-primary">Community</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Join the electronic music revolution
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center p-6 bg-[#1A1A1A] rounded transition-all duration-500 hover:bg-[#222] hover:-translate-y-1 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="flex justify-center mb-4">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {formatNumber(counts[index])}+
              </div>
              <div className="text-gray-400 text-sm md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;
