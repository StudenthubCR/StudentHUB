"use client";

/**
 * Envelope — Iconimate
 *
 * Installed from https://iconimate.app/r/envelope.json
 * Version cbae94197832 · icon last changed 2026-08-18
 *
 * This file is a COPY and does not update itself. To pull the current version:
 *   npx shadcn@latest add https://iconimate.app/r/envelope.json
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

/* ─────────────────────────────────────────────────────────────────────────────
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

// UNFOLD — both flaps open. The top flap swings up over its hinge, the bottom
// triangle completes and swings DOWN past its own, both hang open, and the
// envelope folds itself back together bottom-first. Promoted from
// app/lab/envelope (variant 6).
//
// NOTHING IS SPLIT. Phosphor's `envelope` is already four stroked elements — the
// flap polyline, the body, and the two lower creases, all `fill="none"
// stroke-width="16"`. Rest parity is exact by construction (§1) and `pathLength`
// is native throughout (§5). The flap polyline is restated as an equivalent path
// so its apex can be morphed; rendered through the real SVG renderer, polyline
// and path differ by 0 pixels of 17,408 — exact, not "close enough".
//
// ══ FINDING 1: DO NOT OPEN THE FLAP WITH scaleY ══
//
// The obvious implementation is `scaleY: 1 -> -1` about the hinge line y=56, and
// it is WRONG — not as taste, as a rendering defect. An SVG transform scales the
// STROKE with the geometry, so as the flap passes through the hinge its 16-unit
// pen is scaled to nothing. Measured at 512x512: at the halfway point the flap's
// ink is **0 pixels**. It does not go edge-on, it BLINKS OUT and comes back — a
// hole in the middle of the gesture, which at 24px reads as the icon breaking.
//
// The fix is to morph the apex instead: `M224,56L128,144L32,56` ->
// `M224,56L128,12L32,56`. One number changes, so motion interpolates the string
// numerically in place and the pen stays exactly 16 the whole way (§12). Ink
// through the pass: 17,408 at rest, 13,100 at the hinge, 14,418 fully open —
// never zero. At the hinge the flap does not vanish, it lands on the body's top
// edge and merges with it, which is what a flap seen edge-on should do. Do not
// "simplify" this back into a scale. A full flip would not fit anyway: at
// scaleY -1 the ink lands at y-40, outside the box.
//
// ══ FINDING 2: THE BOTTOM TRIANGLE IS LATENT IN THE MARK ══
//
// The two lower creases stop 34.9 units short of each other. At rest that gap is
// invisible because the flap's V fills it. The moment the flap lifts, they are
// left as a broken chevron pointing at nothing.
//
// The completion is NOT invented, it is derived. Extend both creases along their
// own directions and they intersect at (128, 112.004) — dead on the centre line
// — each truncated by exactly 23.67 units, mirrored, slopes of exactly ±0.9167.
// Phosphor drew a triangle and trimmed both edges by the same amount. The open
// state restores what the closed state was hiding. This is also what a real
// envelope does: open the flap and the bottom panel is a complete triangle.
//
// ══ FINDING 3: THE CREASE TIPS ARE JOINED TO THE FLAP, NOT MERELY TRIMMED ══
//
// Found by shipping the bug. An earlier cut held the creases at their resting
// truncation for the first 8–10% of the pass, then completed them. On screen the
// flap lifts away and the creases hang in mid-air before snapping out to meet —
// the exact deconstructed look FINDING 2 was meant to remove.
//
// The cause is geometric. The flap's left edge runs (32,56)->(128,144); at y=128
// it is at x=110.55, and the authored left crease tip is at x=110.55. Right side
// likewise, 145.45 against 145.45 — both matching to within 0.0045 units. THE
// CREASES DO NOT STOP SHORT OF AN APEX, THEY STOP WHERE THEY MEET THE FLAP'S
// EDGES. The truncation is a junction, so the tips are attached, and when the
// flap moves they must move WITH it from frame one. Both schedules here start at
// t=0 with the flap and retract on its descent, never after it.
//
// ══ FINDING 4: THE TWO FLAPS ARE NEAR-MIRRORS, WHICH THE GLYPH DECIDED ══
//
// The top flap's apex rests 88 units BELOW its hinge (y56). The bottom flap's
// derived apex sits 85.74 units ABOVE its hinge — the line y197.74 joining the
// two bottom crease ends. Within 2.6 units of a perfect mirror. So the bottom
// opens on the SAME 0.5 ratio the top does, putting its apex at 240.6 and its
// ink at y248, eight units clear of the wall against the four the open top flap
// spends. Both halves are the same gesture at opposite ends. And both merge at
// their hinge: the bottom flap edge-on overlaps the body by 11,026 px along its
// bottom edge, the same payoff FINDING 1 bought, arriving free at the other end.
//
// IT CLOSES BOTTOM-FIRST, WHICH IS BOTH CORRECT AND NECESSARY. Correct because
// that is how the object works — the bottom panel folds up, then the top flap
// comes down over it. Necessary because it removes the descent collision: the
// bottom triangle is back at its resting truncation before the top flap descends
// through y112, where the triangle's apex would otherwise be.
//
// TIMING WAS SIMULATED, NOT READ OFF THE KEYFRAMES. Both tracks were sampled
// through their real bezier at 60fps. Result: zero frames where the flap has
// cleared but the triangle is still incomplete, and exactly ONE frame (t≈0.01)
// where tip and rising apex come within ~9 units — which is the junction
// separating, not a defect. Re-time one track without the other and this breaks.
//
// LANE (§4): ink bbox x[24, 231.5], y[48, 207.5] — 24 left, 24.5 right, 48 top,
// 48.5 bottom. At full unfold the ink spans y4..y248, four units clear at the
// top and eight at the bottom. Nothing paints outside the box at rest.
//
// REJECTED — recorded so the next author does not spend a day on it (§17):
//   - scaleY ON THE FLAP. FINDING 1; a measured rendering failure.
//   - FLIPPING THE ENVELOPE horizontally to "show the back". The mark is
//     mirror-symmetric about x128 to within 0.086%, so `scaleX: -1` is the
//     identity transform. §3's trap, the same one `bicycle`'s wheels fall into.
//   - A LETTER SLIDING OUT. The first idea everyone has, and it means drawing a
//     sheet that is not in the mark. §0 gate 1 forbids adding geometry, and a new
//     object is a worse violation than a duplicated one: at 24px the result reads
//     as a different icon, not as this one animating.
//
// MATERIAL (§9): PAPER. ARRIVE throughout, no springs, no overshoot — paper
// creases and settles, it does not bounce.
//
// STANDING TEST, HONESTLY: this is the most expressive gesture in the set and it
// is 1.8s. It is a gallery piece. In a mail toolbar firing on every hover, the
// lab's `1 · Open` (the top flap alone, 1.2s) is the one that survives question
// one, and it is kept in app/lab/envelope for exactly that reason.
//
// NO `repeat: Infinity` ANYWHERE, so there is no per-transition ambient gating to
// do — the hover replay loop in use-hover is already gated.

/* ── Geometry ─────────────────────────────────────────────────────────────── */

const FLAP_REST = "M224,56L128,144L32,56";
const FLAP_OPEN = "M224,56L128,12L32,56";
const BODY =
  "M32,56H224a0,0,0,0,1,0,0V192a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V56A0,0,0,0,1,32,56Z";

/** Authored creases — truncated where they meet the flap's edges (FINDING 3). */
const CREASE_L = "M110.55,128L34.47,197.74";
const CREASE_R = "M221.53,197.74L145.45,128";
/** Run out to the apex they already point at: (128, 112). */
const CREASE_L_WHOLE = "M128,112L34.47,197.74";
const CREASE_R_WHOLE = "M221.53,197.74L128,112";
/** Bottom flap swung open past its own hinge, mirroring the top (FINDING 4). */
const CREASE_L_OPEN = "M128,240.6L34.47,197.74";
const CREASE_R_OPEN = "M221.53,197.74L128,240.6";

/** The mark is stroke-only; it is never filled. */
const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 16,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const DUR = 1.8;
/** Shared schedule: both creases always move together. */
const CREASE_TIMES = [0, 0.08, 0.38, 0.56, 0.72, 0.9, 1];

const flap: Variants = {
  normal: { d: FLAP_REST, transition: RETURN_TRANSITION },
  animate: {
    d: [FLAP_REST, FLAP_OPEN, FLAP_OPEN, FLAP_REST],
    transition: { duration: DUR, ease: ARRIVE, times: [0, 0.24, 0.78, 1] },
  },
};
const creaseL: Variants = {
  normal: { d: CREASE_L, transition: RETURN_TRANSITION },
  animate: {
    d: [
      CREASE_L,
      CREASE_L_WHOLE,
      CREASE_L_OPEN,
      CREASE_L_OPEN,
      CREASE_L_WHOLE,
      CREASE_L,
      CREASE_L,
    ],
    transition: { duration: DUR, ease: ARRIVE, times: CREASE_TIMES },
  },
};
const creaseR: Variants = {
  normal: { d: CREASE_R, transition: RETURN_TRANSITION },
  animate: {
    d: [
      CREASE_R,
      CREASE_R_WHOLE,
      CREASE_R_OPEN,
      CREASE_R_OPEN,
      CREASE_R_WHOLE,
      CREASE_R,
      CREASE_R,
    ],
    transition: { duration: DUR, ease: ARRIVE, times: CREASE_TIMES },
  },
};

export const EnvelopeIcon = forwardRef<IconHandle, IconProps>(function EnvelopeIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="none">
          <path d={FLAP_REST} {...STROKE} />
          <path d={BODY} {...STROKE} />
          <path d={CREASE_L} {...STROKE} />
          <path d={CREASE_R} {...STROKE} />
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
        <motion.path d={FLAP_REST} {...STROKE} variants={flap} />
        <path d={BODY} {...STROKE} />
        <motion.path d={CREASE_L} {...STROKE} variants={creaseL} />
        <motion.path d={CREASE_R} {...STROKE} variants={creaseR} />
      </motion.svg>
    </div>
  );
});
