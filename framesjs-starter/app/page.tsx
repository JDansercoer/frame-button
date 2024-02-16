import { Account } from "starknet";
import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameReducer,
  NextServerPageProps,
  getFrameMessage,
  getPreviousFrame,
  useFramesReducer,
  validateActionSignature,
} from "frames.js/next/server";
import { DEBUG_HUB_OPTIONS } from "./debug/constants";
import {
  frameImageProps,
  frameboyWrapperClasses,
  secondsToCountdownString,
} from "./utils";
import { dojoProvider } from "./data";

type State = {
  screen: "home" | "overview" | "button";
};

const initialState: State = { screen: "home" };

const fakeAccount = new Account(
  dojoProvider.provider,
  process.env.NEXT_PUBLIC_MASTER_ADDRESS,
  process.env.NEXT_PUBLIC_MASTER_PRIVATE_KEY
);

const reducer: FrameReducer<State> = (state) => {
  if (state.screen === "home") {
    return { screen: "overview" };
  }

  if (state.screen === "overview") {
    return { screen: "button" };
  }

  if (state.screen === "button") {
    return { screen: "overview" };
  }

  return state;
};

// This is a react server component only
export default async function Home({ searchParams }: NextServerPageProps) {
  const previousFrame = getPreviousFrame<State>(searchParams);

  const frameMessage = await getFrameMessage(previousFrame.postBody, {
    ...DEBUG_HUB_OPTIONS,
  });

  await validateActionSignature(previousFrame.postBody, DEBUG_HUB_OPTIONS);

  const [state, dispatch] = useFramesReducer<State>(
    reducer,
    initialState,
    previousFrame
  );

  // if (frameMessage) {
  //   const { result: playerPress } = await dojoProvider.call(
  //     "button",
  //     "get_button_press",
  //     [frameMessage.requesterFid]
  //   );

  //   if (Number(playerPress[1])) {
  //     return (
  //       <FrameContainer
  //         postUrl="/frames"
  //         pathname="/"
  //         state={state}
  //         previousFrame={previousFrame}
  //       >
  //         <FrameImage
  //           aspectRatio="1:1"
  //           options={{
  //             width: 1146,
  //             height: 1146,
  //             fonts: [
  //               {
  //                 name: "Inter",
  //                 data: interReg,
  //                 weight: 400,
  //                 style: "normal",
  //               },
  //             ],
  //           }}
  //         >
  //           <div
  //             style={{
  //               display: "flex",
  //               flexDirection: "row",
  //               alignItems: "stretch",
  //               width: "100%",
  //               height: "100vh",
  //               backgroundColor: "black",
  //               color: "white",
  //             }}
  //           >
  //             <div tw="flex text-6xl flex-col py-0 px-12 text-[#49f627] w-full">
  //               <h1 tw="mb-0 text-center self-center">🙏</h1>
  //               <p tw="mb-0">You have already done your part.</p>
  //               <p tw="mt-auto">You may rest</p>
  //             </div>
  //           </div>
  //         </FrameImage>
  //       </FrameContainer>
  //     );
  //   }

  //   const pressTransaction = await dojoProvider.execute(
  //     fakeAccount,
  //     "button",
  //     "press",
  //     [frameMessage.requesterFid]
  //   );

  //   await fakeAccount.waitForTransaction(pressTransaction.transaction_hash, {
  //     retryInterval: 100,
  //   });

  //   const { result: pressResult } = await dojoProvider.call(
  //     "button",
  //     "get_button_press",
  //     [frameMessage.requesterFid]
  //   );

  //   return (
  //     <FrameContainer
  //       postUrl="/frames"
  //       pathname="/"
  //       state={state}
  //       previousFrame={previousFrame}
  //     >
  //       <FrameImage
  //         aspectRatio="1:1"
  //         options={{
  //           width: 1146,
  //           height: 1146,
  //           fonts: [
  //             {
  //               name: "Inter",
  //               data: interReg,
  //               weight: 400,
  //               style: "normal",
  //             },
  //           ],
  //         }}
  //       >
  //         <div
  //           style={{
  //             display: "flex",
  //             flexDirection: "row",
  //             alignItems: "stretch",
  //             width: "100%",
  //             height: "100vh",
  //             backgroundColor: "black",
  //             color: "white",
  //           }}
  //         >
  //           <div tw="flex text-6xl flex-col py-0 px-12 text-[#49f627]">
  //             <h1 tw="mb-0 text-center self-center">🙏</h1>
  //             <p tw="mb-0">The world thanks you.</p>
  //             <p tw="mb-0">
  //               You pressed the button with{" "}
  //               {secondsToCountdownString(Number(pressResult[2]))} remaining.
  //             </p>
  //             <p tw="mt-auto">You rock</p>
  //           </div>
  //         </div>
  //       </FrameImage>
  //     </FrameContainer>
  //   );
  // }

  return (
    <FrameContainer
      postUrl="/frames"
      pathname="/"
      state={state}
      previousFrame={previousFrame}
    >
      <FrameImage {...frameImageProps}>
        <img src="http://localhost:3000/Frame.png" tw="absolute inset-0" />
        <div tw={frameboyWrapperClasses}>
          {(() => {
            if (frameMessage) {
              return (
                <div tw="flex flex-col justify-center items-center">
                  <img
                    src="http://localhost:3000/Button-Graphic.png"
                    tw="mb-10 w-[400px] h-[272px]"
                  />
                  <div tw="flex flex-col">
                    <p tw="mb-[-40] text-[60px] text-[#839671]">
                      Welcome to...
                    </p>
                    <p
                      tw="mb-0 text-[96px] text-[#23380F]"
                      style={{ fontFamily: "VT323" }}
                    >
                      The Button Game
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div tw="flex flex-col justify-center items-center w-4/5">
                <span
                  tw="mb-16 text-[96px] text-[#23380F]"
                  style={{ fontFamily: "VT323" }}
                >
                  YOU ARE DONE.
                </span>
                <img
                  src="http://localhost:3000/Button-Graphic-Pressed.png"
                  tw="mb-16 w-[400px] h-[272px]"
                />
                <span tw="mb-6 text-[60px] text-[#839671] leading-[2] text-center">
                  You have already pressed the button and it cannot be
                  unpressed...
                </span>
              </div>
            );

            return (
              <div tw="flex flex-col justify-center items-center">
                <span
                  tw="mb-24 text-[96px] text-[#23380F]"
                  style={{ fontFamily: "VT323" }}
                >
                  DISASTER AVERTED!
                </span>
                <img
                  src="http://localhost:3000/Button-Graphic.png"
                  tw="mb-16 w-[400px] h-[272px]"
                />
                <span tw="mb-6 text-[60px] text-[#23380F]">
                  You pressed the button at...
                </span>
                <div tw="flex flex-col py-1 px-3 rounded-xl border-[#23380F] border-4">
                  <span
                    tw="text-[60px] text-[#23380F]"
                    style={{ fontFamily: "VT323" }}
                  >
                    14m 50s
                  </span>
                </div>
              </div>
            );

            return (
              <div tw="flex flex-col justify-center items-stretch w-full h-full">
                <div tw="flex flex-row justify-between mb-10">
                  <div tw="flex flex-col w-[70%]">
                    <span
                      tw="mb-12 text-[72px] text-[#23380F]"
                      style={{ fontFamily: "VT323" }}
                    >
                      PRESS THE BUTTON!!!
                    </span>
                    <span tw="mb-10 text-[56px] text-[#839671]">
                      If the countdown reaches zero there will be terrible
                      consequences! You only get one press. Use it wisely.
                    </span>
                    <span tw="text-[60px] text-[#23380F]">
                      Total Pressed: 13 times
                    </span>
                  </div>
                  <div tw="flex flex-col items-center">
                    <img
                      src="http://localhost:3000/Button-Graphic.png"
                      tw="mb-8 w-[200px] h-[136px]"
                    />
                    <div tw="flex flex-col py-2 px-6 bg-[#23380F] rounded-3xl">
                      <span
                        tw="text-[60px] text-[#E2F3D2]"
                        style={{ fontFamily: "VT323" }}
                      >
                        14m 50s
                      </span>
                    </div>
                  </div>
                </div>
                <div tw="flex flex-col border-[#23380F] border-4 w-full px-12 py-8 self-stretch rounded-xl mt-auto">
                  <div tw="flex flex-row text-[60px] text-[#23380F] mb-6">
                    <span tw="w-1/5">1.</span>
                    <span tw="mr-auto">RareSecond</span>
                    <span tw="w-1/5">Om 06s</span>
                  </div>
                  <div tw="flex flex-row text-[60px] text-[#23380F] mb-6">
                    <span tw="w-1/5">1.</span>
                    <span tw="mr-auto">RareSecond</span>
                    <span tw="w-1/5">Om 06s</span>
                  </div>
                  <div tw="flex flex-row text-[60px] text-[#23380F] mb-6">
                    <span tw="w-1/5">1.</span>
                    <span tw="mr-auto">RareSecond</span>
                    <span tw="w-1/5">Om 06s</span>
                  </div>
                  <div tw="flex flex-row text-[60px] text-[#23380F] mb-6">
                    <span tw="w-1/5">1.</span>
                    <span tw="mr-auto">RareSecond</span>
                    <span tw="w-1/5">Om 06s</span>
                  </div>
                  <div tw="flex flex-row text-[60px] text-[#23380F]">
                    <span tw="w-1/5">1.</span>
                    <span tw="mr-auto">RareSecond</span>
                    <span tw="w-1/5">Om 06s</span>
                  </div>
                  <div tw="h-1 w-full bg-[#C7D7B7] my-10" />
                  <div tw="flex flex-row text-[60px] text-[#839671]">
                    <span tw="w-1/5">-</span>
                    <span tw="mr-auto">RareSecond (you)</span>
                    <span tw="w-1/5">???</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </FrameImage>
      {(() => {
        if (state.screen === "home") {
          return <FrameButton onClick={dispatch}>PLAY</FrameButton>;
        }
        if (state.screen === "overview") {
          return <FrameButton onClick={dispatch}>PRESS</FrameButton>;
        }
        if (state.screen === "button") {
          return <FrameButton onClick={dispatch}>HOME</FrameButton>;
        }
      })()}
    </FrameContainer>
  );
}
