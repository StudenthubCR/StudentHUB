"use client";

/**
 * Users Three — Iconimate
 *
 * Installed from https://iconimate.app/r/users-three.json
 * Version eb17df386510 · icon last changed 2026-08-18
 *
 * This file is a COPY and does not update itself. To pull the current version:
 *   npx shadcn@latest add https://iconimate.app/r/users-three.json
 * To check whether yours is behind, compare the version above against
 * https://iconimate.app/r/registry.json.
 *
 * Animation code: copyright (c) 2026 Muhammad Ammar (smammar100), MIT.
 * Glyph geometry: Phosphor Icons, copyright (c) 2023 Phosphor Icons, MIT.
 *                 https://phosphoricons.com
 */

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import type { DOMAttributes, HTMLAttributes } from "react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import type { Transition, Variants } from "motion/react";

/** Imperative handle every icon exposes — lets consumers trigger motion on touch, where `:hover` never fires. */
export interface IconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export interface IconProps extends HTMLAttributes<HTMLDivElement> {
  /** Rendered width & height in px. Defaults to 28; the set is calibrated to read at 24 (ship size). */
  size?: number;
}

/** A cubic-bezier easing curve. */
export type Bezier = [number, number, number, number];

/** Gentle standard glide — used by every "normal" variant for hover-out. */
export const RETURN: Bezier = [0.4, 0, 0.2, 1];

/** Duration scale in seconds, calibrated for legibility at the 24px ship size. */
export const DUR = { instant: 0.12, fast: 0.2, base: 0.32, slow: 0.5 } as const;

/**
 * The canonical hover-out transition. Spread into every "normal" variant so that
 * interrupting a hover glides the icon home instead of snapping.
 */
export const RETURN_TRANSITION: Transition = { duration: DUR.base, ease: RETURN };

/* ─────────────────────────────────────────────────────────────────────────────
 * Principle helpers — shared vocabulary for Disney's 12 principles. See MOTION.md.
 * Additive only; pure data/factories (server-safe). Reach for these instead of
 * inlining magic numbers so the whole set speaks one language.
 * ───────────────────────────────────────────────────────────────────────────── */

/** Staging / Overlapping action — the per-element delay for a staggered cascade.
 *  Give sibling parts `transition: { delay: staged(i) }` so they lead/trail in turn. */
export function staged(index: number, step = 0.09): number {
  return index * step;
}

/** The controls object returned by `useAnimation()` — derived to stay resilient to motion's type renames. */
type AnimationControls = ReturnType<typeof useAnimation>;

export interface HoverController {
  /** The single controls instance every animated element in the icon is gated through. */
  controls: AnimationControls;
  /**
   * True when the icon should render its static fallback instead of animating.
   *
   * Deliberately **not** the OS `prefers-reduced-motion` value. Taking the static
   * path leaves a reduced-motion visitor unable to preview an icon at all, which
   * defeats a gallery whose entire content is motion. The preference is honoured
   * on `ambient` instead: an explicit hover/tap still performs the gesture once,
   * but nothing repeats unattended. Kept as a field so the per-icon static
   * fallbacks stay wired and a product decision can switch them on in one place.
   */
  reduced: boolean;
  /**
   * True when motion may repeat on its own — the replay loop below, and any
   * icon transition carrying `repeat: Infinity`.
   *
   * False when the user prefers reduced motion. Icons with ambient/looping
   * tracks must gate `repeat` on this; one-shot gestures ignore it, because a
   * gesture the user asked for by hovering is not unattended motion.
   */
  ambient: boolean;
  /** Play the "animate" variant. */
  start: () => void;
  /** Glide back to the "normal" variant. */
  stop: () => void;
  /** Spread onto the icon's wrapper. Keyboard focus triggers it too, not just pointer. */
  bind: Pick<DOMAttributes<Element>, "onMouseEnter" | "onMouseLeave" | "onFocus" | "onBlur">;
}

/**
 * The common-case hover controller. Owns one `useAnimation` instance and the
 * enter / leave / focus / blur wiring, so motion across every element of an icon
 * is gated through a single source of truth.
 *
 * Per-icon files layer `forwardRef` + `useImperativeHandle` on top of this to
 * expose `startAnimation` / `stopAnimation`, since `:hover` never fires on touch.
 */
export function useHover(): HoverController {
  const controls = useAnimation();
  // Icons still animate for everyone — see `reduced` on HoverController for why
  // the static fallback is not wired to the OS preference.
  const reduced = false;
  // `useReducedMotion()` reads the media query directly and does NOT consult
  // <MotionConfig>, so app/providers.tsx's `reducedMotion="never"` cannot mask
  // this. That is intentional: this is the one place the real preference is read.
  const ambient = !(useReducedMotion() ?? false);

  // True while the pointer (or focus) is on the icon — the loop below keys off
  // it so the "animate" variant replays end-to-end until the user leaves.
  const looping = useRef(false);
  // The pending replay timer, tracked so stop()/unmount can clear it outright
  // rather than relying on a late fire noticing `looping` went false.
  const replayTimer = useRef<number | undefined>(undefined);

  const start = useCallback(() => {
    if (looping.current) return; // already looping — don't stack replays
    looping.current = true;
    const run = () => {
      if (!looping.current) return;
      const t0 = performance.now();
      void controls.start("animate").then(() => {
        if (!looping.current) return;
        // Snap back to "normal" (keyframes end where they start, so this is
        // invisible) so the next start("animate") actually replays — starting
        // a variant the elements are already at resolves immediately.
        controls.set("normal");
        // Reduced motion: the hover gets its one full pass — an explicit
        // preview the visitor asked for — and then stops. Nothing replays
        // unattended.
        if (!ambient) {
          looping.current = false;
          return;
        }
        // If the cycle resolved instantly (no animatable elements mounted),
        // pause before retrying instead of spinning a tight loop. Otherwise
        // breathe for 30% of the cycle before replaying, so the loop reads
        // as a rhythm rather than a frantic back-to-back repeat.
        const elapsed = performance.now() - t0;
        replayTimer.current = window.setTimeout(run, elapsed < 100 ? 300 : elapsed * 0.3);
      });
    };
    run();
  }, [controls, ambient]);

  const stop = useCallback(() => {
    looping.current = false;
    window.clearTimeout(replayTimer.current);
    void controls.start("normal");
  }, [controls]);

  // Never leave a loop or a pending replay running after unmount.
  useEffect(
    () => () => {
      looping.current = false;
      window.clearTimeout(replayTimer.current);
    },
    [],
  );

  return {
    controls,
    reduced,
    ambient,
    start,
    stop,
    bind: { onMouseEnter: start, onMouseLeave: stop, onFocus: start, onBlur: stop },
  };
}

// WAVE — each head tips one way, swings through to the other, and centres, and
// the whole motion travels along the row: left, then centre, then right. A
// stadium wave rather than a single nod. Promoted from app/lab/users-three
// (variant 1).
//
// NOTHING IS SPLIT. Phosphor's `users-three` is already six separate stroked
// elements — three heads and three shoulder arcs, all `fill="none"
// stroke-width="16"`. Rest parity is exact BY CONSTRUCTION (§1), verified at
// 512x512 as 0 flipped pixels, and `pathLength` would be native if any variant
// needed it (§5).
//
// THE STRUCTURE, MEASURED. Three figures, mirror-symmetric about x128 to within
// 0.333%:
//     LEFT    head arc centred (64,88) r32   + shoulders (16,144)->(64,120)
//     CENTRE  head circle     (128,144) r40  + shoulders (72,216)->(184,216)
//     RIGHT   head arc centred (192,88) r32  + shoulders (192,120)->(240,144)
// EACH HEAD IS TANGENT TO ITS OWN SHOULDER ARC — the head's lowest point IS the
// shoulder endpoint, at (64,120), (128,184) and (192,120). Same structural fact
// `user` has, and it is why those three points are the neck pivots: a tilt
// there swings the head without opening the joint.
//
// THIS IS THE TIGHTEST LANE IN THE SET (§4). Whole-mark ink bbox is
// x[8, 247.5], y[48, 223.5] — left 8, right 8.5, top 48, bottom 32.5. EIGHT
// units of lateral margin; this is `bicycle`'s both-walls problem. A two-sided
// head swing only fits because the eight units belong to the SHOULDERS, which
// never move here: the heads swing inside that envelope, so the whole-mark
// bbox is unchanged at full swing in either direction. Measured at both
// extremes — the left head reaches x14.5, the right x241, against walls at 0
// and 256. Nothing clips, and nothing paints outside the box at rest.
//
// TILT ANGLES ARE NOT EQUAL, AND THAT IS THE POINT. The side heads pivot 64
// units from their necks, the centre head 80. The same ANGLE on all three would
// make the centre swing visibly harder and the wave read as lopsided. These are
// chosen so CROWN TRAVEL matches: 64 × 17° = 19.0 units, 80 × 14° = 19.5. Both
// clear the 18-unit floor (§2); at 16°/13° the sides drop to 17.9 and fall
// under it. Full two-sided swing is 38.0 and 39.1 units respectively.
//
// THE STAGGER IS THE WHOLE IDEA (§11). `staged(i)` at the 0.09 default puts the
// spread inside 180ms, well under the 500ms budget past which the last element
// reads as a straggler rather than part of a cascade. Fire all three together
// and there is no group here at all, just one three-headed object swaying.
//
// WHAT THE TWO-SIDED SWING MEANS. A single tilt reads as acknowledgement — one
// person agreeing. Tipping both ways is not a stronger version of that; it is a
// different gesture, reading as swaying or moving together. It cannot read as a
// head SHAKE, the obvious worry, because a shake is rotation about the vertical
// axis and these heads are circles seen flat (§3).
//
// easeInOut, not ARRIVE: each head travels THROUGH centre to the far side
// rather than settling into a position, and §8 gives a symmetric curve to
// motion that crosses and an ARRIVE tail only to motion that lands. The holds
// are unequal (0.14 then 0.12) because §10 wants decaying repeats and two
// identical pauses read as a metronome.
//
// §3 SPLITS THREE WAYS ON THIS GLYPH, AND ONE BRANCH IS A TRAP.
//   - The CENTRE head is a full circle: rotated 25° about its own centre it
//     differs from itself by 0.4% — invisible, `bicycle`'s wheel trap. Which is
//     why it pivots at the NECK here, not at its centre.
//   - The SIDE heads are OPEN arcs: the same test gives 18.55% and 18.52%, so
//     rotation about their own centres is genuinely visible.
//   DO NOT USE THAT. Each arc's gap is not decoration — it is the segment
//   facing the centre figure, i.e. where that person is drawn as standing
//   behind. Spinning the arc carries the gap round to the outside and the head
//   reads as having a bite missing rather than as being occluded. The
//   measurement says visible; the drawing says wrong. Both pivot at the neck.
//
// REJECTED — recorded so the next author does not spend a day on it (§17):
//   - SPINNING THE SIDE HEADS about their own centres (see above).
//   - ANY OUTWARD OR SIDEWAYS GROUP TRAVEL. Eight units of margin; it clips
//     before reaching a third of the amplitude floor.
//   - A SHRUG on any figure, for the reason `user` documents: every head is
//     tangent to its shoulder line, so lifting shoulders drives the arc through
//     the face, and §1 bars hiding a line collision with opacity.
//   - A STAGGERED DRAW-ON ASSEMBLE (centre draws, then the flanks). Honest
//     here, since all six elements are natively stroked, and it survives as
//     `3 · Assemble` in app/lab/users-three. Not what shipped: it opens on
//     `pathLength: 0`, so frame 0 is not the icon (§1) — and this glyph parks
//     SIX round-cap dots at once, the worst instance of that trap in the set.
//
// NO `repeat: Infinity` ANYWHERE, so there is no per-transition ambient gating
// to do — the hover replay loop in use-hover is already gated.

/** The glyph's own six elements, untouched. */
const HEAD_L = "M64,120A32,32,0,1,1,95,80";
const HEAD_R = "M161,80a32,32,0,1,1,31,40";
const HEAD_C = { cx: 128, cy: 144, r: 40 };
const SH_L = "M16,144a59.91,59.91,0,0,1,48-24";
const SH_R = "M192,120a59.91,59.91,0,0,1,48,24";
const SH_C = "M72,216a65,65,0,0,1,112,0";

/** The mark is stroke-only; it is never filled. */
const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 16,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const AT = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: x / 256,
  originY: y / 256,
});
/** Neck pivots — each is the exact point where that head meets its shoulders. */
const NECK_L = AT(64, 120);
const NECK_C = AT(128, 184);
const NECK_R = AT(192, 120);

/** Matched crown travel, not matched angle — see the header. */
const TILT_SIDE = 17;
const TILT_CENTRE = 14;

const wave = (i: number, tilt: number): Variants => ({
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, tilt, tilt, -tilt, -tilt, 0],
    transition: {
      duration: 0.9,
      ease: "easeInOut",
      times: [0, 0.18, 0.32, 0.58, 0.7, 1],
      delay: staged(i),
    },
  },
});
const waveL = wave(0, TILT_SIDE);
const waveC = wave(1, TILT_CENTRE);
const waveR = wave(2, TILT_SIDE);

export const UsersThreeIcon = forwardRef<IconHandle, IconProps>(function UsersThreeIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="none">
          <path d={HEAD_L} {...STROKE} />
          <path d={SH_L} {...STROKE} />
          <circle cx={HEAD_C.cx} cy={HEAD_C.cy} r={HEAD_C.r} {...STROKE} />
          <path d={SH_C} {...STROKE} />
          <path d={HEAD_R} {...STROKE} />
          <path d={SH_R} {...STROKE} />
        </svg>
      </div>
    );
  }

  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 256 256"
        fill="none"
        initial="normal"
        animate={controls}
        style={{ overflow: "visible" }}
      >
        <motion.path d={HEAD_L} {...STROKE} variants={waveL} style={NECK_L} />
        <path d={SH_L} {...STROKE} />
        <motion.circle
          cx={HEAD_C.cx}
          cy={HEAD_C.cy}
          r={HEAD_C.r}
          {...STROKE}
          variants={waveC}
          style={NECK_C}
        />
        <path d={SH_C} {...STROKE} />
        <motion.path d={HEAD_R} {...STROKE} variants={waveR} style={NECK_R} />
        <path d={SH_R} {...STROKE} />
      </motion.svg>
    </div>
  );
});
