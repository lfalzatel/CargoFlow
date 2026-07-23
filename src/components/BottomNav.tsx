import { useState, useEffect } from 'react';
import { Home, Truck, MessageSquare, User } from 'lucide-react';

interface BottomNavProps {
  currentView: 'home' | 'activity' | 'chat' | 'profile';
  onViewChange: (view: 'home' | 'activity' | 'chat' | 'profile') => void;
  unreadChatCount?: number;
}

const ACCENT = '#0b224d';

export default function BottomNav({ currentView, onViewChange, unreadChatCount = 0 }: BottomNavProps) {
  const [animatingId, setAnimatingId] = useState<string | null>(currentView);

  useEffect(() => {
    // Re-trigger push-and-settle animation on every view change
    setAnimatingId(currentView);
    const timer = setTimeout(() => {
      setAnimatingId(null);
    }, 450); // Matches pushAndSettle duration
    return () => clearTimeout(timer);
  }, [currentView]);

  const navItems = [
    { id: 'home' as const, label: 'Inicio', icon: Home },
    { id: 'activity' as const, label: 'Actividad', icon: Truck },
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare, badge: unreadChatCount > 0 },
    { id: 'profile' as const, label: 'Perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 rounded-[28px] glass-nav-container h-16 px-4 flex justify-around items-center w-[calc(100%-24px)] max-w-[360px]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        const isPushing = animatingId === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className="relative flex flex-col items-center justify-center flex-1 h-full focus:outline-none cursor-pointer"
            style={{ color: isActive ? '#fff' : ACCENT }}
          >
            {/*
              Inner container: receives both classes simultaneously when active.
              - nav-item-settled: static transform so it doesn't snap when anim ends
              - anim-push-and-settle: overrides during the 450ms animation (forwards)
              Both have the same final transform, so the transition is seamless.
            */}
            <div
              className={[
                'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-2xl transition-colors duration-200',
                isActive ? 'nav-item-settled' : '',
                isPushing ? 'anim-push-and-settle' : '',
              ].join(' ')}
              style={
                isActive
                  ? {
                      backgroundColor: ACCENT,
                      boxShadow: '0 4px 16px rgba(11, 34, 77, 0.4)',
                    }
                  : {
                      backgroundColor: 'transparent',
                    }
              }
            >
              {/* Icon — gets micro-bounce 3px when settled (after push-and-settle) */}
              <div className="relative">
                <div className={isActive && !isPushing ? 'anim-micro-bounce' : ''}>
                  <Icon
                    size={19}
                    fill="none"
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </div>

                {/* Unread badge */}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 border border-white rounded-full animate-pulse" />
                )}
              </div>

              {/* Label */}
              <span
                className="text-[9px] font-bold tracking-tight leading-none"
                style={{ color: isActive ? '#fff' : ACCENT }}
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
