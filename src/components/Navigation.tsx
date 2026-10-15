import { useEffect, useRef, useState } from 'react';
import {
  CalendarDays,
  Clock3,
  Gauge,
  Heart,
  LayoutGrid,
  Sunrise,
  X,
  type LucideIcon,
} from 'lucide-react';
import Logo from './Logo';

interface NavItem {
  id: string;
  label: string;
  Icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Dashboard', Icon: LayoutGrid },
  { id: 'hourly', label: 'Today', Icon: Clock3 },
  { id: 'weekly', label: 'This week', Icon: CalendarDays },
  { id: 'metrics', label: 'Conditions', Icon: Gauge },
  { id: 'sun', label: 'Sun & summary', Icon: Sunrise },
  { id: 'favorites', label: 'Saved locations', Icon: Heart },
];

/** Tracks which dashboard section is currently in view. */
function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -60% 0px' },
    );
    // Sections mount after data loads, so look them up on a short delay too.
    const attach = () => ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    attach();
    const t = window.setTimeout(attach, 1500);
    return () => {
      window.clearTimeout(t);
      observer.disconnect();
    };
  }, [ids]);
  return active;
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // Move focus for keyboard and screen-reader users without a second scroll.
  el.focus({ preventScroll: true });
}

const ids = NAV_ITEMS.map((n) => n.id);

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const active = useActiveSection(ids);
  return (
    <ul className="space-y-1.5">
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.();
                scrollToSection(id);
              }}
              aria-current={isActive ? 'location' : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-500 text-white shadow-glow dark:bg-brand-500/30 dark:shadow-none'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-indigo-100/75 dark:hover:bg-white/[0.06] dark:hover:text-white'
              }`}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              {label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-60 shrink-0 flex-col rounded-3xl border border-slate-200/80 bg-white px-5 py-8 shadow-soft dark:border-white/[0.06] dark:bg-night-900 dark:shadow-panel lg:flex">
      <div className="px-3">
        <Logo />
      </div>
      <nav aria-label="Dashboard sections" className="mt-10">
        <NavList />
      </nav>
      <p className="mt-auto px-3 text-xs leading-relaxed text-muted">
        Live forecasts for any city, powered by Open-Meteo.
      </p>
    </aside>
  );
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
}

/** Slide-in navigation for small screens. */
export function MobileNav({ open, onClose }: DrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
      <div className="absolute inset-0 bg-night-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white px-5 py-6 shadow-2xl animate-fade-in dark:bg-night-900">
        <div className="mb-8 flex items-center justify-between px-3">
          <Logo />
          <button ref={closeRef} type="button" onClick={onClose} className="btn-icon" aria-label="Close navigation">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav aria-label="Dashboard sections">
          <NavList onNavigate={onClose} />
        </nav>
      </div>
    </div>
  );
}
