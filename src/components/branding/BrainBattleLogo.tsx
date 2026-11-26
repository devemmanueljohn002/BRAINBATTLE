'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties } from 'react'

type BrainBattleLogoProps = {
  width?: number
  href?: string | null
  priority?: boolean
  className?: string
}

export default function BrainBattleLogo({
  width = 64,
  href = '/',
  priority = false,
  className = '',
}: BrainBattleLogoProps) {
  const image = (
    <Image
      src="/branding/brainbattle-logo.png"
      alt="BRAINBATTLE — Think fast. Play smart. Win big."
      width={768}
      height={768}
      priority={priority}
      sizes={`${width}px`}
    />
  )

  return href ? (
    <Link href={href} className={`brand-logo ${className}`} aria-label="BRAINBATTLE home" style={{ '--brand-logo-size': `${width}px` } as CSSProperties}>
      {image}
    </Link>
  ) : (
    <span className={`brand-logo ${className}`} style={{ '--brand-logo-size': `${width}px` } as CSSProperties}>
      {image}
    </span>
  )
}
