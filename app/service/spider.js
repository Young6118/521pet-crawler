"use strict";

const Crawler = require('crawler');

const Service = require("egg").Service;

const path = require('path');
const fs = require('fs');
const csvWriter = require('csv-write-stream');

const goodsCsvPath = path.resolve(__dirname, '../../output/goods.csv');
const evaluationCsvPath = path.resolve(__dirname, '../../output/evaluation.csv'); 

class SpiderService extends Service {
  saveAll(arr) {
    const writer = csvWriter();
    const writer2 = csvWriter();
    writer.pipe(fs.createWriteStream(goodsCsvPath));
    writer2.pipe(fs.createWriteStream(evaluationCsvPath));
    arr.forEach(item => {
      if (item.商品名称) {
        const { 评论 } = item;
        const readObj = {
          ...item
        };
        delete readObj.评论;
        writer.write(readObj);
        评论.forEach(one => {
          writer2.write(one);
        });
      }
    });
    writer2.end();
    writer.end();
  }

  async index({
    startId
  }) {
    const promises = [];
    const c = new Crawler({
      maxConnections: 1,
      rateLimit: 3000,
    });
    let i = 0;
    // Queue URLs with custom callbacks & parameters
    for(let i = 186; i < 10000; i++ ) {
      promises.push(new Promise((resolve, reject) => {
        setTimeout(() => {
          c.queue([{
            uri: `http://shop.boqii.com/product-${i}.html`,
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
                const getNum = function(txt) {
                  let numb = txt.match(/\d/g);
                  numb = numb.join("");
                  return Number(numb);
                }
                let goods = {
                  评论: []
                };
                goods.商品名称 = $('.shop_name').text().trim();
                goods.价格 = $('#bqPrice').text().trim();
                // goods.单价 = $('.bq_price .price_unit').text();
                goods.厂商指导价 = $('.oldprice').text();
                goods.评分 = $('.pl_score span').text();
                goods.评价数量 = $('.pro_tag_cont .sp em').first().text();
                goods.咨询数量 = $($('.pro_tag_cont .sp em').get(1)).text();
                goods.商品图片 = $('#proBigImg').attr('src');
                goods.专区 = $($('.breadcrumbNav_link').get(1)).text();
                goods.分类 = $($('.breadcrumbNav_link').get(2)).text();
                goods.国别 = $($('.breadcrumbNav_link').get(3)).text();
                goods.商品链接 = $('#producturl').attr('value');
                $('.pl_list').each((i, item) => {
                  const evaluation = {};
                  evaluation.用户昵称 = $(item).find('.pl_head p').text();
                  evaluation.评分 = $(item).find('.pl_right .ce53').text();
                  evaluation.内容 = $($(item).find('.pl_right dl dd').get(1)).text();
                  evaluation.商品链接 = goods.商品链接;
                  goods.评论.push(evaluation);
                })
                $('.property td').each((i, item) => {
                  const text = $(item).text();
                  const itemArr = text.split('：');
                  const itemObj = {
                    [itemArr[0]]: itemArr[1]
                  };
                  Object.assign(goods, itemObj);
                })
                i++;
                console.log('落库成功 ', i);
                resolve(goods);
              }
              done();
            }
          }]
        )}, Math.floor(Math.random() * 2000));
      }).catch(e => {
        console.log(e);
      }));
    }

    Promise.all(promises).then(res => {
      console.log(res.length, '成功');
      this.saveAll(res);
    });
    return '';

    // try {
    //   const res = await spider();
    //   return res;
    // } catch(error) {
    //   return error;
    // }
  }

}

module.exports = SpiderService;
