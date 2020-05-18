const puppeteer = require('puppeteer');
const cp = require('child_process');
const devices = require('puppeteer/DeviceDescriptors');
const iPhonex = devices['iPhone X'];

function check() {
  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await Promise.all([
      await page.emulate(iPhonex),
      page.goto('https://www.amazon.co.jp/gp/offer-listing/B084HPMVNN'),
      page.waitForResponse((response) => response.status() === 200)
    ]);

    let ready = false;
    let divs = await page.$$('div.a-container.olpMobileOffer.olpNoPadding');
    let count = 0;
    for (div of divs) {
      count = count+1;
      if ( count> 3)
        continue;

      let price = await div.$('span.a-size-large.a-color-price.olpOfferPrice');
      let condition = await div.$('span.a-size-medium.olpCondition');
      let seller = await div.$('h3.a-spacing-none.olpSellerName');

      let result = 'top ' + count + ' result ';

      let lowprice = 100000;
      if (price) {
        let priceText = await price.evaluate((node)=> node.innerText);
        result = result.concat('price : ' ,priceText);
        lowprice = priceText.replace(/[^0-9][\t\n]/g, '');
        if (lowprice < 47000) {
          ready = true;
        }
        result = result.concat('\t' , ready?"true":"false");
      }

      if (condition) {
        let conditionText = await condition.evaluate((node)=> node.innerText);
        conditionText = conditionText.replace(/[ \t\n]/g, '');
        result = result.concat('\tcondition : ' ,conditionText);
      }

      if (seller) {
        let sellerText = await seller.evaluate((node)=> node.innerText);
        sellerText = sellerText.replace(/[ \t\n]/g, '');
        result = result.concat('\t\tseller : ' ,sellerText);
      }
      console.log(result);
    }

    await browser.close();

    //let time_now = (new Date()).toISOString().slice(0, 10).replace(/-/g, '');
    let time_now = new Date().toLocaleString();
    if (ready) {
      console.log(time_now + ' : checked. found!!!');
      cp.spawn('explorer', [`https://youtu.be/vvzejuej5Wg`]);
    } else {
      console.log(time_now + ' : checked. no result');
    }
    await browser.close();
  })();

  setTimeout(check, 60000);
}

check();