import { cubicOut } from 'svelte/easing';

export function hslide(node, {
	delay = 0,
	duration = 120,
	easing = cubicOut
}) {

	const width = parseFloat(getComputedStyle(node).width);

	return {
		delay,
		duration,
		easing,
		css: t =>
      `width: ${t * width}px;`
	};
}