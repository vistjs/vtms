import puppeteer from 'puppeteer-core';
import findChrome from 'carlo/lib/find_chrome';

export async function runTask(
  steps: any[],
  mocks: any,
  url: string,
  width: number,
  height: number,
) {
  let browser;
  if (process.env.BROWSER_WS) {
    browser = await puppeteer.connect({
      browserWSEndpoint: process.env.BROWSER_WS,
    });
  } else {
    const findChromePath = await findChrome({});
    browser = await puppeteer.launch({
      executablePath: findChromePath.executablePath,
      headless: true,
    });
  }

  const page = await browser.newPage();
  page.setViewport({
    width,
    height,
  });

  const imgs: string[] = [];
  await page.exposeFunction('rtScreenshot', async (info: any) => {
    const img = (await page.screenshot({ encoding: 'base64' })) as string;
    // imgs.push(`data:image/png;base64,${img}`);
    imgs.push(img);
    return img;
  });
  let finishReplayResolve: any;
  const finishReplayP = new Promise<void>((resolve, reject) => {
    finishReplayResolve = resolve;
  });
  await page.exposeFunction('rtFinishReplay', () => {
    finishReplayResolve({});
  });

  await page.exposeFunction('rtFetchRecords', () => {
    return [steps, mocks];
  });
  await page.goto(`${url}`);
  await finishReplayP;
  await browser.close();
  return imgs;
}
