import { Home, Truck, MessageSquare, User } from 'lucide-react';

interface BottomNavProps {
  currentView: 'home' | 'activity' | 'chat' | 'profile';
  onViewChange: (view: 'home' | 'activity' | 'chat' | 'profile') => void;
  unreadChatCount?: number;
}

export default function BottomNav({ currentView, onViewChange, unreadChatCount = 0 }: BottomNavProps) {
  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'activity' as const, label: 'Activity', icon: Truck },
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare, badge: unreadChatCount > 0 },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-surface-container-highest shadow-[0px_-4px_20px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom,12px)] pt-2 px-gutter h-16 flex justify-around items-center">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`relative flex flex-col items-center justify-center w-16 h-full rounded-lg transition-all duration-200 active:scale-90 focus:outline-none ${
              isActive 
                ? 'text-primary-container font-semibold' 
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            {isActive && (
              <span className="absolute top-0 w-12 h-1 bg-primary-container rounded-full" />
            )}
            <div className="relative">
              <Icon 
                size={22} 
                className={`mb-0.5 transition-transform ${isActive ? 'scale-110' : ''}`}
                fill={isActive ? 'currentColor' : 'none'}
              />
              {item.badge && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-error border-2 border-white rounded-full" />
              )}
            </div>
            <span className="text-[10px] tracking-wide mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
