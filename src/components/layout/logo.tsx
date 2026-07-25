import Image from "next/image";
import logo from "../../../images/Code_Generated_Image.png";

interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 32, className }: LogoMarkProps) {
  return (
    <Image
      src={logo}
      alt="logo"
      width={size}
      height={size}
      className={className}
    />
  );
}
