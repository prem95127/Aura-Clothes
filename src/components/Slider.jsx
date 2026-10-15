import { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import { testimonials } from "../data/products.js";
import SafeImg from "./SafeImg.jsx";

function calculateGap(width) {
  const minWidth = 1024;
  const maxWidth = 1456;
  const minGap = 60;
  const maxGap = 86;

  if (width <= minWidth) return minGap;
  if (width >= maxWidth) return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth));
  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth));
}

// Position of one image relative to the active one
function imageStyle(index, activeIndex, count, gap, height) {
  const maxStickUp = gap * 0.8;
  const stickUp = height ? (maxStickUp / height) * 100 : 0;
  const offset = (index - activeIndex + count) % count;

  let x, y, rotate, scale, opacity, z;
  if (offset === 0) {
    [x, y, rotate, scale, opacity, z] = [0, 0, 0, 1, 1, count];
  } else if (offset === 1) {
    [x, y, rotate, scale, opacity, z] = [20, -stickUp, -15, 0.85, 1, count - 1];
  } else if (offset === count - 1) {
    [x, y, rotate, scale, opacity, z] = [-20, -stickUp, 15, 0.85, 1, count - 1];
  } else {
    [x, y, rotate, scale, opacity, z] = [0, -stickUp, 0, 0.7, 0, 0];
  }

  return {
    zIndex: z,
    opacity,
    pointerEvents: opacity === 0 ? "none" : undefined,
    transform: `translate(${x}%, ${y}%) scale(${scale}) rotateY(${rotate}deg)`
  };
}

export default function Slider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [size, setSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);

  const count = testimonials.length;
  const current = testimonials[activeIndex];

  const go = useCallback(
    (direction) => setActiveIndex((i) => (i + direction + count) % count),
    [count]
  );

  // Measure the image area so the stacked images can be offset correctly
  useLayoutEffect(() => {
    const measure = () => {
      const el = containerRef.current;
      if (el) setSize({ width: el.offsetWidth, height: el.offsetHeight });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Auto-advance every 5 seconds until the visitor uses the arrows
  useEffect(() => {
    if (!autoplay) return undefined;
    const id = setInterval(() => go(1), 5000);
    return () => clearInterval(id);
  }, [autoplay, go]);

  const manual = (direction) => {
    setAutoplay(false);
    go(direction);
  };

  const gap = calculateGap(size.width);
  const words = current.quote.split(" ");

  return (
    <section className="slider">
      <div className="testimonial-container">
        <div className="testimonial-grid">
          <div className="image-container" id="image-container" ref={containerRef}>
            {testimonials.map((t, index) => (
              <SafeImg
                key={t.name}
                src={t.src}
                alt={t.name}
                className="testimonial-image"
                style={imageStyle(index, activeIndex, count, gap, size.height)}
              />
            ))}
          </div>

          <div className="testimonial-content">
            <div>
              <h3 className="name">{current.name}</h3>
              <p className="designation">{current.designation}</p>
              {/* key restarts the word animation each time the slide changes */}
              <p className="quote" key={activeIndex}>
                {words.map((word, i) => (
                  <span key={i}>
                    <span className="word" style={{ animationDelay: `${i * 20}ms` }}>{word}</span>
                    {i < words.length - 1 ? " " : ""}
                  </span>
                ))}
              </p>
            </div>

            <div className="arrow-buttons">
              <button type="button" className="arrow-button prev-button" aria-label="Previous"
                onClick={() => manual(-1)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
              </button>
              <button type="button" className="arrow-button next-button" aria-label="Next"
                onClick={() => manual(1)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
