const puppeteer = require('puppeteer')

async function scrape() {
   const browser = await puppeteer.launch({})
   const page = await browser.newPage()

   await page.goto('https://www.thesaurus.com/browse/smart')
   var element = await page.waitForSelector("#meanings > div.css-ixatld.e15rdun50 > ul > li:nth-child(1) > a")
   var text = await page.evaluate(element => element.textContent, element)
   console.log(text)
   browser.close()
}
scrape()