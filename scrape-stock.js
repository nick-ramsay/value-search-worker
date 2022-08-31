const puppeteer = require('puppeteer')

async function scrape() {
   const browser = await puppeteer.launch({})
   const page = await browser.newPage()

   await page.goto('https://finviz.com/quote.ashx?t=AAPL', {waitUntil: 'load', timeout: 120000})
   await page.waitForTimeout(60000)
   var element = await page.waitForSelector("body > div:nth-child(8) > div > table.snapshot-table2 > tbody > tr:nth-child(1)")
   var text = await page.evaluate(element => element.textContent, element)
   console.log(text)
   browser.close()
}
scrape()