import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const gradientBackgrounds: Record<string, string> = {
	gradient1: 'linear-gradient(90deg, #3F2B96 0%, #A8C0FF 100%)',
	gradient2: 'linear-gradient(90deg, #FDBB2D 0%, #3A1C71 100%)',
	gradient3: 'linear-gradient(90deg, #9ebd13 0%, #008552 100%)',
	gradient4: 'linear-gradient(90deg, #d53369 0%, #daae51 100%)',
	gradient5: 'radial-gradient( circle 311px at 8.6% 27.9%,  rgba(62,147,252,0.57) 12.9%, rgba(239,183,192,0.44) 91.2% )',
	gradient6: 'radial-gradient( circle farthest-corner at 10% 20%,  rgba(176,229,208,1) 42%, rgba(92,202,238,0.41) 93.6% )',
	gradient7: 'radial-gradient( circle 897px at 9% 80.3%,  rgba(55,60,245,1) 0%, rgba(234,161,15,0.90) 100.2% )',
	gradient8: 'linear-gradient( 109.6deg,  rgba(61,131,97,1) 11.2%, rgba(28,103,88,1) 91.1% )',
	gradient9: 'radial-gradient( circle farthest-corner at 10% 20%,  rgba(100,43,115,1) 0%, rgba(4,0,4,1) 90% )',
	gradient10: 'linear-gradient( 91deg,  rgba(72,154,78,1) 5.2%, rgba(251,206,70,1) 95.9% )',
	gradient11: 'radial-gradient( circle farthest-corner at 10% 20%,  rgba(237,3,32,0.87) 20.8%, rgba(242,121,1,0.84) 74.4% )',
	gradient12: 'linear-gradient( 173.1deg,  rgba(226,66,249,0.94) 10.2%, rgba(79,147,249,1) 77.3% )',
	gradient13: 'linear-gradient( 64.3deg,  rgba(254,122,152,0.81) 17.7%, rgba(255,206,134,1) 64.7%, rgba(172,253,163,0.64) 112.1% )',
	gradient14: 'radial-gradient( circle farthest-corner at 10% 20%,  rgba(14,174,87,1) 0%, rgba(12,116,117,1) 90% )',
	gradient15: 'radial-gradient( circle 957px at 8.7% 50.5%,  rgba(246,191,13,1) 0%, rgba(249,47,47,1) 90% )',
	gradient16: 'linear-gradient( 358.4deg,  rgba(249,151,119,1) -2.1%, rgba(98,58,162,1) 90% )',
	gradient17: 'linear-gradient( 129.1deg,  rgba(243,199,83,1) 26.8%, rgba(18,235,207,1) 114.1% )',
	gradient18: 'radial-gradient( circle farthest-corner at 14.2% 24%,  rgba(239,61,78,1) 0%, rgba(239,61,78,0.81) 51.8%, rgba(239,61,78,0.63) 84.6% )',
	gradient19: 'linear-gradient( 109.6deg,  rgba(231,76,60,1) 11.2%, rgba(203,67,53,1) 91.1% )',
	gradient20: 'linear-gradient( 106.9deg,  rgba(148,14,60,1) 60.9%, rgba(3,22,27,1) 122.3% )'
}