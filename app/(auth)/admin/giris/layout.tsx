// Bu layout admin giriş sayfası için layout'u bypass eder
export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

