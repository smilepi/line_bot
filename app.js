const linebot = require('linebot');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const botJson = require('./bot.json');

const port = process.env.PORT || 8888;

var bot = linebot({
    channelId:'1609271403',
    channelScrect:'e7cbab1530216af12aae6666d018408a',
    channelAccessToken:'SLgp3uX6+ddKTOdbJv+kT7nMLI2fIiWSRuIfE9JYLGRPfqKhcSpTRr5hNi47v7BSn08owpM8iEAFZbf6uthcWsXzZRN46bkY83fapSEZTveIuAth0eQid/geYAxOyBmeaXqqJLdeRtf04OmA6QciGAdB04t89/1O/w1cDnyilFU='
});

const app = express();

const linebotParser = bot.parser();

const parser = bodyParser.json({
    verify: function (req, res, buf, encoding) {
        req.rawBody = buf.toString(encoding);
    }
});

app.post('/linewebhook', parser, function (req, res) {
    // if (!bot.verify(req.rawBody, req.get('X-Line-Signature'))) {
    //     console.log(req.rawBody)
    //     console.log(req.get('X-Line-Signature'))
    //   return res.sendStatus(400);
    // }
    bot.parse(req.body);
    return res.json({});
});

bot.on('message',function(event){
    const BOT_NAME = "@dart";
    const input = event.message.text;
    if (input.indexOf(BOT_NAME) > -1) {
        request({
            url:'http://league.dartslive.tw/admin/team/info.jsp?lid=60886d06cf799c31&sid=fec1ae84bb28bd87&did=04bea5f61d9438e4&tid=d3f9114b46845767',
            method:'GET'
        }, function(error, res, body){
            if (error || !body) {
                return;
            }
            const $ = cheerio.load(body);
            const result = [];
            const table_tr = $('#schedule .detail_contents_free table tr');

            for (let i = 0; i < table_tr.length; i++) {
                const table_td = table_tr.eq(i).find('td');
                const day = table_td.eq(0).text().trim();
                const time = table_td.eq(1).text();
                const place = table_td.eq(2).find('p').text();
                const team = table_td.eq(3).find('a').eq(0).text();
                const shop = table_td.eq(3).find('a').eq(1).text();
                result.push(Object.assign({day, time, place, team, shop}));
            }
            const allResult = JSON.stringify(result[0]);
            const json_result = JSON.parse(allResult);
            if (input.indexOf('all') > -1) {
                console.log('all sucess');
                let msg = result.map(info => `日期 : ${info.day}\n時間 : ${info.time}\n主客場 : ${info.place}\n對戰對手 : ${info.team}\n地點 : ${info.shop}`).join('\n----------------------\n');
                event.reply(msg);
            }
            if (input.indexOf('next') > -1) {
                console.log('next sucess');
                const str = `日期 : ${json_result.day}\n時間 : ${json_result.time}\n主客場 : ${json_result.place}\n對戰對手 : ${json_result.team}\n地點 : ${json_result.shop}`;
                event.reply(str);
            }
            if (input.indexOf('check') > -1) {
                console.log('check sucess');
                event.reply(botJson);
            }
        })
    }
    
});

app.listen(port, function(){
    console.log('linebot is running');
});