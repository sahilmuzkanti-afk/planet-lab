export function keyboardAction(state, key, options = {}) {
  if (options.repeat || options.editing || options.altKey || options.ctrlKey || options.metaKey) return null;
  if (state === 'SOLAR_SYSTEM') {
    if (key === 'ArrowRight') return 'next';
    if (key === 'ArrowLeft') return 'previous';
    if (key === 'Home') return 'first';
    if (key === 'End') return 'last';
    if (key === 'Enter') return 'explore';
  }
  if (key === 'Escape') {
    if (state === 'PLANET_VIEW') return 'solar';
    if (state === 'PLANET_LAB') return 'planet';
    if (state === 'EXPERIMENT') return 'lab';
  }
  return null;
}
