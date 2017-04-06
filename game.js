function GetRandomNum(Min, Max) {//随机函数封装
    var Range = Max - Min;
    var Rand = Math.random();
    return (Min + Math.round(Rand * Range));
}

function random(max) {//随机函数封装
    return GetRandomNum(0, max);
}
var is_start = false;
var game = {};
var time_array = new Array();
for (var x = 0; x < 5; x++) //生成5分钟时间数组
    for (var i = 0; i < 12; i++) {
    time_array[x * 12 + i] = (x + 9) + ":" + i * 5;
}
var myAudioWin = new Audio();
//myAudioWin.setAttribute("src", "horse.mp3");
//初始化
function init() { //游戏初始化
    game.OpenDay = random(6000) + 5000;
    game.OpenBar = game.OpenDay;
    game.CloseBar = game.OpenDay;
    game.Kdata = new Array();
    for (var x = 0; x < 60; x++) {
        game.Kdata[x] = ["-", "-", "-", "-"];
    }
    game.Kcount = 0;
    game.bid = game.OpenDay;
    game.c = game.OpenDay;
    game.ask = game.OpenDay;
    game.temp_high = game.OpenDay;
    game.temp_low = game.OpenDay;
    game.CloseBar = game.OpenDay;
    game.OpenBar = game.CloseBar + random(20) - 10;
    game.h = game.OpenDay;
    game.l = game.OpenDay;
    $("#o").text(game.OpenDay);
    game.totalCash = 450000;
    game.totalCash0 = 450000;
    game.usableCash = 450000;
    game.getCash = 0;
    game.buyNo = -1;
    game.sellNo = 0;
    game.sellNo0 = 0;
    game.buyType = 1;
    game.buyNumTotal = 0;
    game.buyArray = new Array();
    game.buyArray0 = new Array();
    game.buyNum = 0;
    game.buyPrice = 0;
    var trHTML = "<tr><th colspan='3' align='center'>买</th></tr><tr><td>单号</td><td>数量</td><td>成交价</td></tr>";
    $("#buy_table").html(trHTML);
    trHTML = "<tr><th colspan='3' align='center'>卖</th></tr><tr><td>单号</td><td>数量</td><td>成交价</td></tr>";
    $("#sell_table").html(trHTML);
}
//获得随机K线
function getK() { //随机K线图
    game.Kdata[game.Kcount] = [
        game.OpenBar, game.CloseBar, game.temp_low, game.temp_high
    ]
    game.temp_low = game.CloseBar;
    game.temp_high = game.CloseBar;
    game.OpenBar = game.CloseBar + random(20) - 10;
    $("#c").text(game.CloseBar);
    if (random(10) > 7) {
        game.CloseBar = game.OpenBar + (random(250) - 125);
    } else {
        game.CloseBar = game.OpenBar + (random(120) - 60);
    }
    if (Math.abs(game.CloseBar - game.OpenBar) < 5) {
        game.CloseBar = game.OpenBar;
    }
    game.Kcount++;
    draw();
    if (game.Kcount > 60) stop();
}
//计算可下手数
function jsss() { //计算可下手术
    if (game.buyType == 1) {
        game.buyNum0 = Math.floor(game.usableCash / 140000) + Math.max(-game.buyNumTotal, 0);
    } else {
        game.buyNum0 = Math.floor(game.usableCash / 140000) + Math.max(game.buyNumTotal, 0);
    }
    if (game.buyNum0 < 0) {
        game.buyNum0 = 0
    }
    $("#kxss").text(game.buyNum0);
}
//计算BID,ASK
function sj_bid_ask() { //随机BID ASK
    game.HighLine = Math.max(game.OpenBar, game.CloseBar) + random(20);
    game.LowLine = Math.min(game.OpenBar, game.CloseBar) - random(20);
    game.bid = game.LowLine + random(game.HighLine - game.LowLine);
    game.ask = game.bid + random(15);
    if (game.bid < game.temp_low) {
        game.temp_low = game.bid;
        if (game.bid < game.l) {
            game.l = game.bid;
            $("#l").text(game.l);
        }
    }
    if (game.ask > game.temp_high) {
        game.temp_high = game.ask;
        if (game.ask > game.h) {
            game.h = game.ask;
            $("#h").text(game.h);
        }
    }
    $("#bid").text(game.bid);
    $("#ask").text(game.ask);
}
//计算余额
function jsye() {
    game.flootCash = 0;
    j = game.buyArray0.length / 3;
    i = 0;
    while (i < j) {
        if (game.buyArray0[(i * 3) + 2] == 0) {
            m = game.buyArray0[i * 3];
            n = game.buyArray0[(i * 3) + 1];
            if (m > 0) {
                game.flootCash = game.flootCash + (((game.bid - n) * Math.abs(m)) * 200);
            } else {
                game.flootCash = game.flootCash + (((n - game.ask) * Math.abs(m)) * 200);
            }
        }
        i++;
    }
    game.getRate = Math.ceil(((game.flootCash + game.getCash) / 450000) * 1000) / 10;
    game.totalCash0 = (game.flootCash + game.getCash) + 450000;
    game.usableCash = ((Math.min(game.flootCash, 0) + game.getCash) + 450000) - Math.abs(game.buyNumTotal * 140000);
    if (game.usableCash < 0) {
        alert("爆仓已强制平仓");
        bc();
    }
    $("#fdsy").text(game.flootCash);
    $("#kyje").text(game.usableCash);
    $("#zqys").text(game.totalCash0);
    $("#bcl").text(game.getRate+"%");

}
//实时计算
function time() {
    sj_bid_ask();
    jsss();
    jsye();
}

function start() {
    is_start = true;
    init();
    game.tag = self.setInterval("time()", 200);
    game.tagK = self.setInterval("getK()", 2000);
    draw();
    $("#start").hide();
}

function stop() {
    is_start = false;
    game.tag = self.clearInterval(game.tag);
    game.tagK = self.clearInterval(game.tagK);
    $("#start").show();
}
//画K线
function draw() {
    option.series[0].data = game.Kdata;
    // 基于准备好的dom，初始化echarts图表
    var myChart = echarts.init(document.getElementById('main'));
    // 为echarts对象加载数据 
    myChart.setOption(option);
}
//买初始化
function buy_init() {
    if (!is_start) {
        alert("游戏没有开始");
        return;
    }
    game.buyType = 1;
    game.buyNum = 0;
    $("#buyNum").text(game.buyNum);
    $("#buyimg").show();
    $("#sellimg").hide();
}
//卖初始化
function sell_init() {
    if (!is_start) {
        alert("游戏没有开始");
        return;
    }
    game.buyType = -1;
    game.buyNum = 0;
    $("#buyNum").text(game.buyNum);
    $("#buyimg").hide();
    $("#sellimg").show();
}
//增加手
function add_ss() {
    if (game.buyNum < game.buyNum0)
        game.buyNum++;
    $("#buyNum").text(game.buyNum);
}
//减少手
function sub_ss() {
    if (game.buyNum > 0)
        game.buyNum--;
    $("#buyNum").text(game.buyNum);
}
//下单
function buy() {
    var m;
    var n;
    var s = 0;
    if (game.buyType > 0) game.buyPrice = game.ask;
    else game.buyPrice = game.bid;
    if (game.buyNum > 0) {
        n = game.buyNum;
        if ((game.buyType > 0) && (game.buyNumTotal < 0)) {
            do {
                m = game.buyArray0[game.sellNo * 3];
                game.buyArray0[(game.sellNo * 3) + 2] = 1;
                if ((n + m) < 0) {
                    game.buyArray0[game.sellNo * 3] = m + game.buyNum;
                    m = -game.buyNum;
                    game.buyArray0[(game.sellNo * 3) + 2] = 0;
                }
                n = n + m;
                s = s + (((game.buyArray0[(game.sellNo * 3) + 1] - game.buyPrice) * 200) * Math.abs(m));
                if (game.buyArray0[(game.sellNo * 3) + 2] == 1) {
                    game.sellNo = game.sellNo + 1;
                }
            } while ((n > 0) && (game.sellNo < game.sellNo0));
            game.totalCash = (game.totalCash + (Math.abs(m) * 140000)) + s;
            game.getCash = game.getCash + s;
        } else if ((game.buyType < 0) && (game.buyNumTotal > 0)) {
            do {
                m = game.buyArray0[game.sellNo * 3];
                game.buyArray0[(game.sellNo * 3) + 2] = 1;
                if ((n - m) < 0) {
                    game.buyArray0[game.sellNo * 3] = m - game.buyNum;
                    m = game.buyNum;
                    game.buyArray0[(game.sellNo * 3) + 2] = 0;
                }
                n = n - m;
                s = s + (((game.buyPrice - game.buyArray0[(game.sellNo * 3) + 1]) * 200) * Math.abs(m));
                if (game.buyArray0[(game.sellNo * 3) + 2] == 1) {
                    game.sellNo = game.sellNo + 1;
                }
            } while ((n > 0) && (game.sellNo < game.sellNo0));
            game.totalCash = (game.totalCash + (Math.abs(m) * 140000)) + s;
            game.getCash = game.getCash + s;
        }
        if (n > 0) {
            game.sellNo0 = game.sellNo0 + 1;
            game.buyArray0.push(n * game.buyType, game.buyPrice, 0);
        }
        game.buyNumTotal = game.buyNumTotal + (game.buyNum * game.buyType);
        game.totalCash = game.totalCash - (n * 140000);
        game.buyNo = game.buyNo + 1;
        list_push(game.buyType, game.buyNo + 1, game.buyNum, game.buyPrice);
        myAudioWin.play();//播放
    }
    game.buyNum = 0;
    $("#buyNum").text(game.buyNum);    
    if (game.buyType > 0) buy_init();
    else sell_init();
}
//保存平仓
function bc() { //爆仓处理
    var m;
    var n;
    var s = 0;
    if (game.buyNumTotal > 0) {
        game.buyType = -1;
    } else {
        game.buyType = 1;
    }
    game.buyNum=Math.abs(game.buyNumTotal);
    buy();
}
//添加历史记录
function list_push(a, b, c, d) {
    game.buyArray.push({
        buyType: a,
        buyNo: b,
        buyNum: c,
        buyPrice: d
    });
    var trHTML = "<tr><td>" + b + "</td><td>" + c + "</td><td>" + d + "</td></tr>";
    if (a > 0) {
        $("#buy_table").append(trHTML);
    } else {
        $("#sell_table").append(trHTML);
    }
}
//K线图OPTION
option = {
    animation: false,
    tooltip: {
        trigger: 'axis',
        formatter: function (params) {
            var res = '时间 ' + params[0].name;
            res += '<br/>  开盘 : ' + params[0].value[0] + '  最高 : ' + params[0].value[3];
            res += '<br/>  收盘 : ' + params[0].value[1] + '  最低 : ' + params[0].value[2];
            return res;
        }
    },
    grid: {
        x: 55,
        y: 60,
        x2: 10,
        y2: 30
    },
    xAxis: [
        {
            type: 'category',
            boundaryGap: true,
            axisTick: {
                onGap: false
            },
            splitLine: {
                show: false
            },
            data: time_array
        }
    ],
    yAxis: [
        {
            type: 'value',
            scale: true,
            boundaryGap: [0.01, 0.01]
        }
    ],
    series: [
        {
            name: '指数',
            type: 'k',
            data: game.Kdata // 开盘，收盘，最低，最高

                    }
                ]
};