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
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/creators", label: "Creators", icon: Store },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Layers },
  { href: "/dashboard/collaborations", label: "Collaborations", icon: Users },
  { href: "/dashboard/results", label: "Results", icon: TrendingUp },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];
