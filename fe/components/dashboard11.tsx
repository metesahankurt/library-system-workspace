"use client";

import { motion, AnimatePresence, useMotionValueEvent, useSpring } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Box,
  ChevronRight,
  ChevronsUpDown,
  ClipboardList,
  Globe,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  RotateCcw,
  Search,
  Settings,
  Truck,
  User,
  Users,
  Wallet,
  Plus,
  Scan,
  X,
} from "lucide-react";
import * as React from "react";
import type { TooltipProps } from "recharts";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Tooltip as ShadTooltip,
  TooltipContent as ShadTooltipContent,
  TooltipProvider as ShadTooltipProvider,
  TooltipTrigger as ShadTooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AddBookForm } from "./add-book-form";
import { LibrarianPanel } from "./librarian-panel";
import { BookDetail } from "./book-detail";
import { BookList } from "./book-list";
import { CategoryList } from "./category-list";
import { BarcodePrint } from "./barcode-print";
import { ReservationList } from "./reservation-list";
import { ActiveLoans } from "./active-loans";
import { BarcodeScanner } from "./barcode-scanner";
import { LateLoans } from "./late-loans";
import { SliderList } from "./slider-list";
import { SliderForm } from "./slider-form";

// ============================================================================
// Color Palette
// ============================================================================

const mixBase = "var(--background)";

const palette = {
  primary: "var(--primary)",
  secondary: {
    light: `color-mix(in oklch, var(--primary) 75%, ${mixBase})`,
    dark: `color-mix(in oklch, var(--primary) 85%, ${mixBase})`,
  },
  tertiary: {
    light: `color-mix(in oklch, var(--primary) 55%, ${mixBase})`,
    dark: `color-mix(in oklch, var(--primary) 65%, ${mixBase})`,
  },
  quaternary: {
    light: `color-mix(in oklch, var(--primary) 40%, ${mixBase})`,
    dark: `color-mix(in oklch, var(--primary) 45%, ${mixBase})`,
  },
  quinary: {
    light: `color-mix(in oklch, var(--primary) 25%, ${mixBase})`,
    dark: `color-mix(in oklch, var(--primary) 30%, ${mixBase})`,
  },
};

const getRetentionColor = (percent: number): string => {
  const mix = Math.max(5, Math.round(percent * 0.85));
  return `color-mix(in oklch, var(--primary) ${mix}%, ${mixBase})`;
};

const STRAPI_URL = "http://localhost:1337";

// ============================================================================
// Types
// ============================================================================

type NavItem = {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  isActive?: boolean;
  children?: NavItem[];
};

type NavGroup = {
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
};

type UserData = {
  name: string;
  email: string;
  avatar: string;
};

type SidebarData = {
  logo: {
    src: string;
    alt: string;
    title: string;
    description: string;
  };
  navGroups: NavGroup[];
  user?: UserData;
};

type KPIStat = {
  title: string;
  value: number;
  change: number;
  format: "currency" | "percent" | "number";
};

type Segment = {
  name: string;
  value: number;
  color: string;
  change: number;
};

type Channel = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  name: string;
  count: number;
  change: number;
};

type CohortRow = {
  label: string;
  retentionByMonth: number[];
};

type DashboardStats = {
  kpi: {
    totalBooks: number;
    activeLoans: number;
    overdueLoans: number;
    totalMembers: number;
  };
  monthlyChartData: { month: string; loans: number }[];
  weeklyChartData: { day: string; loans: number }[];
  categoryData: { name: string; value: number }[];
};

// ============================================================================
// Formatters
// ============================================================================

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat("en-US");

const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

// ============================================================================
// Hooks
// ============================================================================

function useHoverHighlight<T extends string | number>() {
  const [active, setActive] = React.useState<T | null>(null);

  const handleHover = React.useCallback((value: T | null) => {
    setActive(value);
  }, []);

  return { active, handleHover };
}

// ============================================================================
// Mock Data
// ============================================================================

const sidebarData: SidebarData = {
  logo: {
    src: "/logo.svg", // Assuming there's a logo or I'll use an icon
    alt: "Dijital Kütüphane",
    title: "Dijital Kütüphane",
    description: "Yönetim Paneli",
  },
  navGroups: [
    {
      title: "Genel",
      defaultOpen: true,
      items: [
        {
          label: "Dashboard",
          icon: LayoutDashboard,
          href: "OVERVIEW",
          isActive: true,
        },
        { label: "Aktif Ödünçler", icon: ClipboardList, href: "LOANS" },
        { label: "Geciken İadeler", icon: RotateCcw, href: "OVERDUE" },
      ],
    },
    {
      title: "Katalog Yönetimi",
      defaultOpen: true,
      items: [
        {
          label: "Kitaplar",
          icon: Package,
          href: "BOOKS",
          children: [
            { label: "Tüm Kitaplar", icon: Package, href: "BOOKS" },
            { label: "Kitap Ekle", icon: Package, href: "ADD_BOOK" },
            { label: "Kategoriler", icon: Package, href: "CATEGORIES" },
          ],
        },
        { label: "Barkod İşlemleri", icon: Search, href: "BARCODE_PRINT" },
        { label: "Slider Yönetimi", icon: LayoutDashboard, href: "SLIDERS" },
      ],
    },
    {
      title: "Üye ve İşlemler",
      defaultOpen: false,
      items: [
        { label: "Üyeler", icon: Users, href: "MEMBERS" },
        { label: "Rezervasyonlar", icon: Bell, href: "RESERVATIONS" },
        { label: "Mesajlar", icon: MessageSquare, href: "MESSAGES" },
      ],
    },
    {
      title: "Analiz",
      defaultOpen: false,
      items: [
        { label: "Raporlar", icon: BarChart3, href: "REPORTS" },
        { label: "Ayarlar", icon: Settings, href: "SETTINGS" },
      ],
    },
  ],
  user: {
    name: "Kütüphaneci",
    email: "admin@kutuphane.com",
    avatar: "https://github.com/shadcn.png",
  },
};

// Default/fallback data (shown while loading)
const defaultMonthlyData = [
  "OCA", "ŞUB", "MAR", "NİS", "MAY", "HAZ", "TEM", "AĞU", "EYL", "EKİ", "KAS", "ARA",
].map((month) => ({ month, loans: 0 }));

const defaultWeeklyData = [
  "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz",
].map((day) => ({ day, loans: 0 }));

const defaultCategoryData: { name: string; value: number }[] = [];

const cohortRetentionData: CohortRow[] = [
  { label: "Haz", retentionByMonth: [100, 65, 51, 43, 37, 32, 28] },
  { label: "Tem", retentionByMonth: [100, 71, 59, 50, 43, 37] },
  { label: "Ağu", retentionByMonth: [100, 73, 60, 51, 44] },
  { label: "Eyl", retentionByMonth: [100, 69, 55, 46] },
  { label: "Eki", retentionByMonth: [100, 75, 62] },
  { label: "Kas", retentionByMonth: [100, 67] },
  { label: "Ara", retentionByMonth: [100] },
];

// ============================================================================
// Chart Configs
// ============================================================================

const loansChartConfig = {
  loans: {
    label: "Ödünç",
    color: palette.secondary.light,
  },
} satisfies ChartConfig;

const weeklyChartConfig = {
  loans: {
    label: "Ödünç",
    color: palette.secondary.light,
  },
} satisfies ChartConfig;

const categoryChartConfig = {
  value: {
    label: "Kitap",
    color: palette.secondary.light,
  },
} satisfies ChartConfig;

// ============================================================================
// Sidebar Components
// ============================================================================

const SidebarLogo = ({ logo }: { logo: SidebarData["logo"] }) => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" tooltip={logo.title}>
          <div className="flex aspect-square size-8 items-center justify-center bg-primary">
            <img
              src={logo.src}
              alt={logo.alt}
              width={24}
              height={24}
              className="size-6 text-primary-foreground invert dark:invert-0"
            />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-medium">{logo.title}</span>
            <span className="text-xs text-muted-foreground">
              {logo.description}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

const NavMenuItem = ({ item, currentView, onViewChange }: { item: NavItem, currentView: string, onViewChange: (view: string) => void }) => {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;

  if (!hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton isActive={item.href === currentView} tooltip={item.label} onClick={() => onViewChange(item.href)}>
          <Icon className="size-4" aria-hidden="true" />
          <span>{item.label}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  const isActive = item.href === currentView || item.children?.some(c => c.href === currentView);

  return (
    <Collapsible defaultOpen className="group/collapsible" render={<SidebarMenuItem />}>
      <CollapsibleTrigger render={<SidebarMenuButton isActive={isActive} tooltip={item.label} />}>
        <Icon className="size-4" aria-hidden="true" />
        <span>{item.label}</span>
        <ChevronRight
          className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {item.children!.map((child) => (
            <SidebarMenuSubItem key={child.label}>
              <SidebarMenuSubButton
                isActive={child.href === currentView}
                onClick={() => onViewChange(child.href)}
              >
                {child.label}
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent></Collapsible>
  );
};

const NavUser = ({ user }: { user: UserData }) => {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const userAvatar = (
    <Avatar className="size-8 rounded-none">
      <AvatarImage src={user.avatar} alt={user.name} />
      <AvatarFallback className="rounded-none">{initials}</AvatarFallback>
    </Avatar>
  );

  const userInfo = (
    <div className="grid flex-1 text-left text-sm leading-tight">
      <span className="truncate font-medium">{user.name}</span>
      <span className="truncate text-xs text-muted-foreground">
        {user.email}
      </span>
    </div>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground" />}>{userAvatar}{userInfo}<ChevronsUpDown className="ml-auto size-4" aria-hidden="true" /></DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-none"
            side="top"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                {userAvatar}
                {userInfo}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => (window.location.href = "/dashboard")}>
              <LayoutDashboard className="mr-2 size-4" aria-hidden="true" />
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                const { logoutAction } = await import("@/app/actions/auth");
                await logoutAction();
              }}
            >
              <LogOut className="mr-2 size-4" aria-hidden="true" />
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

const AppSidebar = ({
  data = sidebarData,
  currentView,
  onViewChange,
  ...props
}: React.ComponentProps<typeof Sidebar> & { data?: SidebarData, currentView: string, onViewChange: (view: string) => void }) => {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:flex-col">
          <SidebarLogo logo={data.logo} />
          <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:ml-0" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          {data.navGroups.map((group) => (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <NavMenuItem key={item.label} item={item} currentView={currentView} onViewChange={onViewChange} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        {data.user && <NavUser user={data.user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

// ============================================================================
// Dashboard Header
// ============================================================================

interface DashboardHeaderProps {
  onAddBook: () => void;
  onQuickBarcode: () => void;
}

const DashboardHeader = ({ onAddBook, onQuickBarcode }: DashboardHeaderProps) => {
  return (
    <header className="flex w-full items-center gap-3 border-b bg-background px-4 py-4 sm:px-6">
      <div className="flex items-center gap-2">
        <LayoutDashboard className="size-5 text-primary" aria-hidden="true" />
        <h1 className="text-lg font-black tracking-tighter">KÜTÜPHANE YÖNETİMİ</h1>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Button
          onClick={onAddBook}
          className="h-10 px-6 rounded-2xl bg-zinc-900 text-white font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all gap-2 shadow-xl shadow-zinc-200"
        >
          <Plus className="size-4" /> KİTAP EKLE
        </Button>
        <Button
          variant="outline"
          onClick={onQuickBarcode}
          className="h-10 px-6 rounded-2xl border-2 font-black text-xs uppercase tracking-widest hover:bg-muted/50 transition-all gap-2"
        >
          <Scan className="size-4" /> HIZLI BARKOD
        </Button>
      </div>
    </header>
  );
};

// ============================================================================
// Dashboard Content Components
// ============================================================================

// Growth section component (vertical layout for SalesRevenueCard header)
const GrowthSection = ({
  label,
  change,
}: {
  label: string;
  change: number;
}) => {
  const isPositive = change >= 0;
  return (
    <div className="flex items-center gap-1.5 border bg-muted/30 px-2 py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-mono",
          "flex items-center gap-0.5 text-xs font-medium",
          isPositive ? "text-emerald-600" : "text-red-600",
        )}
      >
        {isPositive ? (
          <ArrowUpRight className="size-3" aria-hidden="true" />
        ) : (
          <ArrowDownRight className="size-3" aria-hidden="true" />
        )}
        {isPositive ? "+" : ""}
        {change}%
      </span>
    </div>
  );
};

// KPI Stat Card
const KPIStatCard = ({ stat }: { stat: KPIStat }) => {
  const isPositive = stat.change >= 0;

  const formatValue = (value: number, format: KPIStat["format"]) => {
    switch (format) {
      case "currency":
        return currencyFormatter.format(value);
      case "percent":
        return `${value}%`;
      case "number":
        return numberFormatter.format(value);
    }
  };

  return (
    <div className="flex flex-col gap-1 border bg-card p-4">
      <span className="text-xs text-muted-foreground">{stat.title}</span>
      <div className="flex items-baseline gap-2">
        <span className={cn("font-mono", "text-2xl font-semibold")}>
          {formatValue(stat.value, stat.format)}
        </span>
      </div>
      <div className="flex items-center gap-1 text-xs">
        {isPositive ? (
          <ArrowUpRight
            className="size-3.5 text-emerald-600"
            aria-hidden="true"
          />
        ) : (
          <ArrowDownRight
            className="size-3.5 text-red-600"
            aria-hidden="true"
          />
        )}
        <span
          className={cn(
            "font-mono",
            isPositive ? "text-emerald-600" : "text-red-600",
          )}
        >
          {isPositive ? "+" : ""}
          {stat.change}%
        </span>
        <span className="text-muted-foreground">vs Last Month</span>
      </div>
    </div>
  );
};

// KPI Stats Row
const KPIStatsRow = ({ stats }: { stats: DashboardStats["kpi"] | null; loading: boolean }) => {
  const kpiStats: KPIStat[] = [
    { title: "Toplam Kitap", value: stats?.totalBooks ?? 0, change: 0, format: "number" },
    { title: "Aktif Ödünç", value: stats?.activeLoans ?? 0, change: 0, format: "number" },
    { title: "Geciken İade", value: stats?.overdueLoans ?? 0, change: 0, format: "number" },
    { title: "Toplam Üye", value: stats?.totalMembers ?? 0, change: 0, format: "number" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {kpiStats.map((stat) => (
        <KPIStatCard key={stat.title} stat={stat} />
      ))}
    </div>
  );
};

// ============================================================================
// Animated Reference Line Components
// ============================================================================

interface CustomReferenceLabelProps {
  viewBox?: { x?: number; y?: number };
  value: number;
}

const CustomReferenceLabel: React.FC<CustomReferenceLabelProps> = (props) => {
  const { viewBox, value } = props;
  const y = viewBox?.y ?? 0;

  const width = React.useMemo(() => {
    const characterWidth = 8;
    const padding = 10;
    return value.toString().length * characterWidth + padding;
  }, [value]);

  return (
    <>
      <rect
        x={0}
        y={y - 9}
        width={width}
        height={18}
        fill="var(--secondary-foreground)"
        rx={0}
      />
      <text
        className="font-mono"
        fontWeight={600}
        x={6}
        y={y + 4}
        fill="var(--primary-foreground)"
      >
        {value}
      </text>
    </>
  );
};

// Revenue Bar Chart Tooltip
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RevenueBarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const value = payload[0]?.value || 0;

  return (
    <div className="border border-border bg-popover p-2 shadow-lg sm:p-3">
      <p className="mb-1.5 text-xs font-medium text-foreground sm:mb-2 sm:text-sm">
        {label}
      </p>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="size-2 rounded-full bg-primary sm:size-2.5" />
        <span className="text-[10px] text-muted-foreground sm:text-sm">
          Revenue:
        </span>
        <span
          className={cn(
            "font-mono",
            "text-[10px] font-medium text-foreground sm:text-sm",
          )}
        >
          {currencyFormatter.format(Number(value))}
        </span>
      </div>
    </div>
  );
}

// (CustomersAreaTooltip removed — no longer needed)

// Sales Revenue Card - now shows monthly loan distribution
const SalesRevenueCard = ({ data }: { data: { month: string; loans: number }[] }) => {
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined);

  const maxValueData = React.useMemo(() => {
    if (activeIndex !== undefined) {
      return { index: activeIndex, value: data[activeIndex]?.loans ?? 0 };
    }
    return data.reduce(
      (max, d, index) => (d.loans > max.value ? { index, value: d.loans } : max),
      { index: 0, value: 0 },
    );
  }, [activeIndex, data]);

  const valueSpring = useSpring(maxValueData.value, { stiffness: 100, damping: 20 });
  const [springyValue, setSpringyValue] = React.useState(maxValueData.value);

  useMotionValueEvent(valueSpring, "change", (latest) => {
    const rounded = Math.round(latest);
    setSpringyValue((prev) => (prev !== rounded ? rounded : prev));
  });

  React.useEffect(() => {
    valueSpring.set(maxValueData.value);
  }, [maxValueData.value, valueSpring]);

  const totalLoans = data.reduce((s, d) => s + d.loans, 0);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 border bg-card p-4 sm:gap-5 sm:p-5 lg:col-span-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Aylık Ödünç Dağılımı</span>
          <span className={cn("font-mono", "text-2xl font-semibold tabular-nums sm:text-3xl")}>
            {numberFormatter.format(totalLoans)}
          </span>
          <span className="text-xs text-muted-foreground">Son 12 ay toplam ödünç</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground border bg-muted/30 px-2 py-1">Aylık</span>
        </div>
      </div>

      <div className="h-[180px] w-full min-w-0 sm:h-[220px]">
        <ChartContainer config={loansChartConfig} className="aspect-auto h-full w-full">
          <BarChart
            data={data}
            onMouseLeave={() => setActiveIndex((prev) => (prev !== undefined ? undefined : prev))}
          >
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} dy={8} />
            <YAxis hide />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="border border-border bg-popover p-2 shadow-lg">
                    <p className="mb-1 text-xs font-medium">{label}</p>
                    <div className="flex items-center gap-1.5">
                      <div className="size-2 rounded-full bg-primary" />
                      <span className="text-xs text-muted-foreground">Ödünç:</span>
                      <span className="font-mono text-xs font-medium">{numberFormatter.format(Number(payload[0]?.value ?? 0))}</span>
                    </div>
                  </div>
                );
              }}
              cursor={{ fillOpacity: 0.05 }}
            />
            <Bar dataKey="loans" radius={0}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  className="duration-200"
                  opacity={index === maxValueData.index ? 1 : 0.2}
                  fill={index === maxValueData.index ? palette.secondary.light : palette.tertiary.light}
                  onMouseEnter={() => setActiveIndex((prev) => (prev !== index ? index : prev))}
                />
              ))}
            </Bar>
            <ReferenceLine
              opacity={0.4}
              y={springyValue}
              stroke="var(--secondary-foreground)"
              strokeWidth={1}
              strokeDasharray="3 3"
              label={<CustomReferenceLabel value={maxValueData.value} />}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};

// Segmentation Card - shows category distribution
const SegmentationCard = ({ categoryData, weeklyData }: {
  categoryData: { name: string; value: number }[];
  weeklyData: { day: string; loans: number }[];
}) => {
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined);

  const trackedPoint = React.useMemo(() => {
    const idx = activeIndex !== undefined && activeIndex >= 0 && activeIndex < weeklyData.length
      ? activeIndex
      : weeklyData.length - 1;
    return { index: idx, ...weeklyData[idx] };
  }, [activeIndex, weeklyData]);

  const prevPoint = React.useMemo(() => {
    const prevIdx = Math.max(0, trackedPoint.index - 1);
    return weeklyData[prevIdx];
  }, [trackedPoint.index, weeklyData]);

  const totalLoans = trackedPoint.loans ?? 0;
  const prevLoans = prevPoint?.loans ?? 0;
  const delta = prevLoans === 0 ? 0 : ((totalLoans - prevLoans) / prevLoans) * 100;
  const isPositive = delta >= 0;

  const topCategories = [...categoryData].sort((a, b) => b.value - a.value).slice(0, 4);
  const colors = [palette.primary, palette.secondary.light, palette.tertiary.light, palette.quaternary.light];

  return (
    <div className="flex min-w-0 flex-col gap-4 border bg-card p-4 sm:gap-5 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Haftalık Ödünç Trendi</span>
          <span className={cn("font-mono", "text-2xl font-semibold tabular-nums sm:text-3xl")}>
            {numberFormatter.format(totalLoans)}
          </span>
          <span className={cn("font-mono", "text-[11px] tracking-wide text-muted-foreground uppercase")}>
            {trackedPoint.day}
          </span>
          <div className="flex items-center gap-1">
            <span className={cn("font-mono", "text-sm font-medium", isPositive ? "text-emerald-600" : "text-red-600")}>
              {isPositive ? "+" : "-"}{Math.abs(delta).toFixed(1)}%
            </span>
            {isPositive ? (
              <ArrowUpRight className="size-3.5 text-emerald-600" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="size-3.5 text-red-600" aria-hidden="true" />
            )}
            <span className="text-sm text-muted-foreground">önceki güne göre</span>
          </div>
        </div>
      </div>

      {/* Top categories */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Kategori Dağılımı</span>
        {topCategories.length === 0 ? (
          <span className="text-xs text-muted-foreground">Veri yok</span>
        ) : (
          topCategories.map((cat, i) => (
            <div key={cat.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full" style={{ backgroundColor: colors[i] ?? palette.primary }} />
                <span className="text-sm text-muted-foreground">{cat.name}</span>
              </div>
              <span className={cn("font-mono", "text-sm font-medium tabular-nums")}>
                {numberFormatter.format(cat.value)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Weekly area chart */}
      <div className="h-[100px] w-full">
        <ChartContainer config={weeklyChartConfig} className="h-full w-full">
          <AreaChart
            data={weeklyData}
            onMouseMove={(state) => {
              if (typeof state.activeTooltipIndex === "number") {
                const next = state.activeTooltipIndex;
                setActiveIndex((prev) => (prev !== next ? next : prev));
              }
            }}
            onMouseLeave={() => setActiveIndex(undefined)}
          >
            <defs>
              <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-loans)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-loans)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground) / 0.2)" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} dy={5} />
            <YAxis hide />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="border border-border bg-popover p-2 shadow-lg">
                    <p className="mb-1 text-xs font-medium">{label}</p>
                    <span className="font-mono text-xs">{numberFormatter.format(Number(payload[0]?.value ?? 0))} ödünç</span>
                  </div>
                );
              }}
              cursor={{ stroke: "var(--color-loans)", strokeDasharray: "3 3", strokeOpacity: 0.35 }}
            />
            <Area type="linear" dataKey="loans" stroke="var(--color-loans)" strokeWidth={1} fill="url(#weeklyGradient)"
              activeDot={{ r: 3.5, fill: "var(--color-loans)", strokeWidth: 0 }}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
};

// User Retention Cohort Heatmap Card
const UserRetentionCard = () => {
  const maxMonths = 7;

  return (
    <div className="flex min-w-0 flex-col gap-4 border bg-card p-4 sm:gap-5 sm:p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Ziyaretçi Yoğunluğu</span>
          <span
            className={cn("font-mono", "text-2xl font-semibold sm:text-3xl")}
          >
            24%
          </span>
          <div className="flex items-center gap-1">
            <span
              className={cn(
                "font-mono",
                "text-sm font-medium text-emerald-600",
              )}
            >
              +2.0%
            </span>
            <ArrowUpRight
              className="size-3.5 text-emerald-600"
              aria-hidden="true"
            />
          </div>
        </div>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
          Details
        </Button>
      </div>

      {/* Heatmap */}
      <div className="flex flex-col gap-px">
        {cohortRetentionData.map((cohort) => (
          <div
            key={cohort.label}
            className="grid gap-px"
            style={{
              gridTemplateColumns: `repeat(${maxMonths}, minmax(0, 1fr))`,
            }}
          >
            {cohort.retentionByMonth.map((value, monthIndex) => (
              <ShadTooltipProvider key={monthIndex}>
                <ShadTooltip>
                  <ShadTooltipTrigger render={<div className="h-5 cursor-default transition-shadow hover:ring-1 hover:ring-foreground/20" style={{
                    backgroundColor: getRetentionColor(value),
                  }} />}></ShadTooltipTrigger>
                  <ShadTooltipContent>
                    <span className={cn("font-mono", "text-xs")}>
                      {cohort.label} — Month {monthIndex + 1}: {value}%
                    </span>
                  </ShadTooltipContent>
                </ShadTooltip>
              </ShadTooltipProvider>
            ))}
          </div>
        ))}
      </div>

      {/* X-axis labels */}
      <div
        className="grid gap-px"
        style={{
          gridTemplateColumns: `repeat(${maxMonths}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: maxMonths }, (_, i) => (
          <span
            key={i}
            className={cn(
              "font-mono",
              "text-center text-[10px] text-muted-foreground",
            )}
          >
            {i + 1}
          </span>
        ))}
      </div>
    </div>
  );
};


// Main Dashboard Content
const DashboardContent = ({ stats, loading, jwt }: { stats: DashboardStats | null; loading: boolean; jwt: string }) => {
  const monthlyData = stats?.monthlyChartData ?? defaultMonthlyData;
  const weeklyData = stats?.weeklyChartData ?? defaultWeeklyData;
  const categoryData = stats?.categoryData ?? defaultCategoryData;

  return (
    <main
      id="dashboard-main"
      className="flex h-full w-full flex-1 flex-col gap-4 overflow-auto p-4 sm:gap-6 sm:p-6"
    >
      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
          <div className="size-2 rounded-full bg-primary animate-bounce" />
          Veriler yükleniyor...
        </div>
      )}

      {/* KPI Stats Row */}
      <KPIStatsRow stats={stats?.kpi ?? null} loading={loading} />

      {/* Middle Row: Monthly Loans + Weekly + Categories */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <SalesRevenueCard data={monthlyData} />
        <SegmentationCard categoryData={categoryData} weeklyData={weeklyData} />
      </div>

      {/* Bottom Row: User Retention */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <UserRetentionCard />
      </div>
    </main>
  );
};

// ============================================================================
// Main Dashboard Component
// ============================================================================

const Dashboard11 = ({
  className,
  user: userProp,
  jwt,
}: {
  className?: string;
  user?: { name: string; email: string; avatar?: string };
  jwt: string;
}) => {
  const [currentView, setCurrentView] = React.useState("OVERVIEW");
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = React.useState(false);
  const [isQuickScannerOpen, setIsQuickScannerOpen] = React.useState(false);
  const [quickScanData, setQuickScanData] = React.useState<any>(null);
  const [editingSlider, setEditingSlider] = React.useState<any>(null);
  const [isSliderFormOpen, setIsSliderFormOpen] = React.useState(false);

  const handleAddSlider = () => {
    setEditingSlider(null);
    setIsSliderFormOpen(true);
  };

  const handleEditSlider = (slider: any) => {
    setEditingSlider(slider);
    setIsSliderFormOpen(true);
  };

  const handleQuickScan = async (barcode: string) => {
    try {
      const headers = { Authorization: `Bearer ${jwt}` };
      // 1. Check for active loan
      const loanRes = await fetch(`${STRAPI_URL}/api/loans?filters[book][barcodeNumber][$eq]=${barcode}&filters[status][$eq]=active&populate=*`, { headers });
      const loanData = await loanRes.json();
      
      if (loanData.data?.length > 0) {
        // Book is loaned out -> Go to Return mode
        setCurrentView("LOANS");
        setQuickScanData({ mode: "return", barcode });
        return;
      }

      // 2. Check for reservations
      const resRes = await fetch(`${STRAPI_URL}/api/reservations?filters[book][barcodeNumber][$eq]=${barcode}&filters[status][$eq]=waiting&populate=*`, { headers });
      const resData = await resRes.json();

      if (resData.data?.length > 0) {
        // Book has reservation -> Go to Reservations
        setCurrentView("RESERVATIONS");
        setQuickScanData({ barcode });
        return;
      }

      // 3. Otherwise -> Go to Lend mode
      setCurrentView("LOANS");
      setQuickScanData({ mode: "lend", barcode });
    } catch (e) {
      console.error("Quick Scan Error:", e);
    }
  };

  // Fetch real dashboard stats
  React.useEffect(() => {
    let cancelled = false;
    setStatsLoading(true);
    fetch("/api/dashboard-stats", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data && !data.error) setStats(data);
        else if (!cancelled) console.warn("[Dashboard] stats error:", data);
      })
      .catch((e) => console.warn("[Dashboard] fetch error:", e))
      .finally(() => { if (!cancelled) setStatsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Merge provided user data into sidebarData at render time
  const resolvedSidebarData = React.useMemo(() => {
    return userProp
      ? {
        ...sidebarData,
        user: {
          name: userProp.name,
          email: userProp.email,
          avatar: userProp.avatar ?? "https://github.com/shadcn.png",
        },
      }
      : sidebarData;
  }, [userProp]);

  return (
    <ShadTooltipProvider>
      <SidebarProvider style={{ '--sidebar-width': '16rem', '--sidebar-width-mobile': '18rem' } as React.CSSProperties} className={cn("bg-sidebar h-screen w-full overflow-hidden", className)}>
        <a
          href="#dashboard-main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:text-foreground focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <AppSidebar data={resolvedSidebarData} currentView={currentView} onViewChange={setCurrentView} />
        <SidebarInset className="bg-background flex flex-col h-screen overflow-y-auto">
          <DashboardHeader 
            onAddBook={() => setCurrentView("ADD_BOOK")} 
            onQuickBarcode={() => setIsQuickScannerOpen(true)} 
          />
          {isQuickScannerOpen && (
            <BarcodeScanner 
              onScan={handleQuickScan} 
              onClose={() => setIsQuickScannerOpen(false)} 
            />
          )}
          <div className="flex-1 w-full">
            {currentView === "OVERVIEW" ? (
              <div className="p-6">
                <DashboardContent stats={stats} loading={statsLoading} jwt={jwt} />
              </div>
            ) : (
              <div className="w-full p-6 pb-24 bg-muted/5">
                <div className="max-w-7xl mx-auto">
                  {currentView === "ADD_BOOK" ? (
                    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden">
                      <AddBookForm jwt={jwt} />
                    </div>
                  ) : currentView === "LOANS" ? (
                    <ActiveLoans initialData={quickScanData} jwt={jwt} />
                  ) : currentView === "BOOKS" ? (
                    <BookList jwt={jwt} />
                  ) : currentView === "BOOK_DETAIL" ? (
                    <BookDetail 
                      jwt={jwt} 
                      book={{
                        id: 1,
                        title: "Nutuk",
                        author: "Mustafa Kemal Atatürk",
                        publisher: "Yapı Kredi Yayınları",
                        publishYear: 1927,
                        isbn: "978-975-08-2015-1",
                        bookCode: "LIB-982341235",
                        availableQty: 5,
                        quantity: 8,
                        pageCount: 600,
                        shelfCode: "A-102",
                        description: "Nutuk, Mustafa Kemal Atatürk'ün 15-20 Ekim 1927 tarihleri arasında, o zamanlar Cumhuriyet Halk Fırkası'nın ikinci büyük kongresinde verdiği, Türkiye Cumhuriyeti'nin kuruluş sürecini anlatan tarihi konuşmasıdır.",
                        frontCoverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300",
                        backCoverUrl: "",
                        category: "Tarih"
                      }} 
                      similarBooks={[]}
                    />
                  ) : currentView === "CATEGORIES" ? (
                    <CategoryList jwt={jwt} />
                  ) : currentView === "BARCODE_PRINT" ? (
                    <BarcodePrint jwt={jwt} />
                  ) : currentView === "RESERVATIONS" ? (
                    <ReservationList jwt={jwt} />
                  ) : currentView === "OVERDUE" ? (
                    <LateLoans jwt={jwt} />
                  ) : currentView === "SLIDERS" ? (
                    <SliderList onAdd={handleAddSlider} onEdit={handleEditSlider} />
                  ) : (
                    <div className="text-center py-20">
                      <h2 className="text-2xl font-bold mb-2">{currentView}</h2>
                      <p className="text-muted-foreground">Bu modül yakında aktif edilecektir.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <AnimatePresence>
            {isSliderFormOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm">
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="h-full w-full max-w-xl bg-white shadow-2xl"
                >
                  <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between border-b px-6 py-4">
                      <h3 className="text-lg font-black uppercase tracking-tight">Slider Düzenle</h3>
                      <Button variant="ghost" size="icon" onClick={() => setIsSliderFormOpen(false)}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <SliderForm 
                        slider={editingSlider} 
                        onSuccess={() => {
                          setIsSliderFormOpen(false);
                          // SliderList handles its own refresh on mount, 
                          // but since it's already mounted, we might need a refresh trigger.
                          // For now, re-mounting on view change or a simple refresh works.
                          setCurrentView("SLIDERS");
                        }} 
                      />
                    </div>
                  </div>
                </motion.div>
                <div className="absolute inset-0 -z-10" onClick={() => setIsSliderFormOpen(false)} />
              </div>
            )}
          </AnimatePresence>
        </SidebarInset>
      </SidebarProvider>
    </ShadTooltipProvider>
  );
};

export { Dashboard11 };
