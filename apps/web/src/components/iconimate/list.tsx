"use client";

/**
 * List — Iconimate
 *
 * Installed from https://iconimate.app/r/list.json
 * Version 42da7d34840b · icon last changed 2026-09-02
 *
 * This file is a COPY and does not update itself. To pull the current version:
 *   npx shadcn@latest add https://iconimate.app/r/list.json
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

// COLLAPSE — the list folds shut and springs back open: the outer two rows travel
// a full row-pitch onto the middle one, hold there closed for a beat, then open
// past home and settle.
//
// VERB: it FOLDS. A list is a stack of rows with space between them, and the one
// thing that space can do is close. Not "pulse" — three parallel bars are the
// easiest mark in the set to throb pointlessly, and a staggered scale pulse was
// the first idea here and was thrown away as exactly the §0 failure: amplitude
// standing in for a verb.
//
// MATERIAL: paper / rows (§9) — ARRIVE, 3-5% overshoot, 1.0x base. These are lines
// of content, not metal and not rubber. Nothing here squashes, and the reopen
// overshoots by 5 units and settles rather than springing.
//
// THE GLYPH ALREADY CONTAINS THE MOVING PARTS (§0 gate 1): three separate `line`
// elements, already drawn. So the rows move and nothing else does. No geometry is
// added anywhere in this file.
//
// Promoted from `app/lab/list/page.tsx` (variant 3 of 5 — Cascade, Tick, Collapse,
// Scroll, Sort); the four rejected takes and the full measurements live there.
//
// ── MEASURED (512x512, counting only pixels that flip ink/no-ink) ──────────
//
//   ink bbox   x32..223.5, y56..199.5 — round caps add 8 to each end of a 40..216
//              line. LANE: 32 left, 32.5 right, 56 top, 56.5 bottom. Nothing
//              touches a wall, and this gesture is purely vertical within the
//              existing stack, so nothing can leave the box (§4).
//   row pitch  64 units — the travel distance here, and the largest clear lane in
//              this mark. At 24px that is 6px per row.
//
//   rotate 180deg about (128,128) -> 0.0000%     mirror about y=128 -> 0.0000%
//
//   Three identical bars at equal pitch are invariant under permutation and under
//   reflection. That symmetry is why the OUTER rows are the ones that move: the
//   gesture is mirror-symmetric about the middle row, so it cannot introduce a
//   visual bias toward the top or bottom of the stack.
//
// ── THE MIDDLE ROW NEVER MOVES ─────────────────────────────────────────────
//
// It is the hinge. Giving it motion of its own leaves the other two nothing to
// collapse ONTO — one part held still is what makes the other two read as
// travelling rather than as the whole mark scaling down. Its variant is a static
// `y: 0` rather than an omitted variant, so it is explicit at the call site.
//
// ── TIMING ─────────────────────────────────────────────────────────────────
//
//   0.00-0.34  CLOSE. 64 units each, easeInOut — moving while on screen (§8).
//   0.34-0.48  HOLD CLOSED. ~109ms of stillness. Without it the gesture is a
//              bounce off the centre; with it the list is briefly, deliberately
//              SHUT, which is the whole content of the motion.
//   0.48-0.62  OPEN, past home by 5 units.
//   0.62-1.00  SETTLE onto rest under ARRIVE.
//
// Amplitude (§2): 64 units of primary travel, 3.5x the 18-unit floor. The 5-unit
// reopen overshoot is deliberately under the floor — §2's exception for secondary
// detail riding a primary that clears it comfortably.
//
// ── REJECTED (§17) ─────────────────────────────────────────────────────────
//
//   · A STAGGERED SCALE PULSE on the three rows. The obvious first idea for
//     parallel bars and precisely what makes a set read as machine-generated.
//   · THE HAMBURGER -> X MORPH. Best-known gesture for this shape, wrong for THIS
//     icon: the mark is `list`, and a still frame 60% through the morph reads as a
//     close button, not a list (§0 gate 2). It belongs on a menu-toggle icon that
//     owns both states.
//   · MOVING ALL THREE ROWS toward a common centre. With the middle row also
//     moving there is no hinge, and the result reads as the icon scaling on Y
//     rather than as rows folding.
//
// ── THE STANDING TEST — the failure I was most worried about ───────────────
//
// AT THE CLOSED POSE ALL THREE ROWS OVERLAP ON y128, so for ~109ms the icon is a
// SINGLE BAR — a list that briefly is not a list. That is the one thing here that
// could read as a glitch at 20px rather than as a fold.
//
// Resolved, and checked against §0 gate 2 rather than by eye: a still frame 60%
// through the pass has the outer rows already back within 5 units of home
// (interpolating the 0.48->0.62 leg puts them at y+4.9), so the frame reads as the
// list. The single-bar pose occupies 34-48% of the pass and is bounded on both
// sides by poses that are exactly rest. It is a state the gesture passes THROUGH
// at speed, not one it holds long enough to be mistaken for the resting mark.
//
// Second worry, the FIFTIETH HOVER: at 0.78s this is Expressive tier (§8) and
// `list` is a nav icon that may fire all day. It survives that room because the
// motion is one closed round trip with no repeat, no accent and no ambient layer —
// nothing moves unless the user is pointing at it, so it cannot compete for
// peripheral attention (standing test 5). The hit area is fixed: the rows travel
// only inward, so the mark's silhouette never grows and never moves out from under
// the cursor. Every exit lands on y0 — the authored mark — because `normal` is
// plain `y: 0` and RETURN_TRANSITION carries any interrupt straight back to it.

const X1 = 40;
const X2 = 216;
/** Authored row positions. Pitch 64; the middle one is the hinge. */
const ROWS = [64, 128, 192] as const;

const line = (y: number) => ({ x1: X1, y1: y, x2: X2, y2: y });

const DUR = 0.78;

/** `dir` is the direction a row travels to reach the middle: +1 top, -1 bottom,
 *  0 for the hinge, which holds still explicitly. */
const collapse = (dir: -1 | 0 | 1): Variants =>
  dir === 0
    ? { normal: { y: 0, transition: RETURN_TRANSITION }, animate: { y: 0 } }
    : {
        normal: { y: 0, transition: RETURN_TRANSITION },
        animate: {
          // close · HOLD closed · open past home · settle
          y: [0, dir * 64, dir * 64, dir * -5, 0],
          transition: {
            duration: DUR,
            times: [0, 0.34, 0.48, 0.62, 1],
            ease: ["easeInOut", "linear", "easeOut", ARRIVE],
          },
        },
      };

const DIRS = [1, 0, -1] as const;

export const ListIcon = forwardRef<IconHandle, IconProps>(function ListIcon(
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
          fill="none"
          stroke="currentColor"
          strokeWidth={16}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {ROWS.map((y) => (
            <line key={y} {...line(y)} />
          ))}
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
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial="normal"
        animate={controls}
      >
        {/* Transforms sit directly on each `line`. A shared `motion.g` carrying the
            travel was tried in the lab and silently did not animate while its
            children's variants did — every transform here owns its own element. */}
        {ROWS.map((y, i) => (
          <motion.line key={y} {...line(y)} variants={collapse(DIRS[i])} />
        ))}
      </motion.svg>
    </div>
  );
});
