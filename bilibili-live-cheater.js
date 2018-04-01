// ==UserScript==
// @name         Bilibili直播间自动姬
// @namespace    Suevily
// @version      1.00
// @description  Bilibili直播间自动领银瓜子，自动签到，自动参与小电视和活动抽奖, 自动将小红包兑换成经验原石
// @author       Suevily
// @include      /^https?:\/\/live\.bilibili\.com\/\d/
// @run-at       document-end
// @grant        none
// @license      MIT License
// ==/UserScript==

(function() {
  'use strict';

  /*-------------------验证码回调--------------------*/
  // window.onload = ls();
  function ls() {
    function get_word(a) {
        if (a.total <= 50) return "-";
        if (a.total > 120 && a.total < 135) return "+";
        if (a.total > 155 && a.total < 162) return 1;
        if (a.total > 189 && a.total < 195) return 7;
        if (a.total > 228 && a.total < 237) return 4;
        if (a.total > 250 && a.total < 260) return 2;
        if (a.total > 286 && a.total < 296) return 3;
        if (a.total > 303 && a.total < 313) return 5;
        if (a.total > 335 && a.total < 342) return 8;
        if (a.total > 343 && a.total < 350){
          if (a.fi > 24 && a.la > 24) return 0;
          if (a.fi < 24 && a.la > 24) return 9;
          if (a.fi > 24 && a.la < 24) return 6;
        }
    }


    // let canvas = document.createElement('canvas');
    // document.querySelector('body').appendChild(canvas);
    $('body').append(`<canvas id="captcha-canvas"></canvas>`);
    let ctx = document.querySelector('canvas#captcha-canvas').getContext('2d');
    let img =  document.querySelector('img#captcha-img');
    ctx.drawImage(img, 0, 0, 120, 40, 0, 0, 120, 40);
    let pixels = ctx.getImageData(0, 0, 120, 40).data;
    // console.log(pixels);
    let pix = []; // 定义一维数组
    let j = 0;
    let i = 0;
    let n = 0;
    for (i = 1; i <= 40; i++)
    {
      pix[i] = []; // 将每一个子元素又定义为数组
      for (n = 1; n <= 120; n++)
      {
        let c = 1;
        if (pixels[j] -(-pixels[j + 1]) - (- pixels[j + 2]) >200) {
            c = 0;
        }
        j = j + 4;
        pix[i][n] = c; // 此时pix[i][n]可以看作是一个二级数组
      }
    }
    // 我们得到了二值化后的像素矩阵pix[40][120]
    // console.log(pix);
    let lie = [];
    lie[0] = 0;
    for (i = 1; i <= 120; i++) {
        lie[i] = 0;
        for (n = 1; n <= 40; n++) {
            lie[i] = lie[i] + pix[n][i];
        }
    }
    let ta = [];
    n = 0;
    for (i = 1; i <= 120; i++) {
        if (lie[i] > 0 && lie[i - 1] === 0) {
            n++;
            ta[n] = {};
            ta[n].fi = lie[i];
            ta[n].total = 0;
        }
        if (lie[i] > 0){
            ta[n].total = ta[n].total + lie[i];
        }
        if (lie[i - 1]>0 && lie[i] === 0){
            ta[n].la = lie[i - 1];
        }
    }
    console.log(get_word(ta[1])+' '+get_word(ta[2])+' '+get_word(ta[3])+' '+get_word(ta[4]));
    let val_a = 0;
    let val_b = 0;
    let result = 0;
    val_a = get_word(ta[1]) * 10 - (-get_word(ta[2]));
    val_b = get_word(ta[4]);
    if(get_word(ta[3]) == '+'){
        result = val_a-(-val_b);
    } else {
        result = val_a-val_b;
    }

    console.log(result);

    requestSilver(result);
  }

  /*-----------------------启动脚本-----------------------*/
  setTimeout(launcher, 2000);

  /*-----------------------该脚本的启动函数-----------------------*/

  function launcher() {

    // 如果脚本已经在其他页面运行，则不再运行
    if (localStorage.cheaterFlag) return;

    // 定义脚本标记
    let flag = (new Date()).valueOf();

    render(); // 渲染脚本控件

    /*----------------启动按钮事件----------------*/

    $('button#launcher').click(function () {
      if (localStorage.cheaterFlag) {
        if (localStorage.cheaterFlag == flag) { // 关闭脚本所有功能
          window.onbeforeunload = () => {};

          // 删除脚本启动标志
          delete localStorage.cheaterFlag;
          // 关闭自动领取银瓜子
          (() => {
          	clearTimeout(window.timeoutId);
          	$('.circle-process').remove();
          	$('.treasure-box').css('display', 'block');
          })();
          // 关闭自动参与小电视与活动抽奖
          window.observer.disconnect();
          // 关闭自动兑换经验原石
          // clearInterval(window.intervalId);
          // 关闭重启脚本的timeout
          clearTimeout(window.restartId);

          msg('脚本已关闭');
          $(this).text('启动脚本');
        } else {
          msg('脚本已在其他页面运行', 'error');
        }
      } else { // 启动脚本所有功能

        // 注册关闭当前标签页所触发的事件，删除标记脚本运行的变量
        window.onbeforeunload = function () {
          delete localStorage.cheaterFlag;
        };
        // 设置脚本启动标志
        localStorage.cheaterFlag = flag;

        msg('脚本已启动');
        $(this).text('关闭脚本');

        // 自动签到
        checkin();
        // 自动领银瓜子
        getSilver();
        // 自动参与小电视与活动抽奖
        initMutationObserver();
        // 自动兑换经验原石
        // window.intervalId = setInterval(getRedBagPool, 1000);

        // 新一天的零点自动重启脚本
        window.restartId = setTimeout(() => {
        	$('button#launcher').click();
        	$('button#launcher').click();
        }, 24 * 60 * 60 * 1000 + 1000 - ((Date.now() + 8 * 60 * 60 * 1000) % (24 * 60 * 60 * 1000)));
      }
    });

    /*----------------抽奖结果按钮事件----------------*/

    $('button#result').click(function () {
      let gifts = window.gifts;
      if (gifts) {
        let text = '已抽到：<br>';
        for (let name in gifts) {
          text += `${name} X ${gifts[name]}<br>`;
        }
        msg(text, 'info', 6000);
      } else {
        msg('还没抽到任何东西呢<(︶︿︶)', 'info', 6000);
      }
    });
  }

  /*-----------------------渲染脚本控件-----------------------*/

  function render() {

    /*----------------脚本控件css样式----------------*/

    $('body').append(`
      <style>
      	/*-------------按钮组样式-------------*/
        .s-btn {
          min-width: 80px;
          height: 24px;
          font-size: 12px;
          background-color: #23ade5;
          color: #fff;
          border-radius: 4px;
          position: relative;
          box-sizing: border-box;
          line-height: 1;
          margin: 0;
          padding: 6px 12px;
          border: 0;
          cursor: pointer;
          outline: none;
          overflow: hidden;
        }
        .s-btn:hover {
          background-color: #39b5e7;
        }
        .s-btn:active {
          background-color: #21a4d9;
        }
        .captchaFrame {
          display: none;
        }
        /*-------------时钟进度条-------------*/
				.circle-process, .circle-process * {
					margin: 0;
					padding: 0;
					box-sizing: border-box;
				}
				.circle-process {
					position: relative;
					width: 48px;
					height: 48px;
					cursor: pointer;
				}
				.circle-process .wrapper {
					position: absolute;
					width: 24px;
					height: 48px;
					overflow: hidden;
				}
				.circle-process .left {
					left: 0;
				}
				.circle-process .right {
					right: 0;
				}
				.circle-process .bg-circle {
					position: absolute;
					top: 0;
					width: 48px;
					height: 48px;
					border-radius: 50%;
					border: 3px solid #ccc;
					display: flex;
					justify-content: center;
				}
				#clock {
					display: flex;
					align-items: center;
					color: blue;
				}
				.circle-process .circle {
					position: absolute;
					top: 0;
					width: 48px;
					height: 48px;
					border: 3px solid green;
					border-radius: 50%;
				}
				.circle-process .left-circle {
					left: 0;
					clip: rect(auto, 24px, auto, auto);
				}
				.circle-process .right-circle {
					right: 0;
					clip: rect(auto, auto, auto, 24px);
				}
      </style>
    `);

    /*----------------增加启动按钮----------------*/

    $('div.seeds-wrap').prepend(`
        <div style="display: inline-block;">
          <button id="launcher" class="s-btn">
            <span class="txt">启动脚本</span>
          </button>
        </div>
    `);

    /*----------------增加抽奖结果按钮----------------*/

    $('div.seeds-wrap').prepend(`
        <div style="display: inline-block;">
          <button id="result" class="s-btn">
            <span class="txt">抽奖结果</span>
          </button>
        </div>
    `);
  }

  /*-----------------------初始化监听对象-----------------------*/

  function initMutationObserver() {
    window.observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (/small-tv|news/.test($(node).prop('class'))) { // 小电视或活动抽奖消息(忽略弹幕)
            let text = $(node).find('div a').text();
            let roomId = text.match(/【(?=(\d+)】)/);
            if (roomId) raffle(roomId[1], $(node).prop('class'));
          }
        });
      });
    });
    window.observer.observe($('div#chat-history-list')[0], { childList: true });
  }

  /*-----------------------自动签到-----------------------*/

  function checkin() {
    // let node = $('#link-navbar-vm > nav  div.checkin-btn.t-center.pointer');
    // if (node) node.click();
    $.ajax({
		type: 'get',
		url: '//api.live.bilibili.com/sign/doSign',
		datatype: 'jsonp',
		crossDomain: true,
			xhrFields: { withCredentials: true },
		success: function (data) {
				if (data.code == 0)
					msg('签到成功，诶嘿嘿o(≧v≦)o~~');
				else
					msg('签到出错了⊙︿⊙', 'error');
    	}
		});
  }

  /*-----------------------自动领取银瓜子-----------------------*/

  function getSilver() {
    msg('开始自动领取银瓜子...');
    // 渲染时钟进度条
		let treasure_box = $('.treasure-box');
		let container = $('.section.left-part>.dp-table-cell');
		treasure_box.css('display', 'none');
		container.append(`
			<div class="circle-process">
				<div class="bg-circle">
					<span id="clock">00:00</span>
				</div>
				<div class="wrapper left">
					<div class="circle left-circle"></div>
				</div>
				<div class="wrapper right">
					<div class="circle right-circle"></div>
				</div>
			</div>
		`);
    // 更改域名以解决跨域问题
    document.domain = 'bilibili.com';
    // 获取当前的任务
    getCurrentTask();
  }

  function getCurrentTask() {
    $.ajax({
      type: 'get',
      // url: '//api.live.bilibili.com/FreeSilver/getCurrentTask',
      url: '//api.live.bilibili.com/lottery/v1/SilverBox/getCurrentTask',
      data: {},
      datatype: 'jsonp',
      crossDomain: true,
      xhrFields: { withCredentials: true },
      success: function (data) {
        if (data.code == 0) {
          let { minute, time_end, time_start, times } = data.data;
          let delay = time_end - time_start; // 单位：秒
          timeKeeping(delay);
          delay = (delay + 1) * 1000; // 单位：毫秒  多等待1秒

          window.timeoutId = setTimeout(function () {
            console.log('进入验证码识别回调过程...');
            $.ajax({
            	type: 'get',
            	url: '//api.live.bilibili.com/lottery/v1/SilverBox/getCaptcha',
            	data: { ts: Date.now() },
            	datatype: 'jsonp',
            	crossDomain: true,
            	xhrFields: { withCredentials: true },
            	success: function (data) {
            		if (data.code == 0) {
            			const url = data.data.img;
            			$("body").append(`<img id="captcha-img" src="${url}"></img>`);
            			setTimeout(ls, 1000);
            		} else {
            			msg('请求验证码出错啦', 'error');
            		}
            	}
            });
          }, delay);

          window.minute = minute;
          msg(`第${times}轮，第${parseInt(minute) / 3}次，需等待${minute}分钟`);
					// 更新进度条点击事件
					$('.circle-process').unbind('click');
					$('.circle-process').click(() => {
						msg(`第${times}轮，第${parseInt(minute) / 3}次`);
					});
        } else {
          msg('今天的银瓜子已经领完啦~');
					// 更新进度条点击事件
					$('.circle-process').unbind('click');
					$('.circle-process').click(() => {
						msg('今天的银瓜子已经领完啦~');
					});
        }
      }
    });
  }

  window.requestSilver = function (result) {
    let second = Date.now() / 1000;
    $.ajax({
      type: 'get',
      // url: '//api.live.bilibili.com/FreeSilver/getAward',
      url: '//api.live.bilibili.com/lottery/v1/SilverBox/getAward',
      data: {
          time_start: (second - window.minute * 60),
          end_time: second,
          captcha: result
      },
      datatype: 'jsonp',
      crossDomain:true,
      xhrFields: { withCredentials: true },
      success: function (data) {
        $('img#captcha-img').remove();
        $('canvas#captcha-canvas').remove();
        if (data.code == 0) {
          let { awardSilver, isEnd, silver } = data.data;
          msg(`成功领取了${awardSilver}个银瓜子`, 'success', 6000);
          if (isEnd == 0) getCurrentTask();
          else {
          	msg('今天的银瓜子已经领完啦~');
          	// 更新进度条点击事件
						$('.circle-process').unbind('click');
						$('.circle-process').click(() => {
							msg('今天的银瓜子已经领完啦~');
						});
          }
        } else {
          msg('自动领瓜子出错啦！！', 'error');
        }
      },
      error: function () {
        msg('自动领瓜子出错啦！！', 'error');
      }
    });
  };

  /*----------------进度条渲染动画----------------*/

	function timeKeeping(time) {
		let startTime = Date.now() / 1000;
		let text = $('.circle-process>.bg-circle>#clock');
		let rightCircle = $('.right-circle');
		let leftCircle = $('.left-circle');
		window.clo = setInterval(() => {
			let passTime = Date.now() / 1000 - startTime;
			if (passTime >= time) {
				clearInterval(window.clo);
				passTime = time;
			}
			let minute = Math.floor(passTime / 60);
			minute = minute < 10 ? '0' + minute : minute;
			let second = parseInt(passTime - minute * 60);
			second = second < 10 ? '0' + second : second;
			text.text(`${minute}:${second}`);
			if (passTime <= (time / 2)) {
				rightCircle.prop('style', `transform: rotate(${-180 + (passTime / time) * 360}deg);`);
				leftCircle.prop('style', 'transform: rotate(180deg);');
			} else {
				leftCircle.prop('style', `transform: rotate(${180 + (passTime - time / 2) / time * 360}deg);`);
				rightCircle.prop('style', 'transform: rotate(0deg);');
			}
		}, 30);
	}

  /*-----------------------抽奖函数-----------------------*/

  function raffle(roomId, type) {
    if (/small-tv/.test(type)) {
      let delay = (parseInt(Math.random() * 20) + 1) * 1000; // 随机20秒以内延迟
      setTimeout(() => { smallTVInit(roomId); }, delay);
      // smallTVInit(roomId);
    } else if (/news/.test(type)) {
      let delay = (parseInt(Math.random() * 10) + 1) * 1000; // 随机10秒以内延迟
      setTimeout(() => { lotteryInit(roomId); }, delay);
      // lotteryInit(roomId);
    }
  }

  /*-----------------------小电视抽奖-----------------------*/

  function smallTVInit(roomId) {
    $.ajax({
      type: 'get',
      url: '//api.live.bilibili.com/room/v1/Room/room_init',
      data: { id: roomId },
      datatype: 'jsonp',
      crossDomain: true,
      xhrFields: { withCredentials: true },
      success: function (data) {
      	if (typeof data == 'string') data = JSON.parse(data);
        if (data.code == 0) {
          msg('正在帮你参与小电视抽奖啦~');
          let { room_id, short_id } = data.data;
          if (short_id == 0) short_id = room_id;
          smallTVCheck(room_id,short_id);
        } else {
          msg('在获取房间信息的时候出错！', 'caution', 5000);
          console.log(data);
        }
      }
    });
  }

  function smallTVCheck(room_id, short_id) {
    $.ajax({
      type: 'get',
      url: '//api.live.bilibili.com/gift/v2/smalltv/check',
      data: { roomid: room_id },
      datatype: 'jsonp',
      crossDomain: true,
      xhrFields: { withCredentials: true },
      success: function (data) {
      	if (typeof data == 'string') data = JSON.parse(data);
        if(data.code == 0){
          let i = 0;
          for(i = 0; i < data.data.length; i++) {
            let { raffleId } = data.data[i];
            if(data.data[i].status == 1)
              smallTVJoin(room_id, raffleId, short_id);
          }
          if(i == 0) {
            msg('在查找小电视的时候失败，是不是网速太慢了？','caution',5000);
          }
        } else {
          msg('在查找小电视的时候出错', 'caution', 5000);
          console.log(data);
        }
      }
    });
  }

  function smallTVJoin(room_id, raffleId, short_id) {
    $.ajax({
      type: 'get',
      url: '//api.live.bilibili.com/gift/v2/smalltv/join',
      data: {
        roomid: room_id,
        raffleId: raffleId
      },
      datatype: 'jsonp',
      crossDomain: true,
      xhrFields: { withCredentials: true },
      success: function (data) {
      	if (typeof data == 'string') data = JSON.parse(data);
        if (data.code == 0) {
          let restime = parseInt(data.data.time) + 30; // 额外等半分钟
          msg(`成功参加了直播间【${short_id}】的小电视抽奖，还有 ${restime} 秒开奖`, 'success', 5000);
          restime *= 1000;
          setTimeout(function() {
            smallTVNotice(room_id, raffleId, short_id);
          }, restime);
        } else {
          if (data.code != -400)
            msg('参加小电视抽奖失败了o(︶︿︶)o ','caution', 5000);
          console.log(data);
        }
      }
    });
  }

  function smallTVNotice(room_id, raffleId, short_id, steps) {
    steps = steps || 0;
    $.ajax({
      type: 'get',
      url: '//api.live.bilibili.com/gift/v2/smalltv/notice',
      data: {
          roomid: room_id,
          raffleId: raffleId
      },
      datatype: 'jsonp',
      crossDomain: true,
      xhrFields: { withCredentials: true },
      success: function (data) {
      	if (typeof data == 'string') data = JSON.parse(data);
        if (data.code == 0){
          let { gift_name, gift_num, gift_from } = data.data;
          if (gift_num) {
              giftCount(gift_name, gift_num);
              msg(`你从直播间【${short_id}】抽到了【${gift_from}】赠送的礼物：${gift_name} X ${gift_num} !`, 'success', 5000);
          }
        } else {
          if (steps <= 3){ // 最多检查四次，每次间隔半分钟
            setTimeout(function() {
                smallTVNotice(room_id, raffleId, short_id, steps + 1);
            }, 30000);
          } else {
            msg('获取中奖信息时出错！', 'caution', 5000);
            console.log(data);
          }
        }
      }
    });
  }

  /*-----------------------(新春)活动抽奖-----------------------*/

  function lotteryInit(roomId) {
    $.ajax({
      type: 'get',
      url: '//api.live.bilibili.com/room/v1/Room/room_init',
      data: { id: roomId },
      datatype: 'jsonp',
      crossDomain:true,
      xhrFields: { withCredentials: true },
      success: function (data) {
      	if (typeof data == 'string') data = JSON.parse(data);
        if (data.code == 0) {
          msg('正在帮你参与活动抽奖啦~');
          let { room_id, short_id } = data.data;
          if (short_id == 0) short_id = room_id;
          lotteryCheck(room_id);
        } else {
          msg('在获取房间信息的时候出错！', 'caution', 5000);
         	console.log(data);
        }
      }
    });
  }

  function lotteryCheck(room_id) {
    $.ajax({
      type: 'get',
      url: '//api.live.bilibili.com/activity/v1/Raffle/check',
      data: { roomid: room_id },
      datatype: 'jsonp',
      crossDomain: true,
      xhrFields: { withCredentials: true },
      success: function (data) {
      	if (typeof data == 'string') data = JSON.parse(data);
        if (data.code == 0) {
          let i = 0;
          for (i = 0; i < data.data.length; i++) {
            let restime = parseInt(data.data[i].time) + 30; // 额外等半分钟
            let { raffleId } = data.data[i];
            if (data.data[i].status == 1)
              lotteryJoin(room_id, raffleId, restime);
          }
          if (i == 0){
            msg('在查找活动的时候失败，是不是网速太慢了？', 'caution', 5000);
          }
        } else {
          msg('在查找活动的时候出错', 'caution', 5000);
          console.log(data);
        }
      }
    });
  }

  function lotteryJoin(room_id, raffleId, restime) {
    $.ajax({
      type: 'get',
      url: '//api.live.bilibili.com/activity/v1/Raffle/join',
      data: {
        roomid:room_id,
        raffleId:raffleId
      },
      datatype: 'jsonp',
      crossDomain: true,
      xhrFields: { withCredentials: true },
      success: function (data) {
      	if (typeof data == 'string') data = JSON.parse(data);
        if (data.code == 0) {
          msg(`成功参加了直播间【${room_id}】的活动抽奖，还有 ${restime} 秒开奖`, 'success', 5000);
          restime *= 1000;
          setTimeout(function(){
            lotteryNotice(room_id, raffleId);
          }, restime);
        } else {
          if (data.code!=-400)
            msg('参加活动抽奖失败了o(︶︿︶)o ', 'caution', 5000);
          console.log(data);
        }
      }
    });
  }

  function lotteryNotice(room_id, raffleId, steps) {
    steps = steps || 0;
    $.ajax({
      type: 'get',
      url: '//api.live.bilibili.com/activity/v1/Raffle/notice',
      data: {
        roomid: room_id,
        raffleId: raffleId
      },
      datatype: 'jsonp',
      crossDomain: true,
      xhrFields: { withCredentials: true },
      success: function (data) {
      	if (typeof data == 'string') data = JSON.parse(data);
        if (data.code == 0) {
          let { gift_name, gift_num, gift_from } = data.data;
          if (gift_num) {
            giftCount(gift_name,gift_num);
            msg(`你从直播间【${room_id}】抽到了【${gift_from}】赠送的礼物：${gift_name} X ${gift_num} !`, 'success', 5000);
          }
        } else {
            if (steps <= 3) {
                setTimeout(function(){
                    lotteryNotice(room_id, raffleId, steps + 1);
                }, 30000);
            } else {
                msg('获取中奖信息时出错！', 'caution', 5000);
                console.log(data);
            }
        }
      }
    });
  }

  /*-----------------------自动兑换礼物-----------------------*/

  function getRedBagPool() {
    $.ajax({
      type: 'get',
      url: '//api.live.bilibili.com/activity/v1/NewSpring/redBagPool',
      datatype: 'jsonp',
      crossDomain:true,
      xhrFields: { withCredentials: true },
      success: function (data) {
        if (data.code == 0) {
          let num = data.data.red_bag_num;
          $('i.bag-num').first().text(num); // 更新该页面显示的红包个数
          for (let i in data.data.pool_list) {
            let item = data.data.pool_list[i];
            if (item.award_id == 'stuff-1' && parseInt(item.stock_num) > 0)
                redBagExchange(num);
          }
        } else {
          msg('获取红包池出错', 'error');
          console.log(data);
        }
      }
    });
  }
  function redBagExchange(red_bag_num) {
    let num = parseInt(parseInt(red_bag_num) / 30); // 计算当前所拥有的红包可以兑换多少个经验原石
    if (num <= 0) return; // 红包太少，不足以兑换经验原石
    msg(`目前拥有红包${red_bag_num}个，尝试兑换${num}个经验原石...`);
    $.ajax({
      type: 'get',
      url: '//api.live.bilibili.com/activity/v1/NewSpring/redBagExchange',
      data: {
        award_id: 'stuff-1', // 经验原石
        exchange_num: num
      },
      datatype: 'jsonp',
      crossDomain:true,
      xhrFields: { withCredentials: true },
      success: function (data) {
        if (data.code == 0) {
          msg(`成功兑换${num}个经验原石`, 'success', 6000);
        } else {
          msg('兑换经验原石时出错', 'error');
          console.log(data);
        }
      }
    });
  }

  /*-----------------------辅助函数-----------------------*/

  /**
   * Call this function to show a message
   *
   * @param {string} text Message content
   * @param {string} type Message type
   * @param {number} time Duration
   */
  function msg(text,type,time){
    text = text || 'This is a message';
    type = type || 'info';
    time = time || 2000;

    console.log(text);

    let id = (new Date()).valueOf();

    $('body').append(`
      <div class="link-toast ${type}" msg-id="${id}" style="left: 400px; top: 500px;">
        <span class="toast-text">${text}</span>
      </div>
    `);

    let ele = $(`div.link-toast[msg-id=${id}]`);
    ele.slideDown('normal', function() {
      setTimeout(function() {
        ele.fadeOut('normal',function() {
          ele.remove();
        });
      }, time);
    });
  }


  function giftCount(gift_name, gift_number){
    if (window.gifts == undefined) {
      window.gifts = [];
    }
    if (window.gifts[gift_name] == undefined) {
      window.gifts[gift_name] = 0;
    }
    window.gifts[gift_name] = window.gifts[gift_name] + gift_number;
  }

})();