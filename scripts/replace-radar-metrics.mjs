import { readFileSync, writeFileSync } from 'node:fs';

const file = 'profile-3d-contrib/profile-night-rainbow.svg';
const source = readFileSync(file, 'utf8');
const marker = '<g transform="translate(980, 284.5)">';
const start = source.indexOf(marker);
if (start < 0) throw new Error(`Radar chart group not found in ${file}`);

function endOfGroup(svg, groupStart) {
  let depth = 0;
  let position = groupStart;
  const tagPattern = /<\/?g(?:\s|>)/g;
  let match;
  while ((match = tagPattern.exec(svg.slice(groupStart))) !== null) {
    if (match[0][1] === '/') depth -= 1;
    else depth += 1;
    if (depth === 0) return groupStart + tagPattern.lastIndex;
    position = groupStart + tagPattern.lastIndex;
  }
  throw new Error(`Radar chart group is not closed in ${file}`);
}

const end = endOfGroup(source, start);
function metricValue(label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`<text[^>]*>${escaped}<title>([0-9,]+)</title>`));
  return match?.[1] ?? '0';
}

const metrics = {
  Commit: metricValue('Commit'),
  Repo: metricValue('Repo'),
  PullReq: metricValue('PullReq'),
  Issue: metricValue('Issue'),
  Review: metricValue('Review'),
};

const replacement = `<g transform="translate(980, 284.5)">
  <text x="-150" y="-145" class="fill-fg" style="font-size: 18px; font-weight: bold;">Contribution metrics</text>
  <text x="-150" y="-122" class="fill-weak" style="font-size: 12px;">Separate scales by category</text>
  <g transform="translate(-150 -92)"><text class="fill-fg" style="font-size: 14px;">Commit</text><rect x="62" y="-11" width="188" height="14" rx="3" class="stroke-weak" fill="none"/><rect x="62" y="-11" width="18" height="14" rx="3" class="fill-strong"/><text x="260" y="1" class="fill-fg" style="font-size: 14px;">${metrics.Commit}</text></g>
  <g transform="translate(-150 -49)"><text class="fill-fg" style="font-size: 14px;">Repo</text><rect x="62" y="-11" width="188" height="14" rx="3" class="stroke-weak" fill="none"/><rect x="62" y="-11" width="18" height="14" rx="3" class="fill-strong"/><text x="260" y="1" class="fill-fg" style="font-size: 14px;">${metrics.Repo}</text></g>
  <g transform="translate(-150 -6)"><text class="fill-fg" style="font-size: 14px;">PullReq</text><rect x="62" y="-11" width="188" height="14" rx="3" class="stroke-weak" fill="none"/><rect x="62" y="-11" width="18" height="14" rx="3" class="fill-strong"/><text x="260" y="1" class="fill-fg" style="font-size: 14px;">${metrics.PullReq}</text></g>
  <g transform="translate(-150 37)"><text class="fill-fg" style="font-size: 14px;">Issue</text><rect x="62" y="-11" width="188" height="14" rx="3" class="stroke-weak" fill="none"/><text x="260" y="1" class="fill-fg" style="font-size: 14px;">${metrics.Issue}</text></g>
  <g transform="translate(-150 80)"><text class="fill-fg" style="font-size: 14px;">Review</text><rect x="62" y="-11" width="188" height="14" rx="3" class="stroke-weak" fill="none"/><text x="260" y="1" class="fill-fg" style="font-size: 14px;">${metrics.Review}</text></g>
</g>`;

writeFileSync(file, source.slice(0, start) + replacement + source.slice(end), 'utf8');
