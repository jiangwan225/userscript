// ==UserScript==
// @id             weiphoneDownlader@ywzhaiqi
// @name           威锋电子书批量下载
// @version        1.0
// @namespace      
// @author         ywzhaiqi
// @description    批量下载威锋论坛的电子书
// @homepageURL    https://greasyfork.org/scripts/668/
// @updateURL      https://greasyfork.org/scripts/668/code.meta.js
// @downloadURL    https://greasyfork.org/scripts/668/code.user.js

// @include        http://bbs.feng.com/read-htm-tid-*.html
// @include        http://bbs.feng.com/thread-htm-fid-*.html
// @include        http://bbs.feng.com/forum.php*
// @run-at         document-end
// @grant          GM_addStyle
// ==/UserScript==

var $ = jQuery = unsafeWindow.jQuery;

var RES = getMStr(function(){
	var html;
	/*
	<div>
		<button id="downloadButton">批量下载</button>
		<div id="batchPublish" style="display: none;">
			<div id="batchHeader">
				<a id="closeButton" href="javascript:return null" style="float:right">关闭</a>
			</div>
			<div id="batchContent">
				<pre id="batchedlink"></pre>
			</div>
		</div>
	</div>
	 */
	var cssText;
	/*
	#downloadButton {
		position:fixed;
		top:80px;
		right:8px;
	}
	#batchPublish {
		position:fixed;
		z-index:1001;
		top:40%;
		left:35%;
		width: 530px;
		background:white;
		border: 3px solid #AAA;
	}
	#batchedlink {
		width: 500px;
		height: 250px;
		overflow: scroll;
	}
	 */
});


var locationHref = location.href;

locationHref.match(/thread-htm-fid|mod=forumdisplay/) != -1 && (function(){

	$('#bbs_top_news, #forum_rules_224').hide();

	var hideText = [
		"网易《迷你西游》手游公测",
		"3D纯正中国风《水浒英雄》",
		"【软件】感恩父母，免费下载：【快速问医生】",
		"【软件】随时随地 移动视频！酷6视频软件介绍",
		"威锋手游控：玩《龙纹三国》",
		"《放开那三国》威锋版火爆上线",
		"《天天爱萌仙》",
		"炉石传说",
		"用同步推",
	];

	// 隐藏置顶广告的行
	$('tbody[id^="stickthread_"]').each(function(row){
		var text = $(this).text();
		for (var i = 0, l = hideText.length; i < l; i++) {
			if (text.indexOf(hideText[i]) != -1) {
				$(this).hide();
				return;
			}
		}
	});
})()

locationHref.match(/read-htm-tid|mod=viewthread/) != -1 && (function(){

	var attachSelector = '.attnm > a, span[id^="attach_"] > a';

	if (jQuery(attachSelector).size() == 0) return;

	var preUrl = location.origin;

	GM_addStyle(RES.cssText)

	jQuery(RES.html).appendTo('body');
	$('#closeButton').click(function(){
		$('#batchPublish').hide();
	})

	jQuery('#downloadButton').click(function(){
		var links = jQuery.makeArray(jQuery(attachSelector));
		var downUrls = [];

		function getDownloadLink() {
			var link = links.shift();
			if (link) {
				var m = link.getAttribute('onclick').match(/jQuery.get\('(.*?)',/);
				if (m) {
					var url = m[1];
					jQuery.get(url, {}, function(data){
						var downUrl = jQuery('<div>').html(data).find('a:first').attr('href');
						downUrl = preUrl + downUrl;
						downUrls.push(downUrl)

						if (links.length == 0) {
							var urls = downUrls.join('\n');

							// console.log(urls);
							$('#batchedlink').html(urls);
							$('#batchPublish').show();

							// 高亮选中文本
							var selection = unsafeWindow.getSelection();
							var range = document.createRange();
							range.selectNodeContents($('#batchedlink')[0]);
							selection.removeAllRanges();
							selection.addRange(range);

							// window.open('data:text/html;charset=utf-8,<pre>' + encodeURIComponent(urls) + '</pre>');
							// alert('已复制' + downUrls.length + '条下载链接')
							return;
						}

						getDownloadLink();
					});
				}
			}
		}

		getDownloadLink()
	});

})()



// 从函数中获取多行注释的字符串
function getMStr(fn) {
    var fnSource = fn.toString();
    var ret = {};
    fnSource = fnSource.replace(/^[^{]+/, '');
    // console.log(fnSource);
    var matched;
    var reg = /var\s+([$\w]+)[\s\S]*?\/\*([\s\S]+?)\*\//g;
    while (matched = reg.exec(fnSource)) {
        // console.log(matched);
        ret[matched[1]] = matched[2];
    };
    
    return ret;
}