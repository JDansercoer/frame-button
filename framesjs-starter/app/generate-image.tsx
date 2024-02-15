import * as fs from "fs";
import { join } from "path";
import satori from "satori";

import { State } from "./page";
import { FrameActionDataParsedAndHubContext } from "frames.js";
import { GameData } from "./GameData";

const VT323 = join(process.cwd(), "public/VT323-Regular.ttf");
let interReg = fs.readFileSync(VT323);

function getImageDataUri(imageName: string): string {
  const imagePath = join(process.cwd(), `public/beasts/${imageName}.png`);
  const imageBuffer = fs.readFileSync(imagePath);
  return `data:image/png;base64,${imageBuffer.toString("base64")}`;
}

export async function generateImage(
  validMessage: FrameActionDataParsedAndHubContext,
  state: State,
  beast: string[],
  player: string[]
) {
  console.log(beast, player);
  const gameData = new GameData();

  const timeUntilNextMove = new Date(
    parseInt(player[1] || "") * 1000 + 60 * 1000 * 15
  );

  const formatTime =
    timeUntilNextMove < new Date()
      ? ""
      : "Cool Down Until: " +
        timeUntilNextMove.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        });

  const imageSvg = await satori(
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        width: "100%",
        height: "100vh",
        backgroundColor: "black",
      }}
    >
      {/* Image Container */}

      {validMessage?.buttonIndex && beast[0] != "0x0" && beast[1] != "0x0" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            alt="beast"
            style={{ maxWidth: "100%", maxHeight: "100vh" }}
            src={getImageDataUri(
              gameData.BEASTS[parseInt(beast[0])]?.toLowerCase() || "0"
            )}
          />
        </div>
      )}

      {/* Text Container */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: 24,
          paddingRight: 24,
          lineHeight: 1.2,
          fontSize: 72,
          color: "#49f627",
          overflow: "hidden",
        }}
      >
        {validMessage?.buttonIndex && beast[0] != "0x0" && beast[1] != "0x0" ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 96,
              }}
            >
              {parseInt(beast[1] || "")} hp
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              {gameData.BEASTS[parseInt(beast[0] || "")]} <br />{" "}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 48,
                paddingTop: 24,
              }}
            >
              Your xp: {parseInt(player[2] || "")} <br />
              {formatTime}
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            Enter the Mist...
          </div>
        )}
      </div>
    </div>,
    {
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
    }
  );

  return imageSvg;
}
