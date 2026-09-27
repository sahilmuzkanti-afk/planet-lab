export const experimentNames = Object.freeze([
  'drop',
  'jump',
  'throw',
  'weight',
  'pendulum',
  'launch',
  'feather'
]);

export function isExperimentName(name) {
  return typeof name === 'string' && experimentNames.includes(name);
}
