export default function BoardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-[calc(100vh-60px)] flex-col bg-background">
      {children}
    </div>
  )
}
