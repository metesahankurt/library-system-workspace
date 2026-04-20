export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Dashboard kendi sidebar'ını barındırıyor; üst navbar yok
  return <div className="h-svh w-full overflow-hidden">{children}</div>;
}
