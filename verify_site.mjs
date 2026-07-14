import { chromium } from "playwright";

async function verify() {
  console.log("Starting verification...");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  const errors = [];
  page.on("pageerror", (e) => {
    console.error("PAGE ERROR:", e.message);
    errors.push(e.message);
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log("CONSOLE ERROR:", msg.text());
    }
  });

  // Navigate to site
  console.log("Navigating to http://localhost:3000/ ...");
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  
  // Click login button in the site header
  console.log("Clicking login button...");
  await page.click("text=تسجيل دخول");
  await page.waitForTimeout(1000);

  // Fill in email login credentials (using admin account)
  console.log("Logging in as admin...");
  await page.fill('input[type="email"]', "kenansafety.sec@gmail.com");
  await page.fill('input[type="password"]', "123456");
  
  // Click submit to log in
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  // Check if we logged in and see the dashboard
  console.log("Checking dashboard URL and layout...");
  const heading = await page.textContent("h1");
  console.log("Active section header:", heading);

  // Check sidebar navigation items
  const sidebarButtons = await page.locator(".sidebar nav button").allTextContents();
  console.log("Sidebar navigation items:", sidebarButtons);

  // Click on "عروض الأسعار" section (Quotations)
  console.log("Navigating to Quotations view...");
  await page.click("text=عروض الأسعار");
  await page.waitForTimeout(1000);
  console.log("Current header:", await page.textContent("h1"));

  // Take a screenshot of the Quotations view
  await page.screenshot({ path: "tmp-quotations.png" });
  console.log("Saved screenshot to tmp-quotations.png");

  // Click on "العقود" section (Contracts)
  console.log("Navigating to Contracts view...");
  await page.click("text=العقود");
  await page.waitForTimeout(1000);
  console.log("Current header:", await page.textContent("h1"));

  // Take a screenshot of the Contracts view
  await page.screenshot({ path: "tmp-contracts.png" });
  console.log("Saved screenshot to tmp-contracts.png");

  await browser.close();
  console.log("Verification finished. Page errors:", errors.length ? errors : "none");
}

verify().catch(console.error);
