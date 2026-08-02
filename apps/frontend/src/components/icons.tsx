import React from 'react';
import { MIcon, MIconProps } from './MIcon';
export { MIcon };

// Reusable function to create an icon component wrapping MIcon
function createIcon(name: string) {
  const IconComponent = React.forwardRef<HTMLSpanElement, Omit<MIconProps, 'name'>>(
    ({ size, className, style, ...props }, ref) => {
      return (
        <MIcon
          ref={ref}
          name={name}
          size={size}
          className={className}
          style={style}
          {...props}
        />
      );
    }
  );
  IconComponent.displayName = `Icon(${name})`;
  return IconComponent;
}

// Map each lucide icon used in Kanan ERP to its Google Material Symbol name
export const AlertTriangle = createIcon("warning");
export const ZoomIn = createIcon("zoom_in");
export const Maximize2 = createIcon("zoom_out_map");
export const Banknote = createIcon("payments");
export const BarChart3 = createIcon("bar_chart");
export const Bell = createIcon("notifications");
export const Boxes = createIcon("inventory_2");
export const ChevronDown = createIcon("keyboard_arrow_down");
export const BriefcaseBusiness = createIcon("work");
export const Building2 = createIcon("domain");
export const CalendarCheck = createIcon("event_available");
export const CalendarDays = createIcon("calendar_month");
export const CalendarOff = createIcon("event_busy");
export const Camera = createIcon("photo_camera");
export const CheckCircle2 = createIcon("check_circle");
export const ClipboardList = createIcon("assignment");
export const Truck = createIcon("local_shipping");
export const Clock = createIcon("schedule");
export const Download = createIcon("download");
export const Eye = createIcon("visibility");
export const FileSpreadsheet = createIcon("table_chart");
export const FileText = createIcon("description");
export const Gauge = createIcon("speed");
export const Globe = createIcon("public");
export const HardHat = createIcon("engineering");
export const ImagePlus = createIcon("add_photo_alternate");
export const Images = createIcon("photo_library");
export const Layers3 = createIcon("layers");
export const Link2 = createIcon("link");
export const LockKeyhole = createIcon("lock");
export const LogOut = createIcon("logout");
export const OctagonAlert = createIcon("report");
export const PackageCheck = createIcon("inventory");
export const Plus = createIcon("add");
export const Printer = createIcon("print");
export const ReceiptText = createIcon("receipt_long");
export const Search = createIcon("search");
export const Settings = createIcon("settings");
export const ShieldCheck = createIcon("verified_user");
export const Stamp = createIcon("approval");
export const Trash2 = createIcon("delete");
export const Phone = createIcon("phone");
export const Mail = createIcon("mail");
export const MapPin = createIcon("location_on");
export const MessageSquare = createIcon("chat");
export const UserCog = createIcon("manage_accounts");
export const UserPlus = createIcon("person_add");
export const Users = createIcon("group");
export const UsersRound = createIcon("groups");
export const WalletCards = createIcon("account_balance_wallet");
export const Warehouse = createIcon("warehouse");
export const Wrench = createIcon("build");
export const X = createIcon("close");

// Additional icons imported in PublicSite.tsx
export const ArrowLeft = createIcon("arrow_back");
export const BadgeCheck = createIcon("verified");
export const ChevronLeft = createIcon("chevron_left");
export const ClipboardCheck = createIcon("assignment_turned_in");
export const Flame = createIcon("local_fire_department");
export const MonitorCog = createIcon("settings_suggest");
export const Quote = createIcon("format_quote");
export const Sparkles = createIcon("auto_awesome");
export const UserRoundCheck = createIcon("person_check");
export const Wind = createIcon("air");
export const LayoutDashboard = createIcon("dashboard");
export const Edit = createIcon("edit");
export const Save = createIcon("save");
export const Menu = createIcon("menu");
