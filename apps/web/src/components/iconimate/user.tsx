"use client";

/**
 * User — Iconimate
 *
 * Installed from https://iconimate.app/r/user.json
 * Version 52dc8a65c3c5 · icon last changed 2026-08-18
 *
 * This file is a COPY and does not update itself. To pull the current version:
 *   npx shadcn@latest add https://iconimate.app/r/user.json
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

// GLANCE — the head checks left, sweeps across to check right, and comes back
// to centre. Promoted from app/lab/user (variant 2).
//
// NOTHING IS SPLIT HERE, WHICH IS A FIRST FOR THIS SET. Phosphor's `user` is
// already two separate stroked elements — a `<circle>` head and a `<path>`
// shoulder arc, both `fill="none" stroke-width="16"`. There is no compound path
// to cut, so §1's pixel-diff gate does not apply: rest parity is exact BY
// CONSTRUCTION, not by measurement. Verified anyway at 512x512 — 0 flipped
// pixels against the authored glyph.
//
// THE HEAD CANNOT TURN, AND THAT IS WHY THIS SHIFTS INSTEAD OF ROTATING. The
// head is a perfect circle, and a circle rotated about its own centre is itself
// (§3). Rasterised and rotated 25.7° about (128,96) it differs from itself by
// 0.5568% — antialiasing on the rim and nothing else. This is `bicycle`'s wheel
// trap exactly: the rotation is real, costs a transform, and is invisible at any
// speed. A turn would need a face to turn and the mark has none; adding one is
// forbidden by §0 gate 1. So the gesture moves the circle's CENTRE. Do not
// "simplify" this back into a rotation — it will render as nothing.
//
// THE HEAD AND SHOULDERS ARE TANGENT AT REST, WHICH BOUNDS THE AMPLITUDE. The
// circle's lowest point and the shoulder arc's apex are both exactly (128,160):
// the two 16-wide strokes sit on one another there, overlapping by 15.5 units of
// ink. Generous for lateral motion, lethal for vertical. Below 18 units the
// shift is invisible (§2); above ~26 the chin slides off the shoulder apex and
// the neck joint visibly comes apart. 22 is the value that satisfies both — at
// full reach the head's ink lands at x34 / x221.5, inside the wall on both
// sides, and the joint holds 1,517 px of overlap against 3,197 at rest.
//
// THE LIFT IS HELD ACROSS THE SWEEP, NOT PUMPED PER SIDE. The 5-unit rise puts
// the head on a shallow arc instead of a rail (§10) — 5 UNITS, not the 10–20
// SCREEN PIXELS a general UI motion guide would hand you, which is 106 grid
// units and half this artboard (§14). Arcing up to the left, down through
// centre, then up again to the right bobs the head twice and reads as a bounce;
// rising once on the way out, holding while it crosses, and settling once on the
// way home reads as one continuous look.
//
// SYMMETRY IS SAFE HERE. The shoulder arc's second half is an `s` — a smooth
// reflection of the first — and the head is centred on x128, so the mark is
// mirror-symmetric about the centre line to within 0.193% (antialiasing). The
// right extreme is the left extreme's mirror and needs no separate clearance
// budget; measured joint overlap is 1,517 left against 1,514 right. The HOLDS
// are unequal instead (0.14 then 0.12), because §10 wants decaying repeats and
// two identical pauses read as a metronome.
//
// MATERIAL (§9): a person — soft and organic, so easeInOut and a held arc rather
// than the 0% detents a mechanism gets. Nothing here is springy enough to read
// as rubber, which a head on a neck would.
//
// REJECTED — recorded so the next author does not spend a day on it (§17):
//   - A HEAD TURN / SPIN. Invisible; see above.
//   - A SHRUG (shoulders lifting toward the ears). The most human gesture
//     available, and it does not survive the tangency: the shoulder apex already
//     touches the chin, so lifting it 18+ units to clear the amplitude floor
//     drives the arc straight through the head. Tried both directions —
//     shoulders up and head down — and both draw a line across the face. §1
//     forbids using opacity to hide a line collision, so there is no rescue.
//   - WIDENING THE SHOULDERS (scaleX) to suggest a breath. Needs ~1.18 to clear
//     the floor at the arc's endpoints, and at that amplitude a person does not
//     read as breathing, they read as inflating.
//   - A DRAW-ON IDENTIFY (head draws, beat, shoulders sweep in). Honest here,
//     since both elements are natively stroked, and it survives as `3 · Identify`
//     in app/lab/user. Not what shipped: it opens on `pathLength: 0`, so frame 0
//     is not the icon (§1), which a persistent avatar in a nav bar cannot afford.
//
// NO `repeat: Infinity` ANYWHERE, so there is no per-transition ambient gating to
// do — the hover replay loop in use-hover is already gated.

/** The glyph's own two elements, untouched. */
const HEAD = { cx: 128, cy: 96, r: 64 };
const SHOULDERS = "M32,216c19.37-33.47,54.55-56,96-56s76.63,22.53,96,56";

/** The mark is stroke-only; it is never filled. */
const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 16,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const DUR = 1.3;
const head: Variants = {
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -22, -22, 22, 22, 0],
    y: [0, -5, -5, -5, -5, 0],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.2, 0.34, 0.6, 0.72, 1] },
  },
};

export const UserIcon = forwardRef<IconHandle, IconProps>(function UserIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="none">
          <circle cx={HEAD.cx} cy={HEAD.cy} r={HEAD.r} {...STROKE} />
          <path d={SHOULDERS} {...STROKE} />
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
        <motion.circle cx={HEAD.cx} cy={HEAD.cy} r={HEAD.r} {...STROKE} variants={head} />
        <path d={SHOULDERS} {...STROKE} />
      </motion.svg>
    </div>
  );
});
