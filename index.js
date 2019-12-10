const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function scrapeProducts(page) {
    await page.goto("https://esportes.centauro.com.br/nav/esportes/suplementos");
    const  html = await page.content();
    const $ = cheerio.load(html);
    const results = $('.product-card')
    .map((index, product) => {
        const url = $(product).find('a').attr('href');
        const name = $(product).find('a').text();
        const price = $(product).find('._9pmwio').text().replace(/\D+/g,"");
        const img = $(product).find('._j96s06').attr('src');
        return { url, name, price, img }
    })
    .get();
    return results    
}

async function scrapeProductsDesc(products, page) {
    for (var i = 0; i < products.length; i++) {
        await page.goto(products[i].url);
        await sleep(2000);
        const html = await page.content();
        const $ = cheerio.load(html);
        const seller = $('._fynjto').text();
        const sender = $('._1irfpnl').text();        
        products[i].seller = seller;
        products[i].sender = sender;
        console.log(products[i]);
    }
}

async function connectToMongoDb() {
    const url = 'mongodb://localhost:27017'
    await mongo.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }, (err, client) => {
      if (err) {
        console.error(err)
        return
      }
    })
    console.log('connected')
}

async function sleep(miliseconds) {
    return new Promise(resolve => setTimeout(resolve, miliseconds));
}

async function main() {
    // await connectToMongoDb();
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const products = await scrapeProducts(page);
    const productsDesc = await scrapeProductsDesc(
        products,
        page
    );
}


main()