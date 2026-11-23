declare module "lucide-react" {
  import { FC, SVGProps } from "react";

  export type LucideProps = SVGProps<SVGSVGElement> & {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    className?: string;
  };
  export type LucideIcon = FC<LucideProps>;

  export const AlertTriangle: LucideIcon;
  export const AvatarFallback: LucideIcon;
  export const BarChart3: LucideIcon;
  export const Bell: LucideIcon;
  export const Boxes: LucideIcon;
  export const Briefcase: LucideIcon;
  export const Building2: LucideIcon;
  export const Calendar: LucideIcon;
  export const CalendarCheck: LucideIcon;
  export const CardContent: LucideIcon;
  export const CardHeader: LucideIcon;
  export const Check: LucideIcon;
  export const Clock: LucideIcon;
  export const ClipboardList: LucideIcon;
  export const Download: LucideIcon;
  export const FilterX: LucideIcon;
  export const Home: LucideIcon;
  export const Link: LucideIcon;
  export const Layout: LucideIcon;
  export const Lock: LucideIcon;
  export const LogOut: LucideIcon;
  export const Mail: LucideIcon;
  export const Menu: LucideIcon;
  export const MessageCircle: LucideIcon;
  export const MoveRight: LucideIcon;
  export const PackageCheck: LucideIcon;
  export const PenLine: LucideIcon;
  export const Plus: LucideIcon;
  export const Save: LucideIcon;
  export const Search: LucideIcon;
  export const Send: LucideIcon;
  export const Settings: LucideIcon;
  export const Shield: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Trash2: LucideIcon;
  export const User: LucideIcon;
  export const UserCircle: LucideIcon;
  export const Users: LucideIcon;
  export const X: LucideIcon;
  export const useEffect: LucideIcon;
  export const useMemo: LucideIcon;
  export const useState: LucideIcon;
}
