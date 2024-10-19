import puppeteer from "puppeteer"
import fp from 'fastify-plugin'


async function Scraping(fastify) {

    const scrapedItemsFromWebsites = async (text) => {
        const searchBy = {
            fileName: "./result.txt",
            searchText: text
        }
        return await run(searchBy)
    }

    const scanForLinks = async (page, stopAfterFirstResult) => {
        return page.evaluate(() => {
            // const aWithBr = document.querySelectorAll('a:has(br)');
            const aWithBr = document.querySelectorAll('.js-flyerStaticViewer__href');
            const hrefs = [];
            const prices = [];
            for (const anchor of aWithBr) {
                if (anchor.hasAttribute('href')) {
                    hrefs.push(anchor.getAttribute("href"));
                //    if (stopAfterFirstResult)
                        break
                }

            }
            return hrefs;
        })
    }

    const run = async (searchBy) => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const url = "https://www.doveconviene.it/volantino/" + searchBy.searchText
        await page.goto(url, { waitUntil: 'load' });

        const hrefs = await scanForLinks(page, true);
        await browser.close()
        return hrefs
    }






    fastify.decorate('scrapingFacility', {
        scrapedItemsFromWebsites,
    })
}

export default fp(Scraping)