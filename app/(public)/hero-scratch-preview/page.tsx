export default function HeroScratchPreview() {
  const heroLine1 = "Find your Perfect Stay";
  const heroLine2 = "Experience";
  return (
    <div className="m-3 md:m-5">
      <div
        className="relative overflow-hidden border border-white/5 rounded-xl"
        style={{ backgroundColor: "#0d1b2e", maxWidth: "1920px" }}
      >
        <div className="relative z-10 px-5 md:px-20 md:pt-10 2xl:pt-15 flex flex-col gap-2 md:gap-4 2xl:gap-8 text-center rounded-b-xl">
          <h1
            id="probe"
            className="text-white font-normal font-serif text-[28px] md:text-[36px] lg:text-[52px] 2xl:text-[72px]
            leading-[1.2] tracking-[-1px] mb-3 md:mb-0 lg:mb-3 whitespace-nowrap"
          >
            {`${heroLine1} ${heroLine2}`}
          </h1>
        </div>
      </div>
    </div>
  );
}
