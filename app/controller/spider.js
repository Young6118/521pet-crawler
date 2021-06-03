'use strict';

const Controller = require('egg').Controller;

class SpiderController extends Controller {
  async index() {
    const query = this.ctx.request.query;
    const data = await this.ctx.service.spider.index(query);
    this.ctx.succeed(data);
  }
}

module.exports = SpiderController;
