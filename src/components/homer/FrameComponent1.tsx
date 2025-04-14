import type { NextPage } from "next";
import Image from "next/image";

export type FrameComponent1Type = {
  className?: string;
};

const FrameComponent1: NextPage<FrameComponent1Type> = ({ className = "" }) => {
  return (
    <header
      className={`self-stretch [backdrop-filter:blur(291.8px)] overflow-hidden flex flex-row items-start justify-center py-2 px-5 box-border max-w-full text-left text-xl text-black font-helvetica ${className}`}
    >
      <div className="w-[1304px] flex flex-row items-center justify-between gap-5 max-w-full">
        <Image
          className="w-[113.2px] relative max-h-full object-cover [mix-blend-mode:linear-burn]"
          loading="lazy"
          width={113}
          height={48}
          alt=""
          src="/abiv-logo-1@2x.png"
        />
        <div className="flex flex-row items-center justify-start gap-12 mq850:gap-6">
          <div className="flex flex-row items-center justify-start gap-10 mq450:gap-5 mq850:hidden">
            <div className="relative">Pricing</div>
            <div className="relative">Individual</div>
            <div className="relative">Contact Us</div>
          </div>
          <div className="flex flex-row items-center justify-start gap-6 text-lg text-white font-inter">
            <div className="rounded-53xl bg-plum flex flex-row items-center justify-start gap-2">
              <div className="w-[90px] rounded-81xl bg-indigo flex flex-row items-center justify-center py-1 px-3 box-border">
                <div className="relative font-medium">English</div>
              </div>
              <div className="w-[90px] rounded-81xl flex flex-row items-center justify-center py-1 px-3 box-border text-black">
                <div className="relative font-medium">Hindi</div>
              </div>
            </div>
            <div className="h-[30px] rounded-18xl bg-white border-black border-solid border-[1px] box-border overflow-hidden flex flex-row items-center justify-start py-0.5 pl-2 pr-3.5 gap-2 text-5xl text-black font-alumni-sans">
              <Image
                className="h-[22.4px] w-[22.4px] relative"
                loading="lazy"
                width={22}
                height={22}
                alt=""
                src="/group.svg"
              />
              <div className="relative font-medium">5</div>
            </div>
            <Image
              className="w-10 relative max-h-full overflow-hidden shrink-0"
              loading="lazy"
              width={40}
              height={40}
              alt=""
              src="/ixuserprofilefilled.svg"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default FrameComponent1;
