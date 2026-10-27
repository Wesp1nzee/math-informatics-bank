/**
 * Safe haptic feedback for touch devices.
 *
 * `navigator.vibrate` is unavailable on iOS Safari, may be blocked by browser
 * permissions and throws in some embedded webviews. Feedback is a progressive
 * enhancement: never let it break an interaction.
 */
export function triggerHaptic(pattern: number | number[] = 8): void {
  if (typeof navigator === "undefined") return;
  if (typeof navigator.vibrate !== "function") return;

  try {
    navigator.vibrate(pattern);
  } catch {
    // Haptics are optional; ignore unsupported/blocked implementations.
  }
}
