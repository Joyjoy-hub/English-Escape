import type { ReactNode } from 'react'

type PageFrameProps = {
  title: string
  description: string
  leading?: ReactNode
  children?: ReactNode
}

export function PageFrame({ title, description, leading, children }: PageFrameProps) {
  return (
    <main className="page">
      {leading}
      <p className="page-kicker">English Escape</p>
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
    </main>
  )
}
