import React from "react";

export default function FitSilhouette({ type, className }: { type: string; className?: string }) {
  const normType = type.toLowerCase();

  const renderDetails = () => (
    <>
      {/* Waistband */}
      <path d="M 22 15 L 78 15 L 77 22 L 23 22 Z" stroke="currentColor" strokeWidth="1.2" />
      {/* Button */}
      <circle cx="50" cy="18.5" r="1.5" stroke="currentColor" strokeWidth="1" fill="currentColor" />
      {/* Belt loops */}
      <rect x="26" y="15" width="2" height="7" fill="currentColor" stroke="none" />
      <rect x="36" y="15" width="2" height="7" fill="currentColor" stroke="none" />
      <rect x="62" y="15" width="2" height="7" fill="currentColor" stroke="none" />
      <rect x="72" y="15" width="2" height="7" fill="currentColor" stroke="none" />

      {/* Fly J-Stitch */}
      <path d="M 50 22 L 50 36 C 45 36, 45 42, 50 42" stroke="currentColor" strokeWidth="0.8" fill="none" strokeDasharray="1.5 1.5" />

      {/* Pockets */}
      <path d="M 23 22 C 26 29, 36 29, 36 22" stroke="currentColor" strokeWidth="0.8" fill="none" />
      <path d="M 77 22 C 74 29, 64 29, 64 22" stroke="currentColor" strokeWidth="0.8" fill="none" />

      {/* Coin pocket */}
      <path d="M 28 24 L 33 24 L 33 27 L 28 27 Z" stroke="currentColor" strokeWidth="0.6" fill="none" />
    </>
  );

  if (normType === "slim") {
    return (
      <svg viewBox="0 0 100 150" className={className} fill="none">
        {/* Legs outline */}
        <path
          d="M 23 22 C 17 32, 17 42, 18 48 Q 23 85 28 135 L 40 135 Q 38 85 45 48 C 47 48, 49 48, 50 48 C 51 48, 53 48, 55 48 Q 62 85 60 135 L 72 135 Q 77 85 82 48 C 83 42, 83 32, 77 22"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Stitching accents */}
        <path d="M 19 48 Q 24 85 29 135 M 81 48 Q 76 85 71 135" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4" />
        {renderDetails()}
        {/* Folds/Creases */}
        <path d="M 18 50 Q 22 52 26 49 M 82 50 Q 78 52 74 49 M 22 90 Q 25 92 28 89 M 78 90 Q 75 92 72 89" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      </svg>
    );
  }

  if (normType === "straight") {
    return (
      <svg viewBox="0 0 100 150" className={className} fill="none">
        {/* Legs outline */}
        <path
          d="M 23 22 C 17 32, 17 42, 18 48 Q 21 85 22 135 L 42 135 Q 40 85 45 48 C 47 48, 49 48, 50 48 C 51 48, 53 48, 55 48 Q 60 85 58 135 L 78 135 Q 79 85 82 48 C 83 42, 83 32, 77 22"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Stitching accents */}
        <path d="M 19 48 Q 22 85 23 135 M 81 48 Q 78 85 77 135" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4" />
        {renderDetails()}
        {/* Folds/Creases */}
        <path d="M 18 50 Q 22 52 27 50 M 82 50 Q 78 52 73 50 M 20 95 Q 24 97 29 94 M 80 95 Q 76 97 71 94" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      </svg>
    );
  }

  if (normType === "baggy") {
    return (
      <svg viewBox="0 0 100 150" className={className} fill="none">
        {/* Legs outline */}
        <path
          d="M 23 22 C 16 32, 12 42, 10 75 Q 12 110 16 138 C 21 142, 33 142, 38 138 Q 36 110 42 75 C 45 68, 48 55, 50 48 C 52 55, 55 68, 58 75 Q 64 110 62 138 C 67 142, 79 142, 84 138 Q 88 110 90 75 C 88 42, 84 32, 77 22"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Stitching accents */}
        <path d="M 11 75 Q 13 110 17 138 M 89 75 Q 87 110 83 138" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4" />
        {renderDetails()}
        {/* Baggy folds / Creases */}
        <path d="M 13 45 Q 22 49 32 45 M 87 45 Q 78 49 68 45" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
        <path d="M 11 65 Q 22 69 31 63 M 89 65 Q 78 69 69 63" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
        <path d="M 10 90 Q 22 95 33 88 M 90 90 Q 78 95 67 88" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
        <path d="M 12 115 Q 24 120 35 112 M 88 115 Q 76 120 65 112" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
        <path d="M 14 130 Q 23 133 33 128 M 86 130 Q 77 133 67 128" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
      </svg>
    );
  }

  if (normType === "bootcut") {
    return (
      <svg viewBox="0 0 100 150" className={className} fill="none">
        {/* Legs outline (fitted knee, flared hem) */}
        <path
          d="M 23 22 C 17 32, 17 42, 18 48 Q 26 90 18 135 L 42 135 Q 40 90 45 48 C 47 48, 49 48, 50 48 C 51 48, 53 48, 55 48 Q 60 90 58 135 L 82 135 Q 74 90 82 48 C 83 42, 83 32, 77 22"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Stitching accents */}
        <path d="M 19 48 Q 27 90 19 135 M 81 48 Q 73 90 81 135" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4" />
        {renderDetails()}
        {/* Folds/Creases */}
        <path d="M 18 50 Q 22 52 26 49 M 82 50 Q 78 52 74 49 M 25 90 Q 30 92 34 89 M 75 90 Q 70 92 66 89 M 22 120 Q 28 122 34 119 M 78 120 Q 72 122 66 119" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      </svg>
    );
  }

  if (normType === "ankle" || normType === "ankle fit") {
    return (
      <svg viewBox="0 0 100 150" className={className} fill="none">
        {/* Legs outline (cropped at y=116) */}
        <path
          d="M 23 22 C 17 32, 17 42, 18 48 Q 23 85 26 116 L 38 116 Q 37 85 45 48 C 47 48, 49 48, 50 48 C 51 48, 53 48, 55 48 Q 63 85 62 116 L 74 116 Q 77 85 82 48 C 83 42, 83 32, 77 22"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Stitching accents */}
        <path d="M 19 48 Q 24 85 27 116 M 81 48 Q 76 85 73 116" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4" />
        {renderDetails()}
        {/* Folds/Creases */}
        <path d="M 18 50 Q 22 52 26 49 M 82 50 Q 78 52 74 49 M 22 90 Q 25 92 28 89 M 78 90 Q 75 92 72 89" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />

        {/* Bare ankles + shoes underneath */}
        <line x1="30" y1="116" x2="30" y2="132" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
        <line x1="34" y1="116" x2="34" y2="132" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
        <line x1="66" y1="116" x2="66" y2="132" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
        <line x1="70" y1="116" x2="70" y2="132" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
        {/* Shoes */}
        <path d="M 27 132 C 26 138 31 142 37 142 M 63 132 C 62 138 67 142 73 142" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      </svg>
    );
  }

  if (normType === "comfort" || normType === "comfort fit") {
    return (
      <svg viewBox="0 0 100 150" className={className} fill="none">
        {/* Legs outline (Comfort fit) */}
        <path
          d="M 23 22 C 17 32, 16 42, 17 48 Q 20 85 20 135 L 42 135 Q 40 85 45 48 C 47 48, 49 48, 50 48 C 51 48, 53 48, 55 48 Q 60 85 58 135 L 80 135 Q 84 85 83 48 C 84 42, 83 32, 77 22"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Stitching accents */}
        <path d="M 18 48 Q 21 85 21 135 M 82 48 Q 79 85 79 135" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4" />
        {renderDetails()}
        {/* Creases */}
        <path d="M 17 50 Q 21 52 26 50 M 83 50 Q 79 52 74 50" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      </svg>
    );
  }

  return null;
}
