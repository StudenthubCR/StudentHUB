"use client";

/**
 * Bell — Iconimate
 *
 * Installed from https://iconimate.app/r/bell.json
 * Version e0143de39082 · icon last changed 2026-08-12
 *
 * This file is a COPY and does not update itself. To pull the current version:
 *   npx shadcn@latest add https://iconimate.app/r/bell.json
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

// RING — the bell rocks and the clapper swings inside it, trailing the shell and travelling
// the full width of its housing before the whole thing rings down.
//
// Traced off a reference recording rather than authored: 208 frames at 30fps, measured per
// frame as the horizontal offset between the glyph's upper third and its collar band. Over
// six consistent repetitions that trace shows the shell and clapper always moving in
// opposition, the clapper's amplitude about 1.9x the shell's, and a decaying oscillation
// that builds to the second swing before ringing down — shell peaks at t = .20 .44 .64 .80
// .92 with relative amplitudes .92 1.0 .79 .61 .21.
//
// THE GLYPH IS SPLIT INTO TWO OUTLINES, AND GETTING THAT WRONG IS THE TRAP HERE.
//
// The source draws the clapper as NEGATIVE SPACE: subpath 2 sits inside the collar's dip
// lobe wound the opposite way, so under nonzero they cancel. Filling it as its own shape
// adds 528px of ink (0.81% of the box), all in y192..223 — a solid blob under the bell.
// Masking it out fixes the rest state but not the motion: slide the hole more than a few
// units and the crescent goes lopsided, one side thickening into a mass that reads as
// filled. So the dip lobe is taken OUT of the shell and the clapper becomes its own
// outline — an annular segment between the collar's r=40 dip and the clapper's r=24 arc,
// both about (128,192), a U of uniform 16-unit thickness, which is the icon's stroke
// weight. Its white middle is its own hollowness. There is no mask.
// Verified: SHELL + CLAPPER against the source glyph is 40 differing pixels, max alpha gap
// 63 — antialiasing where two fills abut, not geometry.
//
// EVERY NUMBER IS READ OFF THE PATH.
//   · the shell hangs from its crown (128,24) — the dome is r=80 about (128,104);
//   · the glyph's box is x32..224, y24..232, and the largest rotation about the crown that
//     keeps every sampled point on the artboard is 12.20°, so the shell swings 12°;
//   · the clapper TRANSLATES rather than rotates. It and the collar are concentric, so
//     turning it about their shared centre only slides it along a wall it is already
//     parallel to — 3.32 units of travel before its edge binds, invisible at icon size.
//     Sliding it horizontally gives 16.57 units, five times further, with every extreme
//     point provably still inside the lobe. It runs 16, just inside that cap.
const SHELL =
  "M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H208a16,16,0,0,0,13.8-24.06Z" +
  "M48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z";
const CLAPPER = "M88.81,200a40,40,0,0,0,78.38,0L150.62,200A24,24,0,0,1,105.38,200Z";
// Full original glyph, for the reduced-motion static render.
const BELL =
  "M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z";

const CROWN = { transformBox: "view-box" as const, originX: 0.5, originY: 24 / 256 };

const shell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -11, 12, -9.5, 7.4, -2.5, 0],
    transition: {
      duration: 0.85,
      times: [0, 0.2, 0.44, 0.64, 0.8, 0.92, 1],
      ease: "easeInOut",
    },
  },
};

const clapper: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    // Same sign as the shell's rotation — a shell leaning bottom-right leaves its clapper
    // trailing left — and peaking ~0.04 of the timeline later, which is what makes it read
    // as a heavy arm being carried rather than a part glued to the bell.
    x: [0, -16, 16, -13, 9, -3.5, 0],
    transition: {
      duration: 0.85,
      times: [0, 0.24, 0.48, 0.68, 0.84, 0.94, 1],
      ease: "easeInOut",
    },
  },
};

export const BellIcon = forwardRef<IconHandle, IconProps>(function BellIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 256 256"
          fill="currentColor"
        >
          <path d={BELL} />
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
        fill="currentColor"
        initial="normal"
        animate={controls}
        style={{ overflow: "visible" }}
      >
        {/* The clapper rides inside the shell's group, so its travel is measured relative to
            the shell — the double-pendulum relationship a real bell has, for free. */}
        <motion.g variants={shell} style={CROWN}>
          <path d={SHELL} />
          <motion.path d={CLAPPER} variants={clapper} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
