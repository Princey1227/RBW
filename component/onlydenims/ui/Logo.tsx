import React from "react";
import Image from "next/image";

interface LogoProps {
  size?: "large" | "small";
  forceInvert?: boolean;
  variant?: "dark" | "light" | "auto";
}

export default function Logo({ size = "large", forceInvert = false, variant }: LogoProps) {
  let logoFilterClass = "theme-logo-invert";
  if (variant === "dark") {
    logoFilterClass = "brightness-0";
  } else if (variant === "light") {
    logoFilterClass = "brightness-0 invert";
  } else if (forceInvert) {
    logoFilterClass = "max-xl:brightness-0 max-xl:invert xl:theme-logo-invert";
  }

  if (size === "small") {
    return (
      <div className="relative w-[190px] min-[375px]:w-[220px] sm:w-[240px] md:w-[250px] lg:w-[260px] xl:w-[280px] 2xl:w-[390px] h-[32px] sm:h-[36px] md:h-[38px] lg:h-[40px] xl:h-[44px] 2xl:h-[50px] select-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-full aspect-[3/2] -translate-x-1/2 -translate-y-1/2">
          <Image
            src="/OnlyDenims.png"
            alt="ONLY DENIMS"
            fill
            priority
            sizes="(max-width: 640px) 250px, (max-width: 1024px) 300px, 500px"
            className={`object-contain select-none pointer-events-none ${logoFilterClass}`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center select-none py-0 w-full">
      {/* 
        Container sized for 1536x1024 (3:2) image. Responsive on mobile to prevent overlapping items on scroll.
      */}
      <div className="relative w-[280px] sm:w-full sm:max-w-[900px] aspect-[3/2] -my-[58px] sm:-my-[180px] md:-my-[220px]">
        <Image
          src="/OnlyDenims.png"
          alt="ONLY DENIMS"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 900px"
          className={`object-contain select-none pointer-events-none ${forceInvert ? "max-xl:brightness-0 max-xl:invert xl:theme-logo-invert" : "theme-logo-invert"}`}
        />
      </div>
    </div>
  );
}
