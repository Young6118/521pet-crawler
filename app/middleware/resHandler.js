"use strict";

const errorCode = require("../../const/errorCode");
module.exports = () => {
    return async (ctx, next) => {
        try {
            const failure = (code = -1) => {
                ctx.body = errorCode(code);
            };
            const succeed = data => {
                const body = errorCode("0");
                if (data) {
                    body.data = data;
                }
                ctx.body = body;
            };
            ctx.failure = failure;
            ctx.succeed = succeed;
            await next();
        } catch (e) {
            if (e.message.indexOf("\"code\":-128") !== -1) {
                // 处理鉴权的提示信息
                const errMsg = JSON.parse(e.message);
                ctx.logger.info(errorCode(errMsg.code));
                ctx.body = Object.assign(errorCode(errMsg.code), { data: errMsg.msg });
            } else {
                // 处理其他预发错误
                ctx.logger.error(e);
                ctx.body = Object.assign(errorCode("-1"), { data: e.message });
            }
        }
    };
};
