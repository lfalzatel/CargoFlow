import { useState, useEffect } from 'react';
import { Home, Truck, MessageSquare, User } from 'lucide-react';

interface BottomNavProps {
  currentView: 'home' | 'activity' | 'chat' | 'profile';
  onViewChange: (view: 'home' | 'activity' | 'chat' | 'profile') => void;
  unreadChatCount?: number;
}

export default function BottomNav({ currentView, onViewChange, unreadChatCount = 0 }: BottomNavProps) {
  const [animatingId, setAnimatingId] = useState<string | null>(currentView);

  useEffect(() => {
    setAnimatingId(currentView);
    const timer = setTimeout(() => {
      setAnimatingId(null);
    }, 450); // Duration of push-and-settle
    return () => clearTimeout(timer);
  }, [currentView]);

  const navItems = [
    { id: 'home' as const, label: 'Inicio', icon: Home },
    { id: 'activity' as const, label: 'Actividad', icon: Truck },
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare, badge: unreadChatCount > 0 },
    { id: 'profile' as const, label: 'Perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-auto sm:w-[440px] sm:-translate-x-1/2 sm:left-1/2 z-40 rounded-[26px] glass-nav-container h-16 px-3 flex justify-around items-center">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        const isPushing = animatingId === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`relative flex flex-col items-center justify-center w-16 h-full rounded-2xl transition-all duration-200 focus:outline-none cursor-pointer ${
              isActive 
                ? 'text-primary-container font-black' 
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            {/* Top Indicator Bar */}
            {isActive && (
              <span className="absolute top-0 w-8 h-1 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full shadow-xs" />
            )}

            {/* Icon with Push-and-Settle & Micro-Bounce */}
            <div 
              className={`relative transition-all ${
                isActive 
                  ? isPushing 
                    ? 'anim-push-and-settle' 
                    : 'anim-micro-bounce'
                  : 'hover:scale-105'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-colors ${
                isActive ? 'bg-blue-50/90 text-primary-container shadow-xs' : ''
              }`}>
                <Icon 
                  size={20} 
                  fill={isActive ? 'currentColor' : 'none'}
                />
              </div>

              {item.badge && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full animate-pulse" />
              )}
            </div>

            <span className={`text-[10px] tracking-tight transition-all ${
              isActive ? 'font-extrabold text-primary-container -translate-y-0.5' : 'font-medium'
            }`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
