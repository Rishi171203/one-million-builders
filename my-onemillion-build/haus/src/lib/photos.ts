// Real home photography (Unsplash). All photo IDs below were verified to return
// HTTP 200. We optimize delivery via next/image, so we only ask Unsplash for a
// generously sized source here and let Next handle resizing/format per device.

/** Build an Unsplash source URL for a given photo id. */
export function unsplashUrl(id: string, w = 1600, q = 80): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;
}

export type HomePhoto = {
  id: string;
  /** Accessible description of the photo. */
  alt: string;
  /** City label shown in the caption. */
  city: string;
  /** Flag emoji for the city's country. */
  flag: string;
};

/** The hero photo — a striking modern home for the landing headline. */
export const HERO_PHOTO: HomePhoto = {
  id: "1568605114967-8130f3a36994",
  alt: "A bright modern family home at dusk",
  city: "Your next home",
  flag: "🏡",
};

/**
 * Gallery of real homes, one per launch market, so the imagery mirrors haus's
 * "now in 5 countries" promise.
 */
export const HOME_GALLERY: HomePhoto[] = [
  { id: "1570129477492-45c003edd2be", alt: "Suburban house with a manicured garden", city: "London", flag: "🇬🇧" },
  { id: "1512917774080-9991f1c4c750", alt: "Large contemporary house with a pool", city: "Austin", flag: "🇺🇸" },
  { id: "1564013799919-ab600027ffc6", alt: "Modern home with warm evening lighting", city: "Berlin", flag: "🇩🇪" },
  { id: "1605276374104-dee2a0ed3cd6", alt: "Cozy two-storey family home", city: "Bengaluru", flag: "🇮🇳" },
  { id: "1580587771525-78b9dba3b914", alt: "Minimalist white house with clean lines", city: "Dubai", flag: "🇦🇪" },
  { id: "1600596542815-ffad4c1539a9", alt: "Welcoming home exterior with a green lawn", city: "Manchester", flag: "🇬🇧" },
];

/** A warm interior shot, handy for dashboards and auth screens. */
export const INTERIOR_PHOTO: HomePhoto = {
  id: "1600585154340-be6161a56a0c",
  alt: "A sunlit, comfortably furnished living room",
  city: "Inside your home",
  flag: "🛋️",
};
