import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * tailwind-merge only knows Tailwind's stock scales. The v3 token layer adds
 * custom font sizes (`text-row`, `text-label`, `text-data-lg`…) and custom text
 * colours (`text-on-ink`, `text-tertiary`, `text-ember`…) that share the `text-`
 * prefix, so out of the box it treats them as one conflicting group and drops
 * all but the last — which silently deleted `text-on-ink` from the primary
 * button, leaving near-black text on the ink fill at 1.03:1.
 *
 * Declaring both groups keeps a size and a colour coexisting on one element.
 */
const FONT_SIZES = [
  "page-title",
  "body-lg",
  "body",
  "row",
  "caption",
  "label",
  "data-sm",
  "data-md",
  "data-lg",
  "data-xl",
] as const

const TEXT_COLORS = [
  "primary",
  "secondary",
  "tertiary",
  "faint",
  "on-accent",
  "on-ink",
  "on-status",
  "accent",
  "accent-bright",
  "ember",
  "ember-bright",
  "critical",
  "ink",
  "ink-text",
  "ink-muted",
  "ink-dim",
] as const

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...FONT_SIZES] }],
      "text-color": [{ text: [...TEXT_COLORS] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
