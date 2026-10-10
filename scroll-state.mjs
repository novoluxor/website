export function scrollState(position, centers) {
  if (!centers.length) return {index:0, rotation:0, local:0};
  if (position <= centers[0]) return {index:0, rotation:0, local:0};
  const last = centers.length - 1;
  if (position >= centers[last]) return {index:last, rotation:last * 360, local:1};
  let segment = 0;
  while (segment < last - 1 && position > centers[segment + 1]) segment++;
  const local = (position - centers[segment]) / (centers[segment + 1] - centers[segment]);
  // Hold the front view at each chapter, then complete a turn between chapters.
  const turn = Math.max(0, Math.min(1, (local - .18) / .64));
  const eased = turn * turn * (3 - 2 * turn);
  return {index:segment + (local >= .5 ? 1 : 0), rotation:(segment + eased) * 360, local};
}

export function releaseOpacity(detailsTop, viewportHeight) {
  if (viewportHeight <= 0) return 0;
  return Math.max(0, Math.min(1, (detailsTop - viewportHeight * .5) / (viewportHeight * .4)));
}
