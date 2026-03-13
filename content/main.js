'use strict';

// ================== 广告删除函数 ==================
function delete_ad() {
    var search_list = document.querySelectorAll("._3rqxpq2");
    search_list.forEach(function(item) {
        if (item.querySelector(".ec-tuiguang.ecfc-tuiguang.m12mvnb")) {
            if (item.querySelector(".ec-tuiguang.ecfc-tuiguang.m12mvnb").textContent == "广告") {
                item.remove();
            }
        }
    });

    search_list = document.querySelectorAll(".result");
    search_list.forEach(function(item) {
        if (item.querySelector(".m.c-gap-left") != null) {
            if (item.querySelector(".m.c-gap-left").textContent == "广告") {
                item.remove();
            }
        }
    });

    document.querySelectorAll('#content_left > div').forEach((item) => {
        if (item?.classList?.length === 0) {
            item.remove();
        }
    });

    // 猜你想搜
    document.querySelector("[tpl='recommend_list']")?.remove()

    // 翻译中的 精彩视频
    document.querySelector(".video-wrap_312kw")?.parentElement?.remove();
    // 翻译中的 第二方广告
    document.querySelector(".daoliu-con_3XOTP")?.remove();
}


// ================== 初始化右侧栏 ==================
function setupRightBar() {
    const rightCol = document.querySelector('#content_right');

}

// ================== 删除其他烦人元素 ==================
function delete_annoy() {
    // 删除“标签栏”
    document.querySelector('#searchTag')?.remove();

    // 打开“搜索工具”（取消折叠）
    const outer = document.querySelector('.outer_wqJjM');
    if (outer?.classList.contains('new-outer_1rAy8')) {
        outer.classList.remove('new-outer_1rAy8');
    }
    document.querySelector('#tsn_inner')?.style ? (document.querySelector('#tsn_inner').style.top = '0px') : null;

    // 删除“大家还在搜”
    document.querySelector('div[m-name="aladdin-san/app/recommend_list/result_bd1d926"]')?.remove();
    document.querySelector('div.c-color-t.rs-label_ihUhK')?.parentElement?.remove();

    // 删除 ai_ask 模块（用户指定删除）
    document.querySelector('div[tpl="ai_ask"]')?.remove();

    // 删除“听”按钮
    // document.querySelector("div[rl-type='stop']")?.remove();
    // document.querySelector("div.tts-video-continue")?.remove();
}

// 监听 是否启用组件
chrome.storage.sync.get(["on_off_opt"], (result) => {

    console.log(result.on_off_opt??true);  // true -> default_var["on_off_opt"]
    if (! (result.on_off_opt??true) ) {
        return;
    }


function core_function() {

// ================== 初始化 ==================
console.log('开始篡改...');

// let finished = false;
delete_ad();
delete_annoy();

// 输出
// finished = true;
document.dispatchEvent(new CustomEvent('finished'));
console.log('篡改完毕...');

// ================== 初始化 结束 ==================

}
core_function();


// 监听动态变化
const observer = new MutationObserver(() => {
    delete_ad();
    moveAIToRight();

    // 以免死循环
    if ((document.querySelector("#content_right").dataset.finished??'false') !== 'true'){
        core_function();
    }
    console.log('observer 发现 DOM 变化');
    // if (finished) document.querySelector(".output").insertAdjacentHTML("afterbegin", `<p>篡改完毕</p>\n<br>`);
});
observer.observe(document.body, { childList: true, subtree: true });

});

/*
TODO:
优化界面：添加 李逵的玻璃（流体玻璃）
添加百度AI入口 （免费！！又可以加分！！！！）
- 图片: https://chat.baidu.com/search?enter_type=a_4&extParams=%7B%22openInputMode%22%3A%228%22%2C%22inputPanelExt%22%3A%7B%22showPrompt%22%3Afalse%2C%22showPanel%22%3Afalse%7D%7D&word= [qustion] &sa=re_dl_4
- LLM: https://chat.baidu.com/search?word= [question] &extParams=%7B%22aPageWord%22%3A%22%E8%9D%B4%E8%9D%B6%22%2C%22enter_type%22%3A%22a_62112%22%2C%22sa%22%3A%22a_62112_doudi%22%7D

*/