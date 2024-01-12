import Canvas, { createCanvas, loadImage } from "canvas";
import { type IOfferItemDocument } from "../../database/schemas/marketplace-item.ts";
import { capitalizeFirstLetter } from "../util/index.ts";

// Registering fonts
Canvas.registerFont("./src/assets/fonts/Teko-SemiBold.ttf", {
  family: "Teko",
});

Canvas.registerFont("./src/assets/fonts/HelveticaBoldFont.ttf", {
  family: "HelveticaBold",
});

Canvas.registerFont("./src/assets/fonts/helvetica.otf", {
  family: "Helvetica",
});

Canvas.registerFont("./src/assets/fonts/Oswald-MediumItalic.ttf", {
  family: "Oswald",
});

Canvas.registerFont("./src/assets/fonts/Targa MS.ttf", {
  family: "TargaMS",
});

Canvas.registerFont("./src/assets/fonts/Slabo27px-Regular.ttf", {
  family: "Slabo",
});

Canvas.registerFont("./src/assets/fonts/Poppins-Light.ttf", {
  family: "Verily Serif Mono",
});

Canvas.registerFont("./src/assets/fonts/HelveticaBoldMS.ttf", {
  family: "HelveticaBoldMS",
});

Canvas.registerFont("./src/assets/fonts/VampireKingDemoRegular.ttf", {
  family: "Vampire",
});

Canvas.registerFont("./src/assets/fonts/small_pixel-7.ttf", {
  family: "Pixel",
});

Canvas.registerFont("./src/assets/fonts/Bebas-Regular.ttf", {
  family: "Bebas",
});

// Loading images
export const cachedImages: Record<string, Canvas.Image> = {
  experience: await loadImage("./src/assets/experience/1.png"),
  negativeExperience: await loadImage("./src/assets/experience/2.png"),
  playerInfo: await loadImage("./src/assets/player/1.png"),
  upgradeEquipment: await loadImage("./src/assets/upgrade-equipment/1.png"),
  refineFood: await loadImage("./src/assets/refine-food/1.png"),
};

export function fillMixedText(
  ctx: Canvas.CanvasRenderingContext2D,
  args: Array<{ text: string; fillStyle?: string; font?: string }>,
  x: number,
  y: number,
): void {
  const defaultFillStyle = ctx.fillStyle;
  const defaultFont = ctx.font;

  let xx = x;

  ctx.save();
  args.forEach(({ text, fillStyle, font }) => {
    ctx.fillStyle = fillStyle ?? defaultFillStyle;
    ctx.font = font ?? defaultFont;
    ctx.fillText(text, xx, y);
    xx += ctx.measureText(text).width;
  });
  ctx.restore();
}

export async function createItemListImage(
  items: IOfferItemDocument[],
  pageString: string = "1/1",
): Promise<Canvas.Canvas> {
  const background = await loadImage("./src/assets/marketplace/list.png");

  const canvas = createCanvas(background.width, background.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(background, 0, 0);

  ctx.globalAlpha = 0.8;

  function drawPill(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    r: number,
    color: string,
  ): void {
    const w = x1 - x0;
    const h = y1 - y0;

    if (r > w / 2) r = w / 2;
    if (r > h / 2) r = h / 2;

    ctx.beginPath();
    ctx.moveTo(x1 - r, y0);
    ctx.quadraticCurveTo(x1, y0, x1, y0 + r);
    ctx.lineTo(x1, y1 - r);
    ctx.quadraticCurveTo(x1, y1, x1 - r, y1);
    ctx.lineTo(x0 + r, y1);
    ctx.quadraticCurveTo(x0, y1, x0, y1 - r);
    ctx.lineTo(x0, y0 + r);
    ctx.quadraticCurveTo(x0, y0, x0 + r, y0);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function drawPayment(
    price: {
      money: { currency: string; amount: number };
      gold: number;
      coins: number;
    },
    index: number,
  ): string {
    const textArr: string[] = [];

    if (price.money.currency.length > 0 && price.money.amount > 0) {
      const numberFormat = `${Intl.NumberFormat().format(
        price.money.amount,
      )} ${price.money.currency.toUpperCase()} `;

      ctx.fillStyle = "#42f557";
      ctx.fillText(
        numberFormat,
        120 + ctx.measureText(textArr.join(" ")).width + 10,
        198 + index * 52,
      );

      textArr.push(numberFormat);
    }
    if (price.coins > 0) {
      const numberFormat = `${Intl.NumberFormat().format(price.coins)} Coins `;

      ctx.fillStyle = "#4287f5";
      ctx.fillText(
        numberFormat,
        120 + ctx.measureText(textArr.join(" ")).width + 10,
        198 + index * 52,
      );

      textArr.push(numberFormat);
    }
    if (price.gold > 0) {
      const numberFormat = `${Intl.NumberFormat().format(price.gold)} Gold `;

      ctx.fillStyle = "#dec549";
      ctx.fillText(
        numberFormat,
        120 + ctx.measureText(textArr.join(" ")).width + 10,
        198 + index * 52,
      );

      textArr.push(numberFormat);
    }

    if (textArr.length === 0) {
      ctx.fillText("Unknown", 130, 198 + index * 52);
    }

    return textArr.length === 0 ? "Unknown" : textArr.join(" ");
  }

  for (let index = 0; index < 15; index++) {
    ctx.textAlign = "start";

    const item = items[index];

    if (item === undefined) {
      const randomNameShadowWidth = Math.random() * (380 - 160) + 160;
      const randomValueShadowWidth = Math.random() * (260 - 160) + 160;

      drawPill(
        120,
        162 + index * 52,
        randomNameShadowWidth,
        162 + index * 52 + 20,
        7,
        "#ff8269",
      );
      drawPill(
        120,
        188 + index * 52,
        randomValueShadowWidth,
        188 + index * 52 + 12,
        7,
        "#ff8269",
      );
      drawPill(68, 162 + index * 52, 108, 162 + index * 52 + 40, 7, "#ff8269");
      continue;
    }

    ctx.globalAlpha = 0.8;
    ctx.font = "10pt Oswald";

    const paymentMethodText = drawPayment(item.item.price, index);

    const textSize = ctx.measureText(paymentMethodText);

    let statsStringLength = 0;

    const stats = Object.entries(item.item.stats ?? {});

    for (const [key, value] of stats) {
      if (value > 0) {
        const keyStr = "stat" + capitalizeFirstLetter(key);

        ctx.fillStyle = "#ff8269";
        ctx.drawImage(
          cachedImages[keyStr],
          statsStringLength +
            30 +
            (textSize.width + 120) -
            (cachedImages[keyStr].naturalWidth / 2) * 0.02,
          193 + index * 52 - (cachedImages[keyStr].naturalHeight / 2) * 0.02,
          cachedImages[keyStr].naturalWidth * 0.02,
          cachedImages[keyStr].naturalHeight * 0.02,
        );

        ctx.fillText(
          value.toString(),
          textSize.width + 135 + 30 + statsStringLength,
          198 + index * 52,
        );
        statsStringLength += ctx.measureText(value.toString()).width + 33;
      }
    }

    const itemImage = await loadImage(
      `./src/assets/sprites/items/${item.item.name}.png`,
    );

    ctx.drawImage(
      itemImage,
      90 - (itemImage.width / 2) * 0.07,
      180 + index * 52 - (itemImage.height / 2) * 0.07,
      itemImage.width * 0.07,
      itemImage.height * 0.07,
    );

    ctx.font = "18pt Oswald";
    ctx.fillStyle = "#fff4e0";
    ctx.fillText(item.item.name, 120, 182 + index * 52);

    const itemMameWidth = ctx.measureText(item.item.name).width;

    ctx.font = "6pt Oswald";

    const amountText = `${new Intl.NumberFormat().format(
      item.amount > 0 ? item.amount : 1,
    )}x`;

    ctx.fillText(amountText, 120, 162 + index * 52);

    if (item.servers.includes("global")) {
      ctx.fillStyle = "#ff9d8a";
      ctx.fillText(
        "Global",
        125 + ctx.measureText(amountText).width,
        162 + index * 52,
      );
    } else {
      let serversSquaresWidth = 0;

      for (let i = 0; i < item.servers.length; i++) {
        const server = capitalizeFirstLetter(item.servers[i]);

        switch (server) {
          case "Red":
            ctx.fillStyle = "#f54242";
            break;

          case "Blue":
            ctx.fillStyle = "#4643f7";
            break;

          default:
            ctx.fillStyle = "#ff9d8a";
            break;
        }

        ctx.beginPath();
        ctx.rect(
          125 + ctx.measureText(amountText).width + serversSquaresWidth,
          155 + index * 52,
          7,
          7,
        );

        ctx.fill();

        serversSquaresWidth += 10;
      }
    }

    ctx.font = "8pt Oswald";

    ctx.globalAlpha = 0.4;
    ctx.fillStyle = "#dec549";

    ctx.fillText("mrnOliveira", 125 + itemMameWidth, 175 + index * 52);

    ctx.font = "7pt Helvetica";

    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "#ff9d8a";

    let date = "Unknown date";

    if (!Number.isNaN(new Date(item.posted_date).getTime())) {
      date = new Date(item.posted_date).toISOString().split("T")[0];
    }

    ctx.fillText(
      `${item._id.toHexString()} - ${date}`,
      125 + itemMameWidth,
      182 + index * 52,
    );

    ctx.textAlign = "center";
    ctx.font = "25pt Pixel";
    ctx.fillStyle = "#ed7753";
    ctx.fillText(pageString, 93, 975);
  }

  return canvas;
}
