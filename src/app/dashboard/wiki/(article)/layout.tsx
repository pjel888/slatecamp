export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-[calc(100vh-48px)]">{children}</div>
}
