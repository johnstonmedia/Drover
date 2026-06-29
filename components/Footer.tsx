import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-drover-dust/60 bg-drover-bone">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-drover-sage md:flex-row">
        <p>© {new Date().getFullYear()} Drover. All values in AUD.</p>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-drover-ink">
            Privacy Policy
          </Link>
          <Link href="/login" className="hover:text-drover-ink">
            Log in
          </Link>
        </div>
      </div>
    </footer>
  );
}
