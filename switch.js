const puppeteer = require('puppeteer');
const cp = require('child_process');

function check() {
  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await Promise.all([
      page.goto('https://www.amazon.co.jp/gp/offer-listing/B084HPMVNN/ref=dp_olp_all_mbc?ie=UTF8&condition=all'),
      page.waitForResponse((response) => response.status() === 200)
    ]);

    let ready = false;
    let divs = await page.$$('div.a-row.a-spacing-mini.olpOffer');
    let count = 0;
    for (div of divs) {
      count = count+1;
      if ( count> 3)
        continue;

      let price = await div.$('span.a-size-large.a-color-price.olpOfferPrice.a-text-bold');
      let condition = await div.$('span.a-size-medium.olpCondition.a-text-bold');
      let seller = await div.$('h3.a-spacing-none.olpSellerName');

      let result = 'top ' + count + ' result';

      let lowprice = 100000;
      if (price) {
        let priceText = await price.evaluate((node)=> node.innerText);
        result = result.concat('price : ' ,priceText);
        lowprice = priceText.replace(/[^0-9]/g, '');
        result = result.concat('-' , lowprice);
      }

      if (condition) {
        let conditionText = await condition.evaluate((node)=> node.innerText);
        result = result.concat('\tcondition : ' ,conditionText);
      }

      if (seller) {
        let sellerText = await seller.evaluate((node)=> node.innerText);
        result = result.concat('\t\tseller : ' ,sellerText);
      }
      console.log(result);

      if (lowprice < 45000) {
        ready = true;
      }
      result = result.concat('\tprice compare : ' , ready);
    }

    await browser.close();

    //let time_now = (new Date()).toISOString().slice(0, 10).replace(/-/g, '');
    let time_now = (new Date()).toISOString();
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
