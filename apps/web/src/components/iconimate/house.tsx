"use client";

/**
 * House — Iconimate
 *
 * Installed from https://iconimate.app/r/house.json
 * Version 7041dd00915f · icon last changed 2026-08-18
 *
 * This file is a COPY and does not update itself. To pull the current version:
 *   npx shadcn@latest add https://iconimate.app/r/house.json
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

/** Decelerate-to-rest with an expo-out tail — things landing / arriving. */
export const ARRIVE: Bezier = [0.16, 1, 0.3, 1];

/** Gentle standard glide — used by every "normal" variant for hover-out. */
export const RETURN: Bezier = [0.4, 0, 0.2, 1];

/** Duration scale in seconds, calibrated for legibility at the 24px ship size. */
export const DUR_TOKEN = { instant: 0.12, fast: 0.2, base: 0.32, slow: 0.5 } as const;

/**
 * The canonical hover-out transition. Spread into every "normal" variant so that
 * interrupting a hover glides the icon home instead of snapping.
 */
export const RETURN_TRANSITION: Transition = { duration: DUR_TOKEN.base, ease: RETURN };

/* ────────────────────────────────────────────────────────────────────��────────
 * Principle helpers — shared vocabulary for Disney's 12 principles. See MOTION.md.
 * Additive only; pure data/factories (server-safe). Reach for these instead of
 * inlining magic numbers so the whole set speaks one language.
 * ───────────────────────────────────────────────────────────────────────────── */

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

// WELCOME — the roof draws up to a steeper pitch while the door swings in
// behind it, both hold open together, and both come home on the same beat.
// Promoted from app/lab/house (variant 6, which composes that page's
// `1 · Open` with its `2 · Peak`).
//
// THIS MARK IS STROKED, NOT FILLED. Phosphor's `house` is one closed
// `fill="none" stroke="currentColor" stroke-width="16"` loop, traced
// door -> right wall -> roof -> left wall -> back to the door. The door is
// therefore already IN the mark: nothing had to be invented to have something
// to move, which is the first gate in MOTION.md §0.
//
// THE DECOMPOSITION IS MEASURED, NOT EYEBALLED. The loop is cut into three
// open strokes that share endpoints: ROOF (right eave -> apex -> left eave),
// WALLS (the two sides) and DOOR (the doorway U). Cutting a closed path turns
// two round JOINS into four round CAPS at (104,216) and (152,216) — that was
// the failure to check, and it is benign: at a 90° corner the two opposed caps
// reconstruct the join's disc. Rasterised at 512x512, counting only pixels
// that flip ink/no-ink:
//     ROOF + WALLS + DOOR  vs  the original `d`  =  6 / 47,556  =  0.013%
// Antialiasing on the seam, an order of magnitude under the 0.1% threshold
// (§1). Do not re-derive this by eye.
//
// THE EAVES ARE PINNED, AND THAT IS THE WHOLE REASON THIS GESTURE EXISTS. The
// obvious "shelter" idea — lift the roof off the walls — tears the mark open
// at both eaves, because roof and walls are one continuous stroke; a still
// frame 60% through reads as a broken house, not a house (§0 gate 2). Here the
// eave coordinates are literal in BOTH `d` strings, so they are mathematically
// incapable of moving: only the two slope lengths change (80 -> 100). The roof
// steepens instead of detaching, and no frame shows a gap.
//
// IT MORPHS `d` RATHER THAN SCALING Y about the eave line. A non-uniform scale
// on the diagonal slopes distorts the 16-unit pen by ~9%; morphing the path
// keeps the stroke weight exact (§12). The two strings carry identical token
// counts, which is what lets motion interpolate them numerically in place.
//
// THE LAG IS THE COMPOSITION. The roof peaks at 0.30 and the door reaches
// fully open at 0.40 — a 0.10 trail, the top of the follow-through range in
// §10. Run them on identical keyframes and the two parts read as one rigid
// object being scaled; give the door its lag and the house reads as drawing
// itself up first and opening second, which is the order a welcome happens in.
// This is NOT a §11 handoff and deliberately has no beat of stillness between
// the phases: nothing here waits on anything, so they overlap and share one
// return. Sequencing them would stretch a single welcome into two events.
//
// MATERIAL (§9): masonry and timber — rigid. Hence ARRIVE and easeInOut, no
// springs, no overshoot. Nothing squashes and nothing bounces; a house that
// springs past its stop reads as rubber. The door gets easeInOut because it
// moves while on screen and never accelerates out of frame (§8).
//
// AMPLITUDE (§2): the apex travels 20 units (1.9px at 24px) and the door's far
// stile 152 -> 109.8 = 42 units (4.0px). Both clear the 18-unit floor; 5° of
// roof was tried first and came to 16 units, which is invisible.
//
// LANE (§4): ink bbox is x[32, 223.5], y[24, 223.5] — 32 units left, 32.5
// right, 24 top, 32.5 bottom, unusually generous for this set. At full peak the
// apex reaches y4, still 4 units inside the wall, so `overflow: hidden` holds
// and nothing paints outside the box at rest or in motion.
//
// REJECTED — recorded so the next author does not spend a day on it (§17):
//   - LIFTING THE ROOF (see above). Tears the mark at both eaves.
//   - SCALING THE HOUSE TALLER to raise the roof without a tear. Non-uniform
//     scale on a rigid mark is stretch, and rigid things do not squash (§9).
//   - A SQUASH-INTO-THE-FOUNDATION settle, same §9 reason. A house is masonry;
//     the barn glyph gets away with it, this one should not.
//   - A DRAW-ON BUILD (walls rise, then the roof lands) — it is honest here,
//     since the mark is natively stroked, and it survives as `3 · Build` in
//     app/lab/house. It is not what shipped: it opens on `pathLength: 0`, so
//     frame 0 is not the icon (§1), which a Home button in a toolbar cannot
//     afford even though blueprint can.
//   - A WHOLE-HOUSE NOD (6° about the ground line), kept as `4 · Nod` in the
//     lab. It clears the amplitude floor, but a tilting building reads as
//     subsidence rather than a greeting in someone else's product.
//
// NO `repeat: Infinity` ANYWHERE, so there is no per-transition ambient gating
// to do — the hover replay loop in use-hover is already gated.

/** Right eave -> apex -> left eave. The endpoints are the eaves; they never move. */
const ROOF =
  "M216,120a8,8,0,0,0-2.34-5.66l-80-80a8,8,0,0,0-11.32,0l-80,80A8,8,0,0,0,40,120";
/** The same roof with the apex 20 units higher; eave endpoints byte-identical. */
const ROOF_PEAK =
  "M216,120a8,8,0,0,0-2.34-5.66l-80-100a8,8,0,0,0-11.32,0l-80,100A8,8,0,0,0,40,120";
/** Both side walls. */
const WALLS = "M104,216h-64V120M152,216h64V120";
/** The doorway: left jamb, header, right jamb. */
const DOOR = "M104,216V152h48v64";
/** Full original glyph, for the reduced-motion static render. */
const HOUSE =
  "M104,216V152h48v64h64V120a8,8,0,0,0-2.34-5.66l-80-80a8,8,0,0,0-11.32,0l-80,80A8,8,0,0,0,40,120v96Z";

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
const HINGE = AT(104, 216); // the door's left jamb, where it meets the ground

const DUR = 1.4;
const roof: Variants = {
  normal: { d: ROOF, transition: RETURN_TRANSITION },
  animate: {
    d: [ROOF, ROOF_PEAK, ROOF_PEAK, ROOF],
    transition: { duration: DUR, ease: ARRIVE, times: [0, 0.3, 0.6, 1] },
  },
};
const door: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    // opens 0.10 behind the roof's peak — follow-through, not a separate phase
    scaleX: [1, 0.12, 0.12, 1],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.4, 0.6, 1] },
  },
};

export const HouseIcon = forwardRef<IconHandle, IconProps>(function HouseIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="none">
          <path d={HOUSE} {...STROKE} />
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
        <motion.path d={ROOF} {...STROKE} variants={roof} />
        <path d={WALLS} {...STROKE} />
        <motion.path d={DOOR} {...STROKE} variants={door} style={HINGE} />
      </motion.svg>
    </div>
  );
});
