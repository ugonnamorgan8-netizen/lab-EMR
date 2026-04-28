import { cn } from "../../utils/cn";

const sizes = {
  sm: {
    frame: "h-12 w-12 border-[3px]",
    image: "h-8 w-8",
  },
  md: {
    frame: "h-16 w-16 border-4",
    image: "h-11 w-11",
  },
  lg: {
    frame: "h-24 w-24 border-[5px]",
    image: "h-16 w-16",
  },
} as const;

export function BrandLogo({
  src,
  alt,
  size = "md",
  className,
  imageClassName,
}: {
  src: string;
  alt: string;
  size?: keyof typeof sizes;
  className?: string;
  imageClassName?: string;
}) {
  const selected = sizes[size];

  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-full border-white/95 bg-white shadow-[0_18px_36px_rgba(7,24,48,0.22)]",
        selected.frame,
        className,
      )}
    >
      <img src={src} alt={alt} className={cn("object-contain", selected.image, imageClassName)} />
    </div>
  );
}
