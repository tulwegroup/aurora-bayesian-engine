// This file ensures no client code runs during SSR
export const runtime = 'edge'

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}