import { cn } from '@/lib/utils'

/** Pull the first page section up behind the floating marketing navbar */
export const MARKETING_NAV_BLEED = '-mt-[4.75rem] md:-mt-[5.25rem]'

/** Top padding so hero content clears the floating navbar */
export const MARKETING_NAV_CLEARANCE = 'pt-24 md:pt-28'

/** Live course / batch cover hero height */
export const MARKETING_COVER_HERO_HEIGHT = 'h-[40vh]'

export function marketingHeroSection(className?: string) {
  return cn(MARKETING_NAV_BLEED, MARKETING_NAV_CLEARANCE, className)
}

export const marketingWavePattern = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30 Q15 15 30 30 T60 30' fill='none' stroke='%2371d4cb' stroke-width='0.5'/%3E%3C/svg%3E")`,
  backgroundSize: '60px 60px',
} as const
