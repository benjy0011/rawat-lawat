export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#c3c6d6] bg-[#f9f9ff]/95 px-3 py-2 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-sm justify-around">
        <span className="rounded-xl bg-[#0052cc] px-4 py-1.5 text-xs font-semibold text-[#c4d2ff]">
          Admissions
        </span>
        <span className="px-3 py-1.5 text-xs font-medium text-[#434654]">
          Policy vault
        </span>
        <span className="px-3 py-1.5 text-xs font-medium text-[#434654]">
          Account
        </span>
      </div>
    </nav>
  );
}
