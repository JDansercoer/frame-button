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
  sup: boolean;
};

const initialState = { sup: false };

const fakeAccount = new Account(
  dojoProvider.provider,
  process.env.NEXT_PUBLIC_MASTER_ADDRESS,
  process.env.NEXT_PUBLIC_MASTER_PRIVATE_KEY
);

const reducer: FrameReducer<State> = (state, action) => {
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

  if (frameMessage) {
    const { result: playerPress } = await dojoProvider.call(
      "button",
      "get_button_press",
      [frameMessage.requesterFid]
    );

    if (Number(playerPress[1])) {
      return (
        <FrameContainer
          postUrl="/frames"
          pathname="/"
          state={state}
          previousFrame={previousFrame}
        >
          <FrameImage
            aspectRatio="1:1"
            options={{
              width: 1146,
              height: 1146,
              fonts: [
                {
                  name: "Inter",
                  data: interReg,
                  weight: 400,
                  style: "normal",
                },
              ],
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "stretch",
                width: "100%",
                height: "100vh",
                backgroundColor: "black",
                color: "white",
              }}
            >
              <div tw="flex text-6xl flex-col py-0 px-12 text-[#49f627] w-full">
                <h1 tw="mb-0 text-center self-center">🙏</h1>
                <p tw="mb-0">You have already done your part.</p>
                <p tw="mt-auto">You may rest</p>
              </div>
            </div>
          </FrameImage>
        </FrameContainer>
      );
    }

    const pressTransaction = await dojoProvider.execute(
      fakeAccount,
      "button",
      "press",
      [frameMessage.requesterFid]
    );

    await fakeAccount.waitForTransaction(pressTransaction.transaction_hash, {
      retryInterval: 100,
    });

    const { result: pressResult } = await dojoProvider.call(
      "button",
      "get_button_press",
      [frameMessage.requesterFid]
    );

    return (
      <FrameContainer
        postUrl="/frames"
        pathname="/"
        state={state}
        previousFrame={previousFrame}
      >
        <FrameImage
          aspectRatio="1:1"
          options={{
            width: 1146,
            height: 1146,
            fonts: [
              {
                name: "Inter",
                data: interReg,
                weight: 400,
                style: "normal",
              },
            ],
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "stretch",
              width: "100%",
              height: "100vh",
              backgroundColor: "black",
              color: "white",
            }}
          >
            <div tw="flex text-6xl flex-col py-0 px-12 text-[#49f627]">
              <h1 tw="mb-0 text-center self-center">🙏</h1>
              <p tw="mb-0">The world thanks you.</p>
              <p tw="mb-0">
                You pressed the button with{" "}
                {secondsToCountdownString(Number(pressResult[2]))} remaining.
              </p>
              <p tw="mt-auto">You rock</p>
            </div>
          </div>
        </FrameImage>
      </FrameContainer>
    );
  }

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
          <img
            src="http://localhost:3000/Button-Graphic.png"
            tw="mb-10 w-[400px] h-[272px]"
          />
          <div tw="flex flex-col">
            <p
              tw="mb-[-40] text-[60px] text-[#839671]"
              style={{ fontFamily: "NeueBit" }}
            >
              Welcome to...
            </p>
            <p tw="mb-0 text-[96px] text-[#23380F]">The Button Game</p>
          </div>
        </div>
      </FrameImage>
      <FrameButton onClick={dispatch}>PLAY</FrameButton>
    </FrameContainer>
  );
}
