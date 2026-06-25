import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  BRAND_LOGO_SRC,
  BRAND_NAME,
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
  },
  light: {
    name: "text-white",
    tagline: "text-white/85",
  },
  secondary: {
    name: "text-secondary-foreground",
    tagline: "text-secondary-foreground/80",
  },
} as const

const sizeConfig = {
  compact: {
    image: "h-8 w-8 sm:h-9 sm:w-9",
    name: "whitespace-nowrap text-[10px] font-bold leading-none sm:text-xs md:text-[15px]",
    tagline: "text-[11px] leading-none sm:text-xs md:text-sm",
    gap: "gap-1.5 sm:gap-2",
  },
  default: {
    image: "h-10 w-10 sm:h-12 sm:w-12",
    name: "whitespace-nowrap text-sm font-bold leading-tight sm:text-base md:text-lg",
    tagline: "text-xs leading-tight sm:text-sm md:text-base",
    gap: "gap-2 sm:gap-2.5",
  },
  sidebar: {
    image: "h-8 w-8 sm:h-9 sm:w-9",
    name: "whitespace-nowrap text-[10px] font-bold leading-none sm:text-xs",
    tagline: "text-[11px] leading-none sm:text-xs",
    gap: "gap-1.5 sm:gap-2",
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
            <p className={cn("mt-0.5", config.tagline, tone.tagline)}>{BRAND_TAGLINE}</p>
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
