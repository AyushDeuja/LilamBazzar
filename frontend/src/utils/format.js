/** Backend sends Prisma Decimals as strings — always coerce before math/format. */
export function money(value) {
  const num = Number(value ?? 0);
  return `Rs. ${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Reads a File into a base64 data-URI string (the format the API expects for images). */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

/** First product image URL or a neutral inline placeholder. */
export function productImage(product) {
  const url = product?.ProductImage?.[0]?.product_img;
  return url || PLACEHOLDER_IMG;
}

export const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#eef1f5"/>
      <g fill="none" stroke="#c3ccd9" stroke-width="8" stroke-linecap="round">
        <path d="M140 190 l50 -60 40 45 30 -30 40 45"/>
        <circle cx="160" cy="105" r="14"/>
      </g>
    </svg>`,
  );

/** Auction phase helper: 'upcoming' | 'live' | 'ended' */
export function auctionPhase(auction) {
  if (!auction) return null;
  const now = Date.now();
  if (new Date(auction.start_time).getTime() > now) return 'upcoming';
  if (new Date(auction.end_time).getTime() > now && auction.is_active) return 'live';
  return 'ended';
}

/** Minimum next valid bid for an auction. */
export function minNextBid(auction) {
  const current = Number(auction.current_price ?? auction.starting_price);
  return current + Number(auction.min_increment ?? 10);
}
