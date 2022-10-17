import puppeteer from 'puppeteer-core';
import findChrome from 'carlo/lib/find_chrome';

export async function runTask(
  steps: any[],
  mocks: any,
  url: string,
  width: number,
  height: number,
) {
  const findChromePath = await findChrome({});

  const browser = await puppeteer.launch({
    executablePath: findChromePath.executablePath,
    headless: true,
  });
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
