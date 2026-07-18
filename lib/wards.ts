export interface Ward {
  name: string;
  lat: number;
  lng: number;
}

export const KOCHI_WARDS: Ward[] = [
  { name: "Fortkochi-1", lat: 9.9692, lng: 76.2443 }, { name: "Kalvathy-2", lat: 9.9678, lng: 76.2472 }, { name: "Earaveli-3", lat: 9.9634, lng: 76.2498 }, { name: "Karippalam-4", lat: 9.9612, lng: 76.2512 }, { name: "Mattanchery-5", lat: 9.9592, lng: 76.2554 }, { name: "Kochangadi-6", lat: 9.9548, lng: 76.2531 }, { name: "Cheralayi-7", lat: 9.9568, lng: 76.2578 }, { name: "Panayappilly-8", lat: 9.9512, lng: 76.2562 }, { name: "Chakkamadom-9", lat: 9.9482, lng: 76.2541 }, { name: "Karuvelippady-10", lat: 9.9448, lng: 76.2575 }, { name: "Thoppumpady-11", lat: 9.9388, lng: 76.2598 }, { name: "Tharebhagam-12", lat: 9.9338, lng: 76.2581 }, { name: "Kadebhagam-13", lat: 9.9298, lng: 76.2595 }, { name: "Thazhuppu-14", lat: 9.9248, lng: 76.2572 }, { name: "Eadakochi North-15", lat: 9.9198, lng: 76.2622 }, { name: "Edakochi South-16", lat: 9.9088, lng: 76.2682 }, { name: "Perumbadappu-17", lat: 9.9018, lng: 76.2752 }, { name: "Konam-18", lat: 9.9412, lng: 76.2482 }, { name: "Kacheripady-19", lat: 9.9832, lng: 76.2798 }, { name: "Nambyapuram-20", lat: 9.9322, lng: 76.2452 }, { name: "Pullardesam-21", lat: 9.9272, lng: 76.2442 }, { name: "Mundamvelly-22", lat: 9.9362, lng: 76.2422 }, { name: "Manasserry-23", lat: 9.9432, lng: 76.2392 }, { name: "Moolamkuzhy-24", lat: 9.9522, lng: 76.2382 }, { name: "Chullickal-25", lat: 9.9472, lng: 76.2492 }, { name: "Nazreth-26", lat: 9.9488, lng: 76.2625 }, { name: "Fortkochi Veli-27", lat: 9.9622, lng: 76.2412 }, { name: "Amaravathy-28", lat: 9.9652, lng: 76.2428 },
  { name: "Island North-29", lat: 9.9612, lng: 76.2698 }, { name: "Island South-30", lat: 9.9432, lng: 76.2782 },
  { name: "Vaduthala West-31", lat: 10.0152, lng: 76.2722 }, { name: "Vaduthala East-32", lat: 10.0192, lng: 76.2792 }, { name: "Elamakkara North-33", lat: 10.0242, lng: 76.2912 }, { name: "Puthukkalavattam-34", lat: 10.0158, lng: 76.2952 }, { name: "Ponekkara-35", lat: 10.0298, lng: 76.2998 }, { name: "Kunnumpuram-36", lat: 10.0272, lng: 76.3052 }, { name: "Edappally-37", lat: 10.0212, lng: 76.3092 }, { name: "Dhevankulangara-38", lat: 10.0112, lng: 76.2992 }, { name: "Karukappilli-39", lat: 10.0022, lng: 76.2932 }, { name: "Mamangalam-40", lat: 10.0162, lng: 76.3012 },
  { name: "Padivattam-41", lat: 10.0062, lng: 76.3142 }, { name: "Vennala-42", lat: 10.0012, lng: 76.3262 }, { name: "Palarivattam-43", lat: 9.9962, lng: 76.3112 }, { name: "Karanakkodam-44", lat: 9.9862, lng: 76.3142 }, { name: "Thammanam-45", lat: 9.9892, lng: 76.3212 }, { name: "Chakkaraparambu-46", lat: 9.9812, lng: 76.3272 }, { name: "Chalikkavattam-47", lat: 9.9832, lng: 76.3352 }, { name: "Ponnurunni East-48", lat: 9.9752, lng: 76.3192 }, { name: "Vyttila-49", lat: 9.9689, lng: 76.3183 }, { name: "Chambakkara-50", lat: 9.9582, lng: 76.3232 }, { name: "Poonithura-51", lat: 9.9492, lng: 76.3282 }, { name: "Vyttila Janatha-52", lat: 9.9612, lng: 76.3142 }, { name: "Ponnurunni-53", lat: 9.9692, lng: 76.3092 },
  { name: "Elamkulam-54", lat: 9.9682, lng: 76.3122 }, { name: "Girinagar-55", lat: 9.9652, lng: 76.2992 }, { name: "Panampilli Nagar-56", lat: 9.9592, lng: 76.2952 }, { name: "Kadavanthra-57", lat: 9.9672, lng: 76.3012 }, { name: "Konthuruthy-58", lat: 9.9482, lng: 76.3022 }, { name: "Thevara-59", lat: 9.9382, lng: 76.2982 }, { name: "Perumanur-60", lat: 9.9532, lng: 76.2882 }, { name: "Ravipuram-61", lat: 9.9592, lng: 76.2832 }, { name: "Ernakulam South-62", lat: 9.9632, lng: 76.2882 }, { name: "Gandhi Nagar-63", lat: 9.9712, lng: 76.2932 }, { name: "Kathrikadavu-64", lat: 9.9752, lng: 76.2982 }, { name: "Kaloor South-65", lat: 9.9862, lng: 76.2912 }, { name: "Ernakulam Central II-66", lat: 9.9792, lng: 76.2812 }, { name: "Ernakulam North-67", lat: 9.9922, lng: 76.2792 }, { name: "Ayyappankavu-68", lat: 9.9982, lng: 76.2772 }, { name: "Thrikkanarvattom-69", lat: 9.9912, lng: 76.2872 }, { name: "Kaloor North-70", lat: 10.0032, lng: 76.2882 }, { name: "Elamakkara South-71", lat: 10.0092, lng: 76.2912 }, { name: "Pottakuzhy-72", lat: 10.0012, lng: 76.2842 }, { name: "Pachalam-73", lat: 10.0072, lng: 76.2742 }, { name: "Thattazham-74", lat: 9.9432, lng: 76.3382 },
];

export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const radians = Math.PI / 180;
  const dLat = (lat2 - lat1) * radians;
  const dLon = (lon2 - lon1) * radians;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * radians) * Math.cos(lat2 * radians) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function nearestWard(lat: number, lng: number): Ward {
  return KOCHI_WARDS.reduce((closest, ward) =>
    getDistance(lat, lng, ward.lat, ward.lng) < getDistance(lat, lng, closest.lat, closest.lng) ? ward : closest,
  );
}
