export const eventTypesWithValues = [
  'input',
  'change',
  'keypress',
  'url',
  'waitForTimeout',
];

export function renderedTarget(event) {
  if (event.target) {
    return event.target;
  }
  if (typeof event.value === 'string') {
    return event.value;
  }
  return '';
}
