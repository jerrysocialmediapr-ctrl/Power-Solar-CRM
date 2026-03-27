import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('PAGE ERROR LOG:', msg.text());
    } else {
      console.log('PAGE LOG:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.error('PAGE EXCEPTION:', err.toString());
  });

  console.log("Navigating to http://localhost:4173 ...");
  
  // Don't wait for networkidle0 because background polling breaks it
  await page.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000)); // wait for initial JS execution

  console.log("Checking if we need to login...");
  const needsLogin = await page.$('input[type="email"]');
  if (needsLogin) {
    console.log("Logging in...");
    await page.type('input[type="email"]', 'jerrypowersolar@gmail.com');
    await page.type('input[type="password"]', 'Ian110809');
    await page.click('button[type="submit"]');
    
    await new Promise(r => setTimeout(r, 3000)); // wait for login redirect and fetch
  }

  console.log("Saving screenshot and extracting errors...");
  await page.screenshot({ path: 'test-crash.png' });
  
  const content = await page.evaluate(() => {
    return document.body.innerText.substring(0, 1000);
  });
  
  console.log("Page Body Start:", content);
  
  await browser.close();
  console.log("Done test.");
})();
