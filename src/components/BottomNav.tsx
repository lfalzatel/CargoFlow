import { useState, useEffect } from 'react';
import { Home, Truck, MessageSquare, User, BarChart3 } from 'lucide-react';
import { playMenuUiSound } from '../lib/soundEffects';

interface BottomNavProps {
  currentView: 'home' | 'activity' | 'chat' | 'dashboard' | 'profile';
  onViewChange: (view: 'home' | 'activity' | 'chat' | 'dashboard' | 'profile') => void;
  unreadChatCount?: number;
  userRole?: 'cliente' | 'conductor' | 'admin';
}

export default function BottomNav({ currentView, onViewChange, unreadChatCount = 0, userRole = 'cliente' }: BottomNavProps) {
  const [animatingId, setAnimatingId] = useState<string | null>(currentView);
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    try { return localStorage.getItem('cf_theme') || 'original'; } catch { return 'original'; }
  });

  useEffect(() => {
    const handleThemeChange = (e: any) => {
      if (e?.detail?.theme) {
        setActiveTheme(e.detail.theme);
      } else {
        try { setActiveTheme(localStorage.getItem('cf_theme') || 'original'); } catch {}
      }
    };
    window.addEventListener('cargoflow:theme-changed', handleThemeChange);
    window.addEventListener('storage', handleThemeChange);
    return () => {
      window.removeEventListener('cargoflow:theme-changed', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  useEffect(() => {
    // Re-trigger push-and-settle animation on every view change
    setAnimatingId(currentView);
    const timer = setTimeout(() => {
      setAnimatingId(null);
    }, 450); // Matches pushAndSettle duration
    return () => clearTimeout(timer);
  }, [currentView]);

  const getDashboardLabel = () => {
    if (userRole === 'admin') return 'Gestión';
    if (userRole === 'conductor') return 'Ganancias';
    return 'Reportes';
  };

  const isDarkTheme = activeTheme === 'noche' || activeTheme === 'cyber' || activeTheme === 'glass' || activeTheme === 'kilo';
  const activeBg = isDarkTheme ? '#10b981' : '#0b224d';
  const activeColor = '#ffffff';
  const inactiveColor = isDarkTheme ? '#e2e8f0' : '#0b224d';

  const navItems = [
    { id: 'home' as const, label: 'Inicio', icon: Home },
    { id: 'activity' as const, label: 'Actividad', icon: Truck },
    { id: 'dashboard' as const, label: getDashboardLabel(), icon: BarChart3 },
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare, badge: unreadChatCount > 0 },
    { id: 'profile' as const, label: 'Perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 rounded-[28px] glass-nav-container h-16 px-2 flex justify-around items-center w-[calc(100%-16px)] max-w-[385px] bottom-nav" data-bottom-nav>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        const isPushing = animatingId === item.id;
        const currentColor = isActive ? activeColor : inactiveColor;

        return (
          <button
            key={item.id}
            onClick={() => {
              playMenuUiSound();
              onViewChange(item.id);
            }}
            className="relative flex flex-col items-center justify-center flex-1 h-full focus:outline-none cursor-pointer"
            style={{ color: currentColor }}
          >
            {/*
              Inner container: receives both classes simultaneously when active.
              - nav-item-settled: static transform so it doesn't snap when anim ends
              - anim-push-and-settle: overrides during the 450ms animation (forwards)
              Both have the same final transform, so the transition is seamless.
            */}
            <div
              className={[
                'flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-2xl transition-colors duration-200',
                isActive ? 'nav-item-settled' : '',
                isPushing ? 'anim-push-and-settle' : '',
              ].join(' ')}
              style={
                isActive
                  ? {
                      backgroundColor: activeBg,
                      boxShadow: isDarkTheme ? '0 4px 16px rgba(16, 185, 129, 0.4)' : '0 4px 16px rgba(11, 34, 77, 0.4)',
                    }
                  : {
                      backgroundColor: 'transparent',
                    }
              }
            >
              {/* Icon — gets micro-bounce 3px when settled (after push-and-settle) */}
              <div className="relative">
                {item.id === 'chat' && unreadChatCount > 0 && (
                  <span className="absolute -inset-2 rounded-full bg-rose-500/40 animate-ping pointer-events-none" />
                )}
                <div className={item.id === 'chat' && unreadChatCount > 0 ? 'animate-bounce text-rose-500' : (isActive && !isPushing ? 'anim-micro-bounce' : '')}>
                  <Icon
                    size={19}
                    fill="none"
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </div>

                {/* Unread badge */}
                {item.badge && (
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded-full border border-white shadow-md animate-pulse">
                    {unreadChatCount > 1 ? unreadChatCount : '•'}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className="text-[9px] font-bold tracking-tight leading-none"
                style={{ color: currentColor }}
              >
                {item.label}
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
