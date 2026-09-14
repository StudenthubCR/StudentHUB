"use client";

/**
 * Map Pin — Iconimate
 *
 * Installed from https://iconimate.app/r/map-pin.json
 * Version 6934e6f0830d · icon last changed 2026-08-18
 *
 * This file is a COPY and does not update itself. To pull the current version:
 *   npx shadcn@latest add https://iconimate.app/r/map-pin.json
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

/* ───────────────────────────────────────────────────────────────���─────────────
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

// PLANT — the pin rears back, drives down onto its point, and the impact throws
// it into a rock that damps out. Promoted from app/lab/map-pin (variant 6,
// which composes that page's `1 · Drop` with its `3 · Swing`).
//
// NOTHING IS SPLIT. Phosphor's `map-pin` is already two stroked elements — the
// teardrop body and the inner `<circle>` — both `fill="none" stroke-width="16"`.
// Rest parity is exact by construction (§1); nothing is restated or rebuilt.
//
// ══ THE LANE IS THE WRONG SHAPE FOR THE GESTURE THIS ICON WANTS ══
//
// Ink bbox is x[40, 215.5], y[16, 239.5]:
//     left 40 · right 40.5 · TOP 16 · BOTTOM 16.5
// Forty units of horizontal room and sixteen of vertical — and the one gesture
// every map pin wants is a DROP, which is vertical. Measured at 512x512:
// lifting the mark 28 units clips the top outright, ink falling from 46,076 to
// 43,346. The §2 amplitude floor of 18 CANNOT be cleared upward inside the box.
//
// SO THIS ICON OPENS ITS WRAPPER (`overflow: visible`), which §4 lists as the
// second legitimate outcome and which `star`'s rays and `airplane-taxiing`
// already ship. At the top of the wind-up the crown sits 10 units above the
// box; at rest nothing is outside it, which is the condition §4 attaches. If
// you close this box the wind-up is silently clipped and the gesture loses the
// only thing that makes it read as a drop.
//
// THE TIP IS THE ANCHOR, AND IT IS EXACT. The body path ends its first curve at
// (128, 232) — the point that touches the map — and the rotation pivots there,
// because a pin driven into a surface turns about its point and nowhere else.
// It also gives enormous leverage: the crown sits 216 units from the tip, so
// every degree is worth 3.77 units and the floor is cleared at 4.8°. Like
// `phone`, the danger on this glyph is overshooting, not under-reading. Six
// degrees is a real rock here; fifteen would look like the pin falling over.
//
// ══ IT OVERLAPS INSTEAD OF HANDING OFF, AND THAT IS THE DISTINCTION ══
//
// Every other composite in this set (`envelope`'s unfold, `phone`'s call) puts
// a beat of stillness between its two halves, because one phase HANDS OFF to
// the other. Here the impact CAUSES the rock — drive something into the ground
// and it wobbles — and §11 is explicit that causation is the case where you
// overlap rather than separate. The rotation starts at 0.56, just after the
// body's impact at 0.42, close enough to read as a consequence of it.
//
// THE ROTATION ALSO LEADS, WHICH THE SWING ALONE COULD NOT DO. During the
// wind-up the pin tilts -3°: it rears BACK before it comes down, the same
// anticipation the vertical channel is doing, applied to the axis that will
// carry the follow-through. That counter-tilt is what makes the +6° after
// impact read as a whip rather than a nudge.
//
// AMPLITUDES, BOTH MEASURED AND BOTH INDEPENDENT. The drop travels 26 units and
// the rock's crown 22.6 (6° on a 216-unit lever). Each clears the §2 floor on
// its own, which is why this reads as two gestures rather than one with a
// decoration. Side clearance at +6° is 27 units, at -4° it is 31; the impact
// pose keeps 12.5 at the bottom.
//
// §3 TRAPS, TWO OF THEM, BOTH AVOIDED:
//   - THE INNER DOT IS A PERFECT CIRCLE, so rotating it about its own centre is
//     invisible. Nothing here rotates it independently; it rides the body. If
//     you ever want the dot to act alone, change its RADIUS (a `scale` drags
//     the 16-unit pen with it, §12) — that is what `2 · Ping` does in the lab.
//   - THE WHOLE MARK IS MIRROR-SYMMETRIC about x128, measured at 0.204%, so
//     `scaleX: -1` is the identity transform here exactly as in `envelope`.
//
// REJECTED — recorded so the next author does not spend a day on it (§17):
//   - A PIN THAT FALLS IN FROM ABOVE, starting off-canvas. It is the canonical
//     map-pin animation and a straight §1 violation: frame 0 would be an empty
//     box, not the icon. This inverts it into rest→rear→plant→rock→rest, which
//     reads as the pin being driven in rather than arriving from nowhere.
//   - A SHADOW OR GROUND-SPOT under the tip to sell the landing. There is no
//     shadow vocabulary in this set — `currentColor` only (§12) — and a ground
//     ellipse is a new object, the same call that kept the letter out of
//     `envelope`.
//   - CLOSING THE WRAPPER to keep the icon tidy. See the lane note; it clips.
//
// MATERIAL (§9): a rigid marker driven into a surface. ARRIVE on the fall so the
// weight is at the end of it, easeInOut on the rock because it reverses
// direction repeatedly (§8), and the decay does the settling. No squash — a pin
// that squashes reads as rubber. The 4-unit dip past rest is impact, not bounce.
//
// NOTHING HERE REPEATS INDEFINITELY, so there is no per-transition ambient
// gating to do — the hover replay loop in use-hover is already gated (§13).
// (Phrased without the literal token on purpose: scripts/audit-motion.mjs scans
// source text for it, and spelling it out in a comment trips a false positive.)

const BODY = "M208,104c0,72-80,128-80,128S48,176,48,104a80,80,0,0,1,160,0Z";
const DOT = { cx: 128, cy: 104, r: 32 };

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
/** The point that touches the map. The rock turns about it and nowhere else. */
const TIP = AT(128, 232);

/** `visible`, not `hidden` — the wind-up needs the margin. See the header. */
const BOX = { display: "inline-flex", overflow: "visible" } as const;

const DUR = 1.4;
const plant: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -26, 4, 0, 0],
    rotate: [0, -3, 0, 6, -4, 2, 0],
    transition: {
      y: { duration: DUR, ease: ARRIVE, times: [0, 0.22, 0.42, 0.52, 1] },
      rotate: {
        duration: DUR,
        ease: "easeInOut",
        times: [0, 0.22, 0.4, 0.56, 0.72, 0.86, 1],
      },
    },
  },
};

export const MapPinIcon = forwardRef<IconHandle, IconProps>(function MapPinIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ ...BOX, ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="none">
          <path d={BODY} {...STROKE} />
          <circle cx={DOT.cx} cy={DOT.cy} r={DOT.r} {...STROKE} />
        </svg>
      </div>
    );
  }

  return (
    <div {...props} {...bind} style={{ ...BOX, ...style }}>
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
        <motion.g variants={plant} style={TIP}>
          <path d={BODY} {...STROKE} />
          <circle cx={DOT.cx} cy={DOT.cy} r={DOT.r} {...STROKE} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
