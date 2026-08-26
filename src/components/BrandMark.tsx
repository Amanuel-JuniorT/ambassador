type Props = {
  className?: string;
  alt?: string;
};

export function BrandMark({ className = "h-12 w-auto", alt = "Ambassador" }: Props) {
  return (
    <img
      src="/ambassador-logo.png"
      alt={alt}
      className={`object-contain object-left ${className}`}
    />
  );
}
