import type { NextPage } from "next";
import Image from "next/image";
import abivlog from "./abiv-logo-1.png"
import gptImage from "./chatgpt-image-apr-8-2025-07-13-32-PM-1-1.png"
import group2 from "./group-2.png"
import ixc from "./ix-user-profile-filled.png"
import group4 from "./group-4.png"
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
          src={abivlog}
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
              src={ixc}
            />
          </div>
        </div>
      </div>
    </header>
  );
};


const HeroSectionB2B: NextPage = () => {
  return (
    <div className="w-full relative bg-white overflow-hidden flex flex-col items-start justify-start pt-0 px-0 pb-[28.2px] box-border gap-[110px] leading-[normal] tracking-[normal] text-left text-[38.4px] text-black font-helvetica mq450:gap-[27px] mq850:gap-[55px]">
      <FrameComponent1 />
      <div className="w-[764.8px] h-[680px] relative hidden max-w-full">
        <Image
          className="absolute top-[63.3px] left-[282.7px] w-[482.2px] h-[482.2px] object-contain"
          width={482}
          height={482}
          alt=""
          src="/a-3d-rendered-study-lamp-with-books-underneath-illuminated-by-glowing-bioluminescent-deep-ultraviolet-hues-vivid-purples-high-contrast-natural-light-effects-and-a-vibrant-glow-1@2x.png"
        />
        <div className="absolute top-[0px] left-[98.64px] rounded-[50%] [background:linear-gradient(217.71deg,_#fff,_rgba(255,_255,_255,_0)_84.01%)] w-[654.4px] h-[576.6px] [transform:_rotate(9.8deg)] [transform-origin:0_0]" />
      </div>
      <div className="w-[848px] flex flex-row items-start justify-start py-0 px-[73px] box-border max-w-full mq850:pl-9 mq850:pr-9 mq850:box-border">
        <div className="flex-1 flex flex-col items-end justify-start gap-[68.2px] max-w-full mq450:gap-[17px] mq850:gap-[34px]">
          <div className="self-stretch flex flex-col items-start justify-start gap-[41.3px] shrink-0 max-w-full mq850:gap-[21px]">
            <div className="w-[550.2px] flex flex-row items-start justify-between flex-wrap content-start gap-5 shrink-0 max-w-full">
              <Image
                className="h-[67.7px] w-[61.4px] relative"
                loading="lazy"
                width={61}
                height={68}
                alt=""
                src="/group-48097284.svg"
              />
              <Image
                className="h-[58.2px] w-[51.2px] relative"
                width={51}
                height={58}
                alt=""
                src="/group-1.svg"
              />
            </div>
            <div className="self-stretch h-[512.8px] flex flex-row items-start justify-start py-0 pl-[31px] pr-0 box-border max-w-full">
              <div className="self-stretch flex-1 flex flex-col items-start justify-start relative gap-20 shrink-0 max-w-full mq450:gap-5 mq675:gap-10">
                <div className="self-stretch flex-1 flex flex-col items-start justify-start gap-10 z-[0] mq675:gap-5">
                  <div className="w-[496px] h-[227.8px] flex flex-col items-start justify-start pt-0 px-0 pb-2 box-border gap-4">
                    <div className="w-[104px] relative inline-block mq450:text-[23px] mq850:text-[31px]">
                      Smart
                    </div>
                    <div className="flex flex-col items-start justify-start gap-[33.8px] text-[86.4px] text-indigo mq675:gap-[17px]">
                      <b className="w-[496px] relative inline-block mq450:text-7xl mq850:text-[43px]">
                        Classrooms
                      </b>
                      <h1 className="m-0 w-80 relative text-[48px] inline-block text-black font-[inherit] mq450:text-[29px] mq850:text-[38px]">
                        <span>
                          <span>Smart</span>
                        </span>
                        <b className="text-indigo">
                          <span>{` `}</span>
                          <span>Futures</span>
                        </b>
                      </h1>
                    </div>
                  </div>
                  <div className="self-stretch relative text-xl font-inter opacity-[0.7] mq450:text-base">
                    AI Classroom is a smart, AI-powered learning platform that
                    turns notes into videos, solves doubts in real-time, tracks
                    exams, and connects students and teachers seamlessly—all in
                    one clean, modern dashboard.
                  </div>
                </div>
                <button className="cursor-pointer [border:none] py-4 px-[47px] bg-indigo rounded-lg flex flex-row items-center justify-center z-[1] hover:bg-slateblue mq450:pl-5 mq450:pr-5 mq450:box-border">
                  <b className="relative text-[32px] font-helvetica text-white text-left">
                    Get Started
                  </b>
                </button>
                <div className="w-[721px] h-[562px] absolute !m-[0] right-[-710px] bottom-[-84.2px]">
                  <Image
                    className="absolute top-[122px] left-[61px] w-[660px] h-[440px] object-cover"
                    loading="lazy"
                    width={660}
                    height={440}
                    alt=""
                    src={gptImage}
                  />
                  <Image
                    className="absolute top-[45px] left-[0px] w-[76px] h-[80.3px]"
                    width={76}
                    height={80}
                    alt=""
                    src={group2}
                  />
                  <Image
                    className="absolute top-[0px] left-[500px] w-[78.9px] h-[86.8px] object-contain"
                    width={79}
                    height={87}
                    alt=""
                    src="/group-3@2x.png"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="w-[409px] flex flex-row items-start justify-center py-0 px-5 box-border max-w-full">
            <Image
              className="h-[89.8px] w-[56.5px] relative shrink-0"
              width={57}
              height={90}
              alt=""
              src="/group-4.svg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSectionB2B;
