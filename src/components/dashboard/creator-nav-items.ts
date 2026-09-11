import {
  LayoutGrid,
  IdCard,
  Store,
  Users,
  TrendingUp,
  UsersRound,
  Wallet,
  Percent,
  MessageCircle,
} from "lucide-react";
import type { NavItem } from "./SidebarShell";

export const CREATOR_NAV_ITEMS: NavItem[] = [
  { href: "/creator", label: "Overview", icon: LayoutGrid },
  { href: "/creator/card", label: "My card", icon: IdCard },
  { href: "/creator/opportunities", label: "Opportunities", icon: Store },
  { href: "/creator/collaborations", label: "Collaborations", icon: Users },
  { href: "/creator/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/creator/community", label: "Community", icon: UsersRound },
  { href: "/creator/earnings", label: "Earnings", icon: Wallet },
  { href: "/creator/affiliate", label: "Affiliate program", icon: Percent },
  { href: "/creator/messages", label: "Messages", icon: MessageCircle },
];
