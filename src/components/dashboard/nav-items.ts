import {
  LayoutGrid,
  Store,
  Layers,
  Users,
  TrendingUp,
  MessageCircle,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/brand/overview", label: "Overview", icon: LayoutGrid },
  { href: "/brand/creators", label: "Creators", icon: Store },
  { href: "/brand/campaigns", label: "Campaigns", icon: Layers },
  { href: "/brand/collaborations", label: "Collaborations", icon: Users },
  { href: "/brand/analytics", label: "Results", icon: TrendingUp },
  { href: "/brand/messages", label: "Messages", icon: MessageCircle },
  { href: "/brand/billing", label: "Billing", icon: CreditCard },
];
