const puppeteer = require('puppeteer');
const cheerio = require('cheerio');


async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

async function scrapeProductsDesc(products, page) {
    for (var i = 0; i < products.length; i++) {
        await page.goto(products[i].url);
        await sleep(5000);
        const html = await page.content();
        const $ = cheerio.load(html);
        const seller = $('._fynjto').text();
        const sender = $('._1irfpnl').text();        
        products[i].seller = seller;
        products[i].sender = sender;
        console.log(products[i]);
    }
}

const checkLastPage = ($) => {
    const lastElement = $('._19r3qao').text().split(' ')[2];
    const totalPages =  $('._19r3qao').text().split(' ')[4];
    return totalPages === lastElement
}

async function scrapeIndexProducts(page, url) {
    await page.goto(url);
    await page.waitForSelector('.product-card');
    await autoScroll(page);   
    const  html = await page.evaluate(()=> document.body.innerHTML) 
    const $ = cheerio.load(html);
    const results = $('.product-card') 
    .map((_, product) => {
        const url = $(product).find('a').attr('href');
        const name = $(product).find('a._xe1nr1').text();
        const price = $(product).find('._9pmwio').text().replace(/\D+/g,"");
        const img = $(product).find('._j96s06').attr('src');
        return { url, name, price, img }
    })
    .get();
    // const productsDesc = await scrapeProductsDesc(
    //     products,
    //     page
    //   );
    console.log(results);
    if (checkLastPage($)) {
        console.log('Last page scraped')
        return 
    } else {
        let nextUrl = `https://esportes.centauro.com.br${$('a._qc114t').last().attr('href')}`;
        console.log(nextUrl)
        await scrapeIndexProducts(page, nextUrl);    
    }
    // return productsDesc    
}

async function sleep(miliseconds) {
    return new Promise(resolve => setTimeout(resolve, miliseconds));
}

async function main() {
    // await connectToMongoDb();
    const url = "https://esportes.centauro.com.br/nav/esportes/suplementos"
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1');
    // await page.setViewport({ width: 1920, height: 926 });
    const products = await scrapeIndexProducts(page, url);
    // await browser.close();
}

main()