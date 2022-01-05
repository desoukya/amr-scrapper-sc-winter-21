process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

const cheerio = require('cheerio');
const express = require('express');
const axios = require('axios');
const { mongoClient } = require('./db.js');
const PORT = 3000;
const app = express();

const iLoveFakhry = async () => {
  const dataAggregate = [];

  const httpRequests = [];
  for (var i = 1; i <= 4; i++) {
    httpRequests.push(axios(`https://www.amazon.com/s?k=iphone&page=${i}&qid=1641303333&sprefix=iphone%2Caps%2C262&ref=sr_pg_${i}`));
  }

  const results = await Promise.all(httpRequests);

  (results || []).forEach((httpResponse) => {
    const html = httpResponse.data;
    const $ = cheerio.load(html);
  
    $(".s-asin").each((i, el) => {
      if (i == 16) {
        return false;
      } else {
        const title = $(el)
          .find(".s-title-instructions-style")
          .end()
          .find(".a-size-medium.a-color-base.a-text-normal")
          .html();
  
        const price = $(el)
          .find(".s-price-instructions-style")
          .end()
          .find(".a-offscreen")
          .html();
  
        const link =
          "https://amazon.com" +
          $(el)
            .find(".s-title-instructions-style")
            .end()
            .find(".a-link-normal")
            .attr("href");
  
        dataAggregate.push({
          title,
          price,
          link,
        });
      }
    });
  });

  return dataAggregate;
};

app.get("/scrape", async (req, res) => {
  const data = await iLoveFakhry();
  if (data && data.length) {
    const db = await mongoClient('amazon');
    if (!db) {
      return res.status(500).json({ message: 'Unable to establish database connection' });
    }
    await db.insertMany(data).catch((err) => {
      console.error(err);
    });
  }
  res.json(data);
});

app.listen(PORT, () => console.log(`Server Started on PORT ${PORT}`));