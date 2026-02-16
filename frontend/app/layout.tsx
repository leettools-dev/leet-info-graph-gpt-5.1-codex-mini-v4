import type { ReactNode } from 'react'

export const metadata = {
  title: 'Research Infographic Studio',
  description:
    'A Research Infographic Studio landing page that highlights the AI-powered workflow for generating infographics, articles, and citations.',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#0b1120] text-gray-100">
        <div className="min-h-screen w-full bg-gradient-to-b from-[#0b1120] via-[#0b1120] to-[#111c31]">
          {children}
        </div>
      </body>
    </html>
  )
}
