/** @jsxImportSource frog/jsx */

import { frame } from "../../../images";

export const Wrapper = ({ children }: { children: any }) => {
  return (
    <div tw="flex w-full h-full">
      <div tw="flex p-24 flex-col justify-center items-center w-full h-full bg-[#E2F3D2]">
        {children}
      </div>
      <img src={frame} tw="absolute inset-0" />
    </div>
  );
};
