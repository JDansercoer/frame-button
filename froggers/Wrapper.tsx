import { images } from "./utils/images";

export const Wrapper = ({ children }: { children: any }) => {
  return (
    <div tw="flex w-full h-full">
      <div tw="flex p-24 flex-col justify-center items-center w-full h-full bg-[#E2F3D2]">
        {children}
      </div>
      <img src={images.frame} tw="absolute inset-0" />
    </div>
  );
};
