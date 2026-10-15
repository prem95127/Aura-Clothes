export const formatPrice = (n) => `₹${n.toFixed(2)}`;

export const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="240" viewBox="0 0 360 240">' +
      '<rect width="360" height="240" fill="#e4e4e7"/>' +
      '<text x="180" y="125" font-family="Arial" font-size="16" fill="#52525B" text-anchor="middle">Image coming soon</text></svg>'
  );
