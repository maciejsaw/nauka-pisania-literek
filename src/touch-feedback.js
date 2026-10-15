// Visual feedback only: native clicks keep their normal scrolling/cancellation semantics.
export function initTouchFeedback() {
  let press;
  const clear = () => { press?.button.classList.remove('is-pressed'); press = undefined; };
  document.addEventListener('pointerdown', event => {
    clear();
    const button = event.target instanceof Element ? event.target.closest('button') : null;
    if (!event.isPrimary || event.button !== 0 || !button || button.disabled) return;
    press = { button, id: event.pointerId, x: event.clientX, y: event.clientY };
    button.classList.add('is-pressed');
  }, { passive: true });
  document.addEventListener('pointermove', event => {
    if (press && event.pointerId === press.id && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 10) clear();
  }, { passive: true });
  for (const type of ['pointerup', 'pointercancel']) document.addEventListener(type, clear, { passive: true });
  document.addEventListener('scroll', clear, { capture: true, passive: true });
  document.addEventListener('visibilitychange', clear);
  window.addEventListener('blur', clear);
  // Safari also emits these gestures outside the drawing canvas.
  for (const type of ['gesturestart', 'gesturechange']) {
    document.addEventListener(type, event => event.preventDefault(), { passive: false });
  }
}
