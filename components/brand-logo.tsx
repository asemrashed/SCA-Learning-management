import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  BRAND_LOGO_SRC,
  BRAND_NAME,
  BRAND_SUBTAGLINE,
  BRAND_TAGLINE,
} from "@/lib/brand"

type BrandLogoSize = "compact" | "default" | "sidebar"

type BrandLogoTextTone = "default" | "light" | "secondary"

interface BrandLogoProps {
  href?: string
  size?: BrandLogoSize
  showText?: boolean
  showTaglines?: boolean
  className?: string
  textTone?: BrandLogoTextTone
  onClick?: () => void
}

const textToneClasses = {
  default: {
    name: "text-foreground",
    tagline: "text-muted-foreground",
    subtagline: "text-muted-foreground/80",
  },
  light: {
    name: "text-white",
    tagline: "text-white/85",
    subtagline: "text-white/75",
  },
  secondary: {
    name: "text-secondary-foreground",
    tagline: "text-secondary-foreground/80",
    subtagline: "text-secondary-foreground/70",
  },
} as const

const sizeConfig = {
  compact: {
    image: "h-9 w-9",
    name: "text-sm font-bold leading-none md:text-[15px]",
    tagline: "text-[10px] leading-none md:text-[11px]",
    subtagline: "line-clamp-1 text-[9px] leading-none md:text-[10px]",
    gap: "gap-2",
  },
  default: {
    image: "h-12 w-12",
    name: "text-lg font-bold leading-tight",
    tagline: "text-xs leading-tight",
    subtagline: "text-[11px] leading-tight",
    gap: "gap-2.5",
  },
  sidebar: {
    image: "h-9 w-9",
    name: "text-xs font-bold leading-none",
    tagline: "text-[10px] leading-none",
    subtagline: "text-[9px] leading-none",
    gap: "gap-2",
  },
} as const

export function BrandLogo({
  href = "/",
  size = "default",
  showText = true,
  showTaglines = true,
  className,
  textTone = "default",
  onClick,
}: BrandLogoProps) {
  const config = sizeConfig[size]
  const tone = textToneClasses[textTone]

  const content = (
    <>
      <Image
        src={BRAND_LOGO_SRC}
        alt={BRAND_NAME}
        width={48}
        height={48}
        className={cn("shrink-0 rounded-full object-cover", config.image)}
        priority={size === "compact"}
      />
      {showText && (
        <div className="min-w-0">
          <p className={cn(config.name, tone.name)}>{BRAND_NAME}</p>
          {showTaglines && (
            <div className="mt-0.5 space-y-0">
              <p className={cn(config.tagline, tone.tagline)}>{BRAND_TAGLINE}</p>
              <p className={cn(config.subtagline, tone.subtagline)}>{BRAND_SUBTAGLINE}</p>
            </div>
          )}
        </div>
      )}
    </>
  )

  const classes = cn("flex min-w-0 items-center", config.gap, className)

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {content}
      </Link>
    )
  }

  return <div className={classes}>{content}</div>
}
