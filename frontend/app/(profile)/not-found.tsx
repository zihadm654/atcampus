import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-bold text-6xl">404</h1>
      <Image
        alt="404"
        className="pointer-events-none mt-6 mb-5 dark:invert"
        height={400}
        src="/_static/illustrations/rocket-crashed.svg"
        width={400}
      />
      <p className="text-balance px-4 text-center font-medium text-2xl">
        Page not found. Back to{" "}
        <Link
          className="text-muted-foreground underline underline-offset-4 hover:text-purple-500"
          href="/"
        >
          Homepage
        </Link>
        .
      </p>
    </div>
  );
}
