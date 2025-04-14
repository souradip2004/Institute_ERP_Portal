"use client";
import type { NextPage } from "next";
import { useCallback } from "react";
import Image from "next/image";

export type SuperAdminDashboardTeacherType = {
  onClose?: () => void;
};

const SuperAdminDashboardTeacher: NextPage<SuperAdminDashboardTeacherType> = ({
  onClose,
}) => {
  const onAccordionHeaderClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const element = event.target as HTMLElement;

      const accItem: HTMLElement =
        element.closest("[data-acc-item]") || element;
      const accContent = accItem.querySelector(
        "[data-acc-content]"
      ) as HTMLElement;
      const isOpen = accItem.hasAttribute("data-acc-open");
      const nextOuterSibling =
        accItem?.nextElementSibling ||
        (accItem?.parentElement?.nextElementSibling as HTMLElement);
      const prevOuterSibling =
        accItem?.previousElementSibling ||
        (accItem?.parentElement?.previousElementSibling as HTMLElement);
      const siblingContainerAccItem = accItem?.hasAttribute("data-acc-original")
        ? accItem?.nextElementSibling ||
          nextOuterSibling?.querySelector("[data-acc-item]") ||
          nextOuterSibling
        : accItem?.previousElementSibling ||
          prevOuterSibling?.querySelector("[data-acc-item]") ||
          prevOuterSibling;
      const siblingAccItem =
        (siblingContainerAccItem?.querySelector(
          "[data-acc-item]"
        ) as HTMLElement) || siblingContainerAccItem;

      if (!siblingAccItem) return;
      const originalDisplay = "flex";
      const siblingDisplay = "flex";

      const openClasses = ["grid-rows-[1fr]"];
      const closeClasses = ["pt-0", "pb-0", "mb-0", "mt-0", "grid-rows-[0fr]"];

      if (isOpen) {
        accContent?.classList.remove(...openClasses);
        accContent?.classList.add(...closeClasses);

        setTimeout(() => {
          if (accItem) {
            accItem.style.display = "none";
            siblingAccItem.style.display = siblingDisplay;
          }
        }, 100);
      } else {
        if (accItem) {
          accItem.style.display = "none";
          siblingAccItem.style.display = originalDisplay;
        }
        const siblingAccContent = siblingAccItem?.querySelector(
          "[data-acc-content]"
        ) as HTMLElement;
        setTimeout(() => {
          siblingAccContent?.classList.remove(...closeClasses);
          siblingAccContent?.classList.add(...openClasses);
        }, 1);
      }
    },
    []
  );

  return (
    <div className="w-full relative bg-white overflow-hidden flex flex-row items-start justify-start gap-10 leading-[normal] tracking-[normal] text-left text-xl text-darkslategray-200 font-inter mq800:gap-5 mq1350:flex-wrap">
      <div className="h-full shadow-[8px_0px_8px_rgba(0,_0,_0,_0.1)] bg-white overflow-hidden flex flex-col items-start justify-start pt-6 px-2 pb-[551px] box-border gap-[95px] max-w-[90%] mq450:gap-[47px] mq450:pb-[233px] mq450:box-border mq450:min-w-full mq800:pt-5 mq800:pb-[358px] mq800:box-border mq1350:flex-1">
        <div className="flex flex-row items-start justify-start py-0 px-[65px]">
          <Image
            className="w-[113.2px] relative max-h-full object-cover [mix-blend-mode:linear-burn]"
            loading="lazy"
            width={113}
            height={48}
            alt=""
            src="/abiv-logo-1@2x.png"
          />
        </div>
        <div className="flex-1 flex flex-col items-end justify-start max-w-full">
          <div className="h-[264px] flex flex-row items-start justify-end py-0 px-[30px] box-border max-w-full">
            <div className="self-stretch flex flex-col items-start justify-start py-0 pl-0 pr-[34px] gap-14 mq450:gap-7">
              <div className="flex flex-row items-center justify-start gap-4">
                <Image
                  className="w-6 relative max-h-full overflow-hidden shrink-0"
                  loading="lazy"
                  width={24}
                  height={24}
                  alt=""
                  src="/icbaselinepeople.svg"
                />
                <div className="relative whitespace-pre-wrap mq450:text-base">
                  Student Management
                </div>
              </div>
              <div className="flex flex-row items-start justify-start gap-4">
                <Image
                  className="w-6 relative max-h-full overflow-hidden shrink-0"
                  loading="lazy"
                  width={24}
                  height={24}
                  alt=""
                  src="/mdinotifications.svg"
                />
                <div className="relative mq450:text-base">Notifications</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start justify-start pt-0 pb-4 pl-[72px] pr-[71px] relative gap-14 mt-[-264px] mq450:gap-7 mq450:pl-5 mq450:pr-5 mq450:box-border">
            <div className="w-full h-14 absolute !m-[0] right-[0px] bottom-[0px] left-[0px] rounded-2xl bg-lightsteelblue overflow-hidden shrink-0" />
            <div className="flex flex-row items-center justify-start gap-[15px] z-[1]">
              <Image
                className="w-6 relative max-h-full overflow-hidden shrink-0"
                loading="lazy"
                width={24}
                height={24}
                alt=""
                src="/materialsymbolsdashboard.svg"
              />
              <div className="relative mq450:text-base">Class Management</div>
            </div>
            <div className="flex flex-row items-end justify-start gap-[15px] z-[2]">
              <Image
                className="h-5 w-[20.5px] relative"
                loading="lazy"
                width={21}
                height={20}
                alt=""
                src="/vector.svg"
              />
              <div className="relative mq450:text-base">Teacher Management</div>
            </div>
          </div>
        </div>
      </div>
      <section className="flex flex-col items-start justify-start pt-[34px] px-0 pb-0 box-border max-w-full text-left text-[26px] text-black font-helvetica mq1125:min-w-full mq1350:flex-1">
        <div className="self-stretch flex flex-col items-start justify-start gap-12 max-w-full mq800:gap-6">
          <div className="self-stretch flex flex-row items-start justify-start py-0 px-1 box-border max-w-full">
            <div className="flex-1 flex flex-col items-start justify-start gap-6 max-w-full">
              <div className="self-stretch h-[77px] flex flex-row items-start justify-start py-0 pl-1 pr-0 box-border max-w-full">
                <div className="flex-1 rounded-lg flex flex-row items-center justify-between py-2 px-0 box-border gap-5 max-w-full mq800:flex-wrap">
                  <div className="flex flex-col items-start justify-start gap-2">
                    <b className="self-stretch relative mq450:text-[21px]">
                      Super Admin Pannel,
                    </b>
                    <div className="self-stretch relative text-xl mq450:text-base">
                      John Mathew
                    </div>
                  </div>
                  <div className="flex flex-row items-center justify-start gap-6">
                    <button className="cursor-pointer border-gray-200 border-solid border-[1px] py-1.5 px-[15px] bg-[transparent] rounded-[37px] overflow-hidden flex flex-row items-center justify-start gap-2 hover:bg-darkslategray-500 hover:border-darkslategray-300 hover:border-solid hover:hover:border-[1px] hover:box-border">
                      <Image
                        className="h-[22.4px] w-[22.4px] relative"
                        width={22}
                        height={22}
                        alt=""
                        src="/group.svg"
                      />
                      <div className="relative text-lg font-medium font-inter text-gray-100 text-left">{`600 Credits `}</div>
                    </button>
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
              <div className="self-stretch flex flex-row items-end justify-between py-0 pl-0 pr-1 box-border gap-5 max-w-full text-[24px] mq1125:flex-wrap">
                <div className="flex flex-col items-start justify-end pt-0 px-0 pb-2.5 box-border min-w-[267.2px] mq1125:flex-1">
                  <div className="flex flex-col items-start justify-start gap-10 mq450:gap-5">
                    <button className="cursor-pointer border-gray-300 border-solid border-[1px] py-1.5 px-[23px] bg-[transparent] h-[41px] rounded-lg box-border overflow-hidden shrink-0 flex flex-row items-center justify-center gap-4 z-[2] hover:bg-darkslategray-500 hover:border-darkslategray-400 hover:border-solid hover:hover:border-[1px] hover:box-border">
                      <b className="relative text-3xl font-helvetica text-indigo text-left">
                        Add New Teacher
                      </b>
                      <Image
                        className="w-[19.2px] relative max-h-full overflow-hidden shrink-0"
                        width={19}
                        height={19}
                        alt=""
                        src="/gridiconsadd.svg"
                      />
                    </button>
                    <div className="flex flex-row items-start justify-start py-0 px-3">
                      <b className="relative mq450:text-[19px]">
                        Teachers Details
                      </b>
                    </div>
                  </div>
                </div>
                <div className="w-[513.8px] flex flex-row items-start justify-start gap-[23.8px] max-w-full text-lg text-darkslategray-100 font-inter mq450:flex-wrap">
                  <div className="flex-1 rounded-12xl bg-white border-gray-400 border-solid border-[1px] box-border overflow-hidden flex flex-row items-start justify-between py-0.5 pl-6 pr-[22px] gap-5 min-w-[84px] min-h-[32px]">
                    <input
                      className="w-[60px] [border:none] [outline:none] font-inter text-lg bg-[transparent] relative text-darkslategray-100 text-left inline-block p-0"
                      placeholder="Search "
                      type="text"
                    />
                    <Image
                      className="w-6 relative max-h-full overflow-hidden shrink-0"
                      width={24}
                      height={24}
                      alt=""
                      src="/materialsymbolssearchrounded.svg"
                    />
                  </div>
                  <div className="rounded-12xl bg-white border-gray-400 border-solid border-[1px] overflow-hidden flex flex-row items-start justify-start py-[3px] pl-4 pr-[13px] gap-[16.2px]">
                    <div className="relative">Sort By</div>
                    <div className="flex flex-col items-start justify-start pt-[7.4px] px-0 pb-0">
                      <Image
                        className="w-[12.8px] h-[7.2px] relative"
                        width={13}
                        height={7}
                        alt=""
                        src="/vector-1.svg"
                      />
                    </div>
                  </div>
                  <div className="h-[34px] rounded-12xl bg-white border-gray-400 border-solid border-[1px] box-border overflow-hidden flex flex-row items-start justify-start py-[3px] pl-[15px] pr-3.5 gap-[25px]">
                    <div className="flex flex-col items-start justify-start pt-px px-0 pb-0">
                      <div className="relative">Filter</div>
                    </div>
                    <Image
                      className="w-6 relative max-h-full overflow-hidden shrink-0"
                      loading="lazy"
                      width={24}
                      height={24}
                      alt=""
                      src="/stashfiltersolid.svg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="self-stretch flex flex-col items-start justify-start pt-0 px-0 pb-px gap-4 text-xl font-inter"
            data-acc-group
          >
            <div className="w-[1006px] h-[226.2px] flex flex-col items-start justify-start pt-0 px-0 pb-[5.2px] box-border gap-4">
              <div className="w-[1006px] h-7 flex flex-row items-start justify-end py-0 px-[63px] box-border text-3xl text-cornflowerblue">
                <div className="h-7 flex flex-row items-start justify-start gap-[132px]">
                  <div className="h-7 w-[68.4px] flex flex-col items-start justify-start py-0 pl-0 pr-1.5 box-border">
                    <div className="w-[62px] relative font-medium inline-block mq450:text-lg">
                      Name
                    </div>
                  </div>
                  <div className="w-[152px] relative font-medium inline-block shrink-0 mq450:text-lg">
                    Attendance %
                  </div>
                  <div className="w-[109px] relative font-medium inline-block shrink-0 mq450:text-lg">
                    Feedback
                  </div>
                  <div className="w-[143px] relative font-medium inline-block shrink-0 mq450:text-lg">
                    Total Classes
                  </div>
                </div>
              </div>
              <div className="w-[1006px] h-px flex flex-row items-start justify-start py-0 pl-px pr-0 box-border">
                <div className="h-px w-[1006px] relative border-black border-solid border-t-[1px] box-border opacity-[0.1]" />
              </div>
              <div
                className="h-[54px] flex flex-row items-start justify-start py-0 px-2 box-border [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] cursor-pointer"
                data-acc-item
                data-acc-header
                data-acc-original
                onClick={onAccordionHeaderClick}
              >
                <div className="h-[54px] w-[956.3px] flex flex-row items-start justify-start gap-28">
                  <div className="h-[35.5px] w-[197px] flex flex-col items-start justify-start pt-[4.9px] px-0 pb-0 box-border">
                    <div className="w-[197px] h-[30.6px] flex flex-row items-start justify-start gap-[18.4px]">
                      <Image
                        className="w-[30.6px] relative rounded-[50%] max-h-full object-cover shrink-0"
                        loading="lazy"
                        width={31}
                        height={31}
                        alt=""
                        src="/ellipse-272@2x.png"
                      />
                      <div className="h-[27.1px] w-[148px] flex flex-col items-start justify-start pt-[3.1px] px-0 pb-0 box-border">
                        <div className="w-[148px] relative font-medium inline-block shrink-0 mq450:text-base">
                          Kristin Watson
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-[54px] w-[647.3px] flex flex-col items-start justify-start">
                    <div className="w-[647.3px] h-8 flex flex-row items-start justify-start">
                      <div className="h-8 w-[647.3px] flex flex-col items-start justify-start pt-2 px-0 pb-0 box-border">
                        <div className="w-[647.3px] h-6 flex flex-row items-start justify-start gap-[494.9px]">
                          <div className="w-[46px] relative font-medium inline-block shrink-0 mq450:text-base">
                            89%
                          </div>
                          <div className="h-6 w-[106.4px] flex flex-row items-start justify-start gap-[69.5px]">
                            <div className="w-[13px] relative font-medium inline-block shrink-0 mq450:text-base">
                              6
                            </div>
                            <Image
                              className="w-[23.9px] relative max-h-full overflow-hidden shrink-0"
                              loading="lazy"
                              width={24}
                              height={24}
                              alt=""
                              src="/mdiexport.svg"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="w-[159px] relative text-lg inline-block shrink-0 ml-[-430.3px]">
                        <span className="font-medium whitespace-pre-wrap">{`Physics   `}</span>
                        <span>(4.5/10)</span>
                      </div>
                    </div>
                    <div className="h-[22px] flex flex-row items-start justify-start py-0 px-[217px] box-border text-lg">
                      <div className="w-[159px] relative inline-block shrink-0">
                        <span className="font-medium whitespace-pre-wrap">{`Chemistry   `}</span>
                        <span>(7/10)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="w-[1005px] h-[71.8px] hidden flex-col items-start justify-start pt-0 px-0 pb-1 box-border gap-[7px] [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] cursor-pointer"
                data-acc-item
                data-acc-open
                data-acc-header
                onClick={onAccordionHeaderClick}
              >
                <div className="h-[58.8px] flex flex-row items-start justify-start py-0 px-2 box-border">
                  <div className="h-[58.8px] flex flex-row items-start justify-start gap-[133.4px]">
                    <div className="h-[30.6px] w-[175.7px] flex flex-row items-start justify-start gap-[18.1px]">
                      <Image
                        className="w-[30.6px] relative rounded-[50%] max-h-full object-cover shrink-0"
                        loading="lazy"
                        width={31}
                        height={31}
                        alt=""
                        src="/ellipse-274@2x.png"
                      />
                      <div className="h-[26.8px] w-[127px] flex flex-col items-start justify-start pt-[2.8px] px-0 pb-0 box-border">
                        <div className="w-[148px] relative font-medium inline-block shrink-0 mq450:text-base">
                          Kristin Watson
                        </div>
                      </div>
                    </div>
                    <div className="h-[58.8px] w-[643.5px] flex flex-col items-start justify-start pt-[2.8px] px-0 pb-0 box-border">
                      <div className="w-[643.5px] h-14 flex flex-col items-start justify-start gap-2.5">
                        <div className="w-[643.5px] h-6 flex flex-row items-start justify-start gap-[72.5px]">
                          <div className="h-6 w-[144.1px] flex flex-col items-start justify-start py-0 pl-0 pr-5 box-border">
                            <div className="w-11 relative font-medium inline-block mq450:text-base">
                              79%
                            </div>
                          </div>
                          <div className="h-6 w-[251.4px] flex flex-col items-start justify-start pt-0.5 pb-0 pl-0 pr-5 box-border text-lg">
                            <div className="w-[159px] relative inline-block">
                              <span className="font-medium whitespace-pre-wrap">{`Physics   `}</span>
                              <span>(4.5/10)</span>
                            </div>
                          </div>
                          <div className="w-[13px] relative font-medium inline-block shrink-0 mq450:text-base">
                            2
                          </div>
                          <div className="h-[18.8px] w-[17.5px] flex flex-col items-start justify-start pt-1.5 px-0 pb-0 box-border">
                            <Image
                              className="w-[17.5px] h-[12.8px] relative"
                              loading="lazy"
                              width={18}
                              height={13}
                              alt=""
                              src="/vector-3.svg"
                            />
                          </div>
                        </div>
                        <div
                          className="grid grid-rows-[0fr] [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] text-lg accordion__open:grid-rows-[1fr] accordion__close:grid-rows-[0fr]"
                          data-acc-content
                        >
                          <div className="[transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] overflow-hidden">
                            <div className="h-[22px] flex flex-row items-start justify-start py-0 px-[216px] box-border">
                              <div className="w-[159px] relative inline-block shrink-0">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit. Suspendisse malesuada lacus ex,
                                sit amet blandit leo lobortis eget.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-[1006px] h-px relative border-black border-solid border-t-[1px] box-border opacity-[0.1]" />
                <div className="relative text-[transparent] hidden" />
                <div className="absolute w-0 h-0" />
              </div>
              <div className="w-[1006px] h-1.5 flex flex-row items-start justify-start pt-0 pb-[5px] pl-px pr-0 box-border">
                <div className="h-px w-[1006px] relative border-black border-solid border-t-[1px] box-border opacity-[0.1]" />
              </div>
              <div
                className="h-[67px] flex flex-col items-start justify-start pt-0 pb-px pl-0 pr-px box-border gap-3 [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] cursor-pointer"
                data-acc-item
                data-acc-header
                data-acc-original
                onClick={onAccordionHeaderClick}
              >
                <div className="h-[54px] flex flex-row items-start justify-start py-0 px-2 box-border">
                  <div className="h-[54px] flex flex-row items-start justify-start gap-[95px]">
                    <div className="h-[30.6px] w-[213.9px] flex flex-row items-start justify-start gap-[18.3px]">
                      <Image
                        className="w-[30.6px] relative rounded-[50%] max-h-full object-cover shrink-0"
                        loading="lazy"
                        width={31}
                        height={31}
                        alt=""
                        src="/ellipse-273@2x.png"
                      />
                      <div className="h-[26.9px] w-[165px] flex flex-col items-start justify-start pt-[2.9px] px-0 pb-0 box-border">
                        <div className="w-[165px] relative font-medium inline-block shrink-0 mq450:text-base">
                          Ronald Richards
                        </div>
                      </div>
                    </div>
                    <div className="h-[54px] w-[643.9px] flex flex-col items-start justify-start gap-[5px]">
                      <div className="w-[643.9px] h-[27px] flex flex-row items-start justify-start">
                        <div className="h-[27px] w-[643.9px] flex flex-col items-start justify-start pt-[3px] px-0 pb-0 box-border">
                          <div className="w-[643.9px] h-6 flex flex-row items-start justify-start gap-[496.9px]">
                            <div className="w-11 relative font-medium inline-block shrink-0 mq450:text-base">
                              67%
                            </div>
                            <div className="h-6 w-[103px] flex flex-row items-start justify-start gap-[72.5px]">
                              <div className="w-[13px] relative font-medium inline-block shrink-0 mq450:text-base">
                                5
                              </div>
                              <div className="h-[18.8px] w-[17.5px] flex flex-col items-start justify-start pt-1.5 px-0 pb-0 box-border">
                                <Image
                                  className="w-[17.5px] h-[12.8px] relative"
                                  loading="lazy"
                                  width={18}
                                  height={13}
                                  alt=""
                                  src="/vector-2.svg"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="w-[159px] relative text-lg inline-block shrink-0 ml-[-426.9px]">
                          <span className="font-medium whitespace-pre-wrap">{`Physics   `}</span>
                          <span>(4.5/10)</span>
                        </div>
                      </div>
                      <div className="h-[22px] flex flex-row items-start justify-start py-0 px-[217px] box-border text-lg">
                        <div className="w-[159px] relative inline-block shrink-0">
                          <span className="font-medium whitespace-pre-wrap">{`Chemistry   `}</span>
                          <span>(7/10)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-[1006px] h-px relative border-black border-solid border-t-[1px] box-border opacity-[0.1]" />
              </div>
              <div
                className="w-[1005px] h-[71.8px] hidden flex-col items-start justify-start pt-0 px-0 pb-1 box-border gap-[7px] [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] cursor-pointer"
                data-acc-item
                data-acc-open
                data-acc-header
                onClick={onAccordionHeaderClick}
              >
                <div className="h-[58.8px] flex flex-row items-start justify-start py-0 px-2 box-border">
                  <div className="h-[58.8px] flex flex-row items-start justify-start gap-[133.4px]">
                    <div className="h-[30.6px] w-[175.7px] flex flex-row items-start justify-start gap-[18.1px]">
                      <Image
                        className="w-[30.6px] relative rounded-[50%] max-h-full object-cover shrink-0"
                        loading="lazy"
                        width={31}
                        height={31}
                        alt=""
                        src="/ellipse-274@2x.png"
                      />
                      <div className="h-[26.8px] w-[127px] flex flex-col items-start justify-start pt-[2.8px] px-0 pb-0 box-border">
                        <div className="w-[165px] relative font-medium inline-block shrink-0 mq450:text-base">
                          Ronald Richards
                        </div>
                      </div>
                    </div>
                    <div className="h-[58.8px] w-[643.5px] flex flex-col items-start justify-start pt-[2.8px] px-0 pb-0 box-border">
                      <div className="w-[643.5px] h-14 flex flex-col items-start justify-start gap-2.5">
                        <div className="w-[643.5px] h-6 flex flex-row items-start justify-start gap-[72.5px]">
                          <div className="h-6 w-[144.1px] flex flex-col items-start justify-start py-0 pl-0 pr-5 box-border">
                            <div className="w-11 relative font-medium inline-block mq450:text-base">
                              79%
                            </div>
                          </div>
                          <div className="h-6 w-[251.4px] flex flex-col items-start justify-start pt-0.5 pb-0 pl-0 pr-5 box-border text-lg">
                            <div className="w-[159px] relative inline-block">
                              <span className="font-medium whitespace-pre-wrap">{`Physics   `}</span>
                              <span>(4.5/10)</span>
                            </div>
                          </div>
                          <div className="w-[13px] relative font-medium inline-block shrink-0 mq450:text-base">
                            2
                          </div>
                          <div className="h-[18.8px] w-[17.5px] flex flex-col items-start justify-start pt-1.5 px-0 pb-0 box-border">
                            <Image
                              className="w-[17.5px] h-[12.8px] relative"
                              loading="lazy"
                              width={18}
                              height={13}
                              alt=""
                              src="/vector-3.svg"
                            />
                          </div>
                        </div>
                        <div
                          className="grid grid-rows-[0fr] [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] text-lg accordion__open:grid-rows-[1fr] accordion__close:grid-rows-[0fr]"
                          data-acc-content
                        >
                          <div className="[transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] overflow-hidden">
                            <div className="h-[22px] flex flex-row items-start justify-start py-0 px-[216px] box-border">
                              <div className="w-[159px] relative inline-block shrink-0">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit. Suspendisse malesuada lacus ex,
                                sit amet blandit leo lobortis eget.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-[1006px] h-px relative border-black border-solid border-t-[1px] box-border opacity-[0.1]" />
                <div className="relative text-[transparent] hidden" />
                <div className="absolute w-0 h-0" />
              </div>
            </div>
            <div
              className="w-[1005px] h-[71.8px] flex flex-col items-start justify-start pt-0 px-0 pb-1 box-border gap-[7px] [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] cursor-pointer"
              data-acc-item
              data-acc-open
              data-acc-header
              data-acc-original
              data-acc-default-open
              onClick={onAccordionHeaderClick}
            >
              <div className="h-[58.8px] flex flex-row items-start justify-start py-0 px-2 box-border">
                <div className="h-[58.8px] flex flex-row items-start justify-start gap-[133.4px]">
                  <div className="h-[30.6px] w-[175.7px] flex flex-row items-start justify-start gap-[18.1px]">
                    <Image
                      className="w-[30.6px] relative rounded-[50%] max-h-full object-cover shrink-0"
                      loading="lazy"
                      width={31}
                      height={31}
                      alt=""
                      src="/ellipse-274@2x.png"
                    />
                    <div className="h-[26.8px] w-[127px] flex flex-col items-start justify-start pt-[2.8px] px-0 pb-0 box-border">
                      <div className="w-[127px] relative font-medium inline-block shrink-0 mq450:text-base">
                        Jane Cooper
                      </div>
                    </div>
                  </div>
                  <div className="h-[58.8px] w-[643.5px] flex flex-col items-start justify-start pt-[2.8px] px-0 pb-0 box-border">
                    <div className="w-[643.5px] h-14 flex flex-col items-start justify-start gap-2.5">
                      <div className="w-[643.5px] h-6 flex flex-row items-start justify-start gap-[72.5px]">
                        <div className="h-6 w-[144.1px] flex flex-col items-start justify-start py-0 pl-0 pr-5 box-border">
                          <div className="w-11 relative font-medium inline-block mq450:text-base">
                            79%
                          </div>
                        </div>
                        <div className="h-6 w-[251.4px] flex flex-col items-start justify-start pt-0.5 pb-0 pl-0 pr-5 box-border text-lg">
                          <div className="w-[159px] relative inline-block">
                            <span className="font-medium whitespace-pre-wrap">{`Physics   `}</span>
                            <span>(4.5/10)</span>
                          </div>
                        </div>
                        <div className="w-[13px] relative font-medium inline-block shrink-0 mq450:text-base">
                          2
                        </div>
                        <div className="h-[18.8px] w-[17.5px] flex flex-col items-start justify-start pt-1.5 px-0 pb-0 box-border">
                          <Image
                            className="w-[17.5px] h-[12.8px] relative"
                            loading="lazy"
                            width={18}
                            height={13}
                            alt=""
                            src="/vector-3.svg"
                          />
                        </div>
                      </div>
                      <div
                        className="grid grid-rows-[1fr] [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] text-lg accordion__open:grid-rows-[1fr] accordion__close:grid-rows-[0fr]"
                        data-acc-content
                      >
                        <div className="[transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] overflow-hidden">
                          <div className="h-[22px] flex flex-row items-start justify-start py-0 px-[216px] box-border">
                            <div className="w-[159px] relative inline-block shrink-0">
                              <span className="font-medium whitespace-pre-wrap">{`Chemistry   `}</span>
                              <span>(7/10)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-[1006px] h-px relative border-black border-solid border-t-[1px] box-border opacity-[0.1]" />
            </div>
            <div
              className="h-[67px] hidden flex-col items-start justify-start pt-0 pb-px pl-0 pr-px box-border gap-3 [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] cursor-pointer"
              data-acc-item
              data-acc-header
              onClick={onAccordionHeaderClick}
            >
              <div className="h-[54px] flex flex-row items-start justify-start py-0 px-2 box-border">
                <div className="h-[54px] flex flex-row items-start justify-start gap-[95px]">
                  <div className="h-[30.6px] w-[213.9px] flex flex-row items-start justify-start gap-[18.3px]">
                    <Image
                      className="w-[30.6px] relative rounded-[50%] max-h-full object-cover shrink-0"
                      loading="lazy"
                      width={31}
                      height={31}
                      alt=""
                      src="/ellipse-273@2x.png"
                    />
                    <div className="h-[26.9px] w-[165px] flex flex-col items-start justify-start pt-[2.9px] px-0 pb-0 box-border">
                      <div className="w-[127px] relative font-medium inline-block shrink-0 mq450:text-base">
                        Jane Cooper
                      </div>
                    </div>
                  </div>
                  <div className="h-[54px] w-[643.9px] flex flex-col items-start justify-start gap-[5px]">
                    <div className="w-[643.9px] h-[27px] flex flex-row items-start justify-start">
                      <div className="h-[27px] w-[643.9px] flex flex-col items-start justify-start pt-[3px] px-0 pb-0 box-border">
                        <div className="w-[643.9px] h-6 flex flex-row items-start justify-start gap-[496.9px]">
                          <div className="w-11 relative font-medium inline-block shrink-0 mq450:text-base">
                            67%
                          </div>
                          <div className="h-6 w-[103px] flex flex-row items-start justify-start gap-[72.5px]">
                            <div className="w-[13px] relative font-medium inline-block shrink-0 mq450:text-base">
                              5
                            </div>
                            <div className="h-[18.8px] w-[17.5px] flex flex-col items-start justify-start pt-1.5 px-0 pb-0 box-border">
                              <Image
                                className="w-[17.5px] h-[12.8px] relative"
                                loading="lazy"
                                width={18}
                                height={13}
                                alt=""
                                src="/vector-2.svg"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-[159px] relative text-lg inline-block shrink-0 ml-[-426.9px]">
                        <span className="font-medium whitespace-pre-wrap">{`Physics   `}</span>
                        <span>(4.5/10)</span>
                      </div>
                    </div>
                    <div className="h-[22px] flex flex-row items-start justify-start py-0 px-[217px] box-border text-lg">
                      <div className="w-[159px] relative inline-block shrink-0">
                        <span className="font-medium whitespace-pre-wrap">{`Chemistry   `}</span>
                        <span>(7/10)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-[1006px] h-px relative border-black border-solid border-t-[1px] box-border opacity-[0.1]" />
              <div className="relative text-[transparent] hidden" />
              <div className="absolute w-0 h-0" />
            </div>
            <div
              className="w-[1006px] h-[67px] flex flex-row items-start justify-start py-0 pl-px pr-0 box-border [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] cursor-pointer"
              data-acc-item
              data-acc-header
              data-acc-original
              onClick={onAccordionHeaderClick}
            >
              <div className="h-[67px] w-[1005px] flex flex-col items-start justify-start pt-0 px-0 pb-px box-border gap-3">
                <div className="h-[54px] flex flex-row items-start justify-start py-0 px-[7px] box-border">
                  <div className="h-[54px] flex flex-row items-start justify-start gap-[80.4px]">
                    <div className="h-[30.6px] w-[228.6px] flex flex-row items-start justify-start gap-[18px]">
                      <Image
                        className="w-[30.6px] relative rounded-[50%] max-h-full object-cover shrink-0"
                        loading="lazy"
                        width={31}
                        height={31}
                        alt=""
                        src="/ellipse-275@2x.png"
                      />
                      <div className="h-[26.6px] w-[180px] flex flex-col items-start justify-start pt-[2.6px] px-0 pb-0 box-border">
                        <div className="w-[180px] relative font-medium inline-block shrink-0 mq450:text-base">
                          Brooklyn Simmons
                        </div>
                      </div>
                    </div>
                    <div className="h-[54px] w-[643.5px] flex flex-col items-start justify-start gap-[5px]">
                      <div className="w-[643.5px] h-[27px] flex flex-row items-start justify-start">
                        <div className="h-[27px] w-[643.5px] flex flex-col items-start justify-start pt-[3px] px-0 pb-0 box-border">
                          <div className="w-[643.5px] h-6 flex flex-row items-start justify-start gap-[495.5px]">
                            <div className="w-[45px] relative font-medium inline-block shrink-0 mq450:text-base">
                              82%
                            </div>
                            <div className="h-6 w-[103px] flex flex-row items-start justify-start gap-[72.5px]">
                              <div className="w-[13px] relative font-medium inline-block shrink-0 mq450:text-base">
                                6
                              </div>
                              <div className="h-[18.8px] w-[17.5px] flex flex-col items-start justify-start pt-1.5 px-0 pb-0 box-border">
                                <Image
                                  className="w-[17.5px] h-[12.8px] relative"
                                  loading="lazy"
                                  width={18}
                                  height={13}
                                  alt=""
                                  src="/vector-4.svg"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="w-[159px] relative text-lg inline-block shrink-0 ml-[-426.9px]">
                          <span className="font-medium whitespace-pre-wrap">{`Physics   `}</span>
                          <span>(4.5/10)</span>
                        </div>
                      </div>
                      <div className="h-[22px] flex flex-row items-start justify-start py-0 px-[216px] box-border text-lg">
                        <div className="w-[159px] relative inline-block shrink-0">
                          <span className="font-medium whitespace-pre-wrap">{`Chemistry   `}</span>
                          <span>(7/10)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-[1006px] h-px relative border-black border-solid border-t-[1px] box-border opacity-[0.1]" />
              </div>
            </div>
            <div
              className="w-[1005px] h-[71.8px] hidden flex-col items-start justify-start pt-0 px-0 pb-1 box-border gap-[7px] [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] cursor-pointer"
              data-acc-item
              data-acc-open
              data-acc-header
              onClick={onAccordionHeaderClick}
            >
              <div className="h-[58.8px] flex flex-row items-start justify-start py-0 px-2 box-border">
                <div className="h-[58.8px] flex flex-row items-start justify-start gap-[133.4px]">
                  <div className="h-[30.6px] w-[175.7px] flex flex-row items-start justify-start gap-[18.1px]">
                    <Image
                      className="w-[30.6px] relative rounded-[50%] max-h-full object-cover shrink-0"
                      loading="lazy"
                      width={31}
                      height={31}
                      alt=""
                      src="/ellipse-274@2x.png"
                    />
                    <div className="h-[26.8px] w-[127px] flex flex-col items-start justify-start pt-[2.8px] px-0 pb-0 box-border">
                      <div className="w-[180px] relative font-medium inline-block shrink-0 mq450:text-base">
                        Brooklyn Simmons
                      </div>
                    </div>
                  </div>
                  <div className="h-[58.8px] w-[643.5px] flex flex-col items-start justify-start pt-[2.8px] px-0 pb-0 box-border">
                    <div className="w-[643.5px] h-14 flex flex-col items-start justify-start gap-2.5">
                      <div className="w-[643.5px] h-6 flex flex-row items-start justify-start gap-[72.5px]">
                        <div className="h-6 w-[144.1px] flex flex-col items-start justify-start py-0 pl-0 pr-5 box-border">
                          <div className="w-11 relative font-medium inline-block mq450:text-base">
                            79%
                          </div>
                        </div>
                        <div className="h-6 w-[251.4px] flex flex-col items-start justify-start pt-0.5 pb-0 pl-0 pr-5 box-border text-lg">
                          <div className="w-[159px] relative inline-block">
                            <span className="font-medium whitespace-pre-wrap">{`Physics   `}</span>
                            <span>(4.5/10)</span>
                          </div>
                        </div>
                        <div className="w-[13px] relative font-medium inline-block shrink-0 mq450:text-base">
                          2
                        </div>
                        <div className="h-[18.8px] w-[17.5px] flex flex-col items-start justify-start pt-1.5 px-0 pb-0 box-border">
                          <Image
                            className="w-[17.5px] h-[12.8px] relative"
                            loading="lazy"
                            width={18}
                            height={13}
                            alt=""
                            src="/vector-3.svg"
                          />
                        </div>
                      </div>
                      <div
                        className="grid grid-rows-[0fr] [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] text-lg accordion__open:grid-rows-[1fr] accordion__close:grid-rows-[0fr]"
                        data-acc-content
                      >
                        <div className="[transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] overflow-hidden">
                          <div className="h-[22px] flex flex-row items-start justify-start py-0 px-[216px] box-border">
                            <div className="w-[159px] relative inline-block shrink-0">
                              Lorem ipsum dolor sit amet, consectetur adipiscing
                              elit. Suspendisse malesuada lacus ex, sit amet
                              blandit leo lobortis eget.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-[1006px] h-px relative border-black border-solid border-t-[1px] box-border opacity-[0.1]" />
              <div className="relative text-[transparent] hidden" />
              <div className="absolute w-0 h-0" />
            </div>
            <div
              className="w-[1005px] h-[77.7px] flex flex-col items-start justify-start pt-0 px-0 pb-[4.7px] box-border gap-[17px] [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] cursor-pointer"
              data-acc-item
              data-acc-header
              data-acc-original
              onClick={onAccordionHeaderClick}
            >
              <div className="h-[54px] flex flex-row items-start justify-start py-0 px-2 box-border">
                <div className="h-[54px] flex flex-row items-start justify-start py-0 pl-0 pr-px box-border gap-[133.4px]">
                  <div className="h-[36.1px] w-[175.4px] flex flex-col items-start justify-start pt-[5.5px] px-0 pb-0 box-border">
                    <div className="w-[175.4px] h-[30.6px] flex flex-row items-start justify-start gap-[17.8px]">
                      <Image
                        className="w-[30.6px] relative rounded-[50%] max-h-full object-cover shrink-0"
                        loading="lazy"
                        width={31}
                        height={31}
                        alt=""
                        src="/ellipse-276@2x.png"
                      />
                      <div className="h-[26.5px] w-[127px] flex flex-col items-start justify-start pt-[2.5px] px-0 pb-0 box-border">
                        <div className="w-[127px] relative font-medium inline-block shrink-0 mq450:text-base">
                          Albert Flores
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-[54px] w-[643.5px] flex flex-col items-start justify-start">
                    <div className="w-[643.5px] h-8 flex flex-row items-start justify-start">
                      <div className="h-8 w-[643.5px] flex flex-col items-start justify-start pt-2 px-0 pb-0 box-border">
                        <div className="w-[643.5px] h-6 flex flex-row items-start justify-start gap-[496.5px]">
                          <div className="w-11 relative font-medium inline-block shrink-0 mq450:text-base">
                            97%
                          </div>
                          <div className="h-6 w-[103px] flex flex-row items-start justify-start gap-[71.5px]">
                            <div className="w-3.5 relative font-medium inline-block shrink-0 mq450:text-base">
                              4
                            </div>
                            <div className="h-[18.8px] w-[17.5px] flex flex-col items-start justify-start pt-1.5 px-0 pb-0 box-border">
                              <Image
                                className="w-[17.5px] h-[12.8px] relative"
                                loading="lazy"
                                width={18}
                                height={13}
                                alt=""
                                src="/vector-5.svg"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-[159px] relative text-lg inline-block shrink-0 ml-[-426.9px]">
                        <span className="font-medium whitespace-pre-wrap">{`Physics   `}</span>
                        <span>(4.5/10)</span>
                      </div>
                    </div>
                    <div className="h-[22px] flex flex-row items-start justify-start py-0 px-[216px] box-border text-lg">
                      <div className="w-[159px] relative inline-block shrink-0">
                        <span className="font-medium whitespace-pre-wrap">{`Chemistry   `}</span>
                        <span>(7/10)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-[1006px] h-px relative border-black border-solid border-t-[1px] box-border opacity-[0.1]" />
            </div>
            <div
              className="w-[1005px] h-[71.8px] hidden flex-col items-start justify-start pt-0 px-0 pb-1 box-border gap-[7px] [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] cursor-pointer"
              data-acc-item
              data-acc-open
              data-acc-header
              onClick={onAccordionHeaderClick}
            >
              <div className="h-[58.8px] flex flex-row items-start justify-start py-0 px-2 box-border">
                <div className="h-[58.8px] flex flex-row items-start justify-start gap-[133.4px]">
                  <div className="h-[30.6px] w-[175.7px] flex flex-row items-start justify-start gap-[18.1px]">
                    <Image
                      className="w-[30.6px] relative rounded-[50%] max-h-full object-cover shrink-0"
                      loading="lazy"
                      width={31}
                      height={31}
                      alt=""
                      src="/ellipse-274@2x.png"
                    />
                    <div className="h-[26.8px] w-[127px] flex flex-col items-start justify-start pt-[2.8px] px-0 pb-0 box-border">
                      <div className="w-[127px] relative font-medium inline-block shrink-0 mq450:text-base">
                        Albert Flores
                      </div>
                    </div>
                  </div>
                  <div className="h-[58.8px] w-[643.5px] flex flex-col items-start justify-start pt-[2.8px] px-0 pb-0 box-border">
                    <div className="w-[643.5px] h-14 flex flex-col items-start justify-start gap-2.5">
                      <div className="w-[643.5px] h-6 flex flex-row items-start justify-start gap-[72.5px]">
                        <div className="h-6 w-[144.1px] flex flex-col items-start justify-start py-0 pl-0 pr-5 box-border">
                          <div className="w-11 relative font-medium inline-block mq450:text-base">
                            79%
                          </div>
                        </div>
                        <div className="h-6 w-[251.4px] flex flex-col items-start justify-start pt-0.5 pb-0 pl-0 pr-5 box-border text-lg">
                          <div className="w-[159px] relative inline-block">
                            <span className="font-medium whitespace-pre-wrap">{`Physics   `}</span>
                            <span>(4.5/10)</span>
                          </div>
                        </div>
                        <div className="w-[13px] relative font-medium inline-block shrink-0 mq450:text-base">
                          2
                        </div>
                        <div className="h-[18.8px] w-[17.5px] flex flex-col items-start justify-start pt-1.5 px-0 pb-0 box-border">
                          <Image
                            className="w-[17.5px] h-[12.8px] relative"
                            loading="lazy"
                            width={18}
                            height={13}
                            alt=""
                            src="/vector-3.svg"
                          />
                        </div>
                      </div>
                      <div
                        className="grid grid-rows-[0fr] [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] text-lg accordion__open:grid-rows-[1fr] accordion__close:grid-rows-[0fr]"
                        data-acc-content
                      >
                        <div className="[transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] overflow-hidden">
                          <div className="h-[22px] flex flex-row items-start justify-start py-0 px-[216px] box-border">
                            <div className="w-[159px] relative inline-block shrink-0">
                              Lorem ipsum dolor sit amet, consectetur adipiscing
                              elit. Suspendisse malesuada lacus ex, sit amet
                              blandit leo lobortis eget.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-[1006px] h-px relative border-black border-solid border-t-[1px] box-border opacity-[0.1]" />
              <div className="relative text-[transparent] hidden" />
              <div className="absolute w-0 h-0" />
            </div>
            <div
              className="h-[49.3px] flex flex-row items-start justify-start pt-0 px-2 pb-1.5 box-border [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] cursor-pointer"
              data-acc-item
              data-acc-header
              data-acc-original
              onClick={onAccordionHeaderClick}
            >
              <div className="h-[43.3px] flex flex-row items-start justify-start py-0 pl-0 pr-px box-border gap-[122px]">
                <div className="h-[30.6px] w-[186.3px] flex flex-row items-start justify-start gap-[17.7px]">
                  <Image
                    className="w-[30.6px] relative rounded-[50%] max-h-full object-cover shrink-0"
                    loading="lazy"
                    width={31}
                    height={31}
                    alt=""
                    src="/ellipse-277@2x.png"
                  />
                  <div className="h-[26.3px] w-[138px] flex flex-col items-start justify-start pt-[2.3px] px-0 pb-0 box-border">
                    <div className="w-[138px] relative font-medium inline-block shrink-0 mq450:text-base">
                      Wade Warren
                    </div>
                  </div>
                </div>
                <div className="h-[43.3px] w-[643.9px] flex flex-col items-start justify-start pt-[2.3px] px-0 pb-0 box-border">
                  <div className="w-[643.9px] h-[41px] flex flex-col items-start justify-start">
                    <div className="w-[643.9px] h-6 flex flex-row items-start justify-start relative gap-[494.9px] shrink-0">
                      <div className="w-[46px] relative font-medium inline-block shrink-0 mq450:text-base">
                        88%
                      </div>
                      <div className="h-6 w-[103px] flex flex-row items-start justify-start gap-[75.6px]">
                        <div className="w-[9.9px] relative font-medium inline-block shrink-0 mq450:text-base">
                          1
                        </div>
                        <div className="h-[18.8px] w-[17.5px] flex flex-col items-start justify-start pt-1.5 px-0 pb-0 box-border">
                          <Image
                            className="w-[17.5px] h-[12.8px] relative"
                            loading="lazy"
                            width={18}
                            height={13}
                            alt=""
                            src="/vector-6.svg"
                          />
                        </div>
                      </div>
                      <div className="w-[159px] absolute !m-[0] top-[-13px] left-[217px] text-lg inline-block">
                        <span className="font-medium whitespace-pre-wrap">{`Physics   `}</span>
                        <span>(4.5/10)</span>
                      </div>
                    </div>
                    <div className="h-[22px] flex flex-row items-start justify-start py-0 px-[217px] box-border mt-[-5px] relative text-lg">
                      <div className="w-[159px] relative inline-block shrink-0">
                        <span className="font-medium whitespace-pre-wrap">{`Chemistry   `}</span>
                        <span>(7/10)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="w-[1005px] h-[71.8px] hidden flex-col items-start justify-start pt-0 px-0 pb-1 box-border gap-[7px] [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] cursor-pointer"
              data-acc-item
              data-acc-open
              data-acc-header
              onClick={onAccordionHeaderClick}
            >
              <div className="h-[58.8px] flex flex-row items-start justify-start py-0 px-2 box-border">
                <div className="h-[58.8px] flex flex-row items-start justify-start gap-[133.4px]">
                  <div className="h-[30.6px] w-[175.7px] flex flex-row items-start justify-start gap-[18.1px]">
                    <Image
                      className="w-[30.6px] relative rounded-[50%] max-h-full object-cover shrink-0"
                      loading="lazy"
                      width={31}
                      height={31}
                      alt=""
                      src="/ellipse-274@2x.png"
                    />
                    <div className="h-[26.8px] w-[127px] flex flex-col items-start justify-start pt-[2.8px] px-0 pb-0 box-border">
                      <div className="w-[138px] relative font-medium inline-block shrink-0 mq450:text-base">
                        Wade Warren
                      </div>
                    </div>
                  </div>
                  <div className="h-[58.8px] w-[643.5px] flex flex-col items-start justify-start pt-[2.8px] px-0 pb-0 box-border">
                    <div className="w-[643.5px] h-14 flex flex-col items-start justify-start gap-2.5">
                      <div className="w-[643.5px] h-6 flex flex-row items-start justify-start gap-[72.5px]">
                        <div className="h-6 w-[144.1px] flex flex-col items-start justify-start py-0 pl-0 pr-5 box-border">
                          <div className="w-11 relative font-medium inline-block mq450:text-base">
                            79%
                          </div>
                        </div>
                        <div className="h-6 w-[251.4px] flex flex-col items-start justify-start pt-0.5 pb-0 pl-0 pr-5 box-border text-lg">
                          <div className="w-[159px] relative inline-block">
                            <span className="font-medium whitespace-pre-wrap">{`Physics   `}</span>
                            <span>(4.5/10)</span>
                          </div>
                        </div>
                        <div className="w-[13px] relative font-medium inline-block shrink-0 mq450:text-base">
                          2
                        </div>
                        <div className="h-[18.8px] w-[17.5px] flex flex-col items-start justify-start pt-1.5 px-0 pb-0 box-border">
                          <Image
                            className="w-[17.5px] h-[12.8px] relative"
                            loading="lazy"
                            width={18}
                            height={13}
                            alt=""
                            src="/vector-3.svg"
                          />
                        </div>
                      </div>
                      <div
                        className="grid grid-rows-[0fr] [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] text-lg accordion__open:grid-rows-[1fr] accordion__close:grid-rows-[0fr]"
                        data-acc-content
                      >
                        <div className="[transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] overflow-hidden">
                          <div className="h-[22px] flex flex-row items-start justify-start py-0 px-[216px] box-border">
                            <div className="w-[159px] relative inline-block shrink-0">
                              Lorem ipsum dolor sit amet, consectetur adipiscing
                              elit. Suspendisse malesuada lacus ex, sit amet
                              blandit leo lobortis eget.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-[1006px] h-px relative border-black border-solid border-t-[1px] box-border opacity-[0.1]" />
              <div className="relative text-[transparent] hidden" />
              <div className="absolute w-0 h-0" />
            </div>
            <div className="w-[1006px] h-px flex flex-row items-start justify-start py-0 pl-px pr-0 box-border">
              <div className="h-px w-[1006px] relative border-black border-solid border-t-[1px] box-border opacity-[0.1]" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SuperAdminDashboardTeacher;
