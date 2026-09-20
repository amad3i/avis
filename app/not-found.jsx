import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center gap-4">
      <p className="font-black text-7xl text-primary-light">404</p>
      <h1 className="text-2xl font-black text-ink">Такой страницы нет</h1>
      <p className="text-subtle text-sm max-w-sm leading-6">
        Похоже, кариес протокола. Возвращайтесь к услугам — там всё на месте.
      </p>
      <Link
        href="/#menu"
        className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-full font-extrabold transition"
      >
        К услугам
      </Link>
    </div>
  );
}