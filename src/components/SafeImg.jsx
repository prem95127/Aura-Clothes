import { PLACEHOLDER_IMG } from "../utils/format.js";

// Shows a neutral placeholder instead of a broken icon when an image file is missing
export default function SafeImg({ src, alt, ...rest }) {
  return (
    <img
      src={src}
      alt={alt}
      onError={(e) => {
        if (!e.currentTarget.dataset.fallback) {
          e.currentTarget.dataset.fallback = "true";
          e.currentTarget.src = PLACEHOLDER_IMG;
        }
      }}
      {...rest}
    />
  );
}
