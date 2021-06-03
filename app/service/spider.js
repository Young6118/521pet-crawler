"use strict";

const Crawler = require('crawler');

const Service = require("egg").Service;

class SpiderService extends Service {

  async index({
    keywords
  }) {
    // Queue URLs with custom callbacks & parameters
    return new Promise((resolve, reject) => {
      const c = new Crawler({
        maxConnections: 10,
        // This will be called for each crawled page
        callback: (error, res, done) => {
          if (error) {
            console.log(error);
          } else {
            const $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            console.log($('title').text());
          }
          done();
        }
      });
      c.queue([{
        uri: `http://www.boqii.com/search/shop?keywords=${encodeURI(keywords)}`,
        jQuery: {
          name: 'cheerio'
        },
        // The global callback won't be called
        callback: (error, res, done) => {
          if (error) {
            console.log(error);
            reject(error);
          } else {
            const $ = res.$;
            const goodsList = [];
            const getNum = function(txt) {
              let numb = txt.match(/\d/g);
              numb = numb.join("");
              return Number(numb);
            }
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            $('.sear_goods_list').each((i, item) => {
              let goods = {};
              console.log($(item).find('a').length);
              $(item).find('a').each((j, el) => {
                const a = $(el);
                if (j === 0) {
                  goods.link = a.attr('href');
                  goods.pic_url = a.children().first().attr('src');
                }
                if (j === 1) {
                  goods.name = a.text();
                }
                if (j === 2) {
                  console.log(324, a.text());
                  goods.appraise = getNum(a.text());
                  goods.appraise_url = a.attr('href');
                }
              });
              goods.price = Number(getNum($(item).find('.sear_price').text()));
              goods.sales = Number(getNum($(item).find('.sear_goods_list_bot .textright').text()));
              goodsList.push(goods);
            });
            resolve(goodsList);
          }
          done();
        }
      }]);
    });

    // try {
    //   const res = await spider();
    //   return res;
    // } catch(error) {
    //   return error;
    // }
  }

}

module.exports = SpiderService;
