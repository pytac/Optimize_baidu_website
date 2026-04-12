'use strict';


function my_moveAIToRight(right_col,left_col,params){
    const right_html = `<div class="baidu_ai"> <!-- 百度 AI 模块 --> <!-- 填 --> <hr/> </div>`;
    right_col.insertAdjacentHTML('beforeend', right_html);

    // main
    const aiDiv = document.querySelector('div[tpl="wenda_generate"], div[tpl="new_baikan_index"]');
    if (!aiDiv) {
        return;
    }
    // 移动到右侧栏
    right_col.querySelector('.baidu_ai').insertAdjacentElement('afterbegin', aiDiv);
}

async function extract_things(right_col, left_col, params){
    // 添加右侧栏 div
    const innerhtml=`
    <div class="extract">
        <!-- 提取摘要模块 -->
        <h3>从搜索结果中提取信息:</h3>
        <p>官网:<span class="extract_guanwang">未找到</span></p>    <!-- 填 -->
        <p>翻译:<span class="extract_translate">未找到</span></p>   <!-- 填 -->
        <p>百度百科:<span class="extract_baike">未找到</span></p>   <!-- 填 <a href=javascript:void(0);/> 或 <a/>直接跳转-->
        <hr/>
    </div>
    `;
    right_col.insertAdjacentHTML('beforeend', innerhtml);

    // 官网处理
    const guanwang = left_col.querySelector('a[href="https://aiqicha.baidu.com/feedback/official?from=baidu&type=gw"]')?.closest( ".c-container");
    console.log( "guanwang: ", guanwang);
    if (guanwang) {
        const link = guanwang.querySelector( ".sc-link ")?.href;
        if (link) {
            const target = right_col.querySelector('.extract_guanwang');
            if (target) target.innerHTML =  `跳转: <a href="${link}">${guanwang.querySelector(".sc-link").textContent}</a>` ;
        }
    }
    // 翻译处理
    const translate = left_col.querySelector( ".word-fy-card_604a5 ")?.closest( ".c-container ");
    // console.log( "translate: ", translate);
    if (translate) {
        translate.style[ "scrollMarginTop "] = '80px';
        const target = right_col.querySelector('.extract_translate');
        if (target) {
            target.innerHTML = `定位: <a href= "javascript:void(0); ">${translate.querySelector( ".cosc-title-slot ").textContent} </a>`;
            target.onclick = () => translate.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // 百度百科
    const baike = left_col.querySelector( ".is-entry_4m0sD ")?.closest( ".c-container ");
    // console.log( "baike: ", baike);
    if (baike) {
        baike.style[ "scrollMarginTop "] = '80px';

        const link = baike.querySelector( ".sc-link ");
        const text = link?.textContent;
        if (link) {
            const target = right_col.querySelector('.extract_baike');
            if (target){
                target.innerHTML = `定位: <a class= "baike_pos " href= "javascript:void(0); ">${text} </a > &nbsp;或 &nbsp; <a href="${link.href}">直接跳转 </a >`;
                target.querySelector( ".baike_pos ").onclick = () => baike.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    // 删除
    await chrome.storage.sync.get(['donot_show_extract_on_2nd_pg'], async (result) => {
        const is_not_show = result.donot_show_extract_on_2nd_pg;
        const pn = Number(params.get("pn")??'0');
        if (is_not_show){
            if (pn !== 0){
                // 不在第一页
                document.querySelector('.extract').remove();
            }
        }
    });
}

function core_ai(right_col, left_col, params){
    // 添加右侧栏 div
    const innerhtml=`
    <div class="core_ai">
        <!-- 内置 AI 模块 -->
        <h3>问 百度AI助手:</h3>
        <div class="inp_bar">
            <select id="ai_model" name="ai_model">
                <option value="llm">普通问答</option>
                <option value="t2i">生成图片</option>
            </select>
            <input type="text" placeholder="输入问题或生成图片"> <!-- 填 '__' -->
            <button href="javascript:void(0);">发送</button>
        </div>
        <hr/>
    </div>
    `;
    right_col.insertAdjacentHTML('beforeend', innerhtml);

    // 问 百度 AI 问答助手
    const ai_ask = right_col.querySelector('.core_ai');
    ai_ask.querySelector("input").placeholder = `输入问题或生成图片`;
    ai_ask.querySelector("button").addEventListener("click", () => {
        let model = ai_ask.querySelector("#ai_model").value;
        let prompt = ai_ask.querySelector("input").value;
        if (!prompt) prompt = decodeURIComponent(params.get('wd'));

        if (model === 'llm') {
            // 普通问答
            window.open(`https://chat.baidu.com/search?word=${prompt}&extParams=%7B%22aPageWord%22%3A%22${params.get('wd')}%22%2C%22enter_type%22%3A%22a_62112%22%2C%22sa%22%3A%22a_62112_doudi%22%7D`, '_blank');
        } else if (model === 't2i') {
            // 生成图片
            window.open(`https://chat.baidu.com/search?enter_type=a_4&extParams=%7B%22openInputMode%22%3A%228%22%2C%22inputPanelExt%22%3A%7B%22showPrompt%22%3Afalse%2C%22showPanel%22%3Afalse%7D%7D&word=${prompt}&sa=re_dl_4`, '_blank');
        }
    });
}

// 监听 main.js 完成事件
document.addEventListener('finished', () => {
    // start code here ----------------


var right_col = document.querySelector('#content_right');
var left_col = document.querySelector('#content_left');
var params = new URLSearchParams(window.location.search);
// if (!right_col || !left_col) return;
if (!right_col) return;
right_col.innerHTML = "";



/*
moveAIToRight(); // 调用合并后的函数
*/


/*
extract_things();
core_ai();
*/

chrome.storage.sync.get('right_list', (result) => {
    const show = result["right_list"]["show"];
    console.log("show:",show);
    for (let item of show) {
        console.log("read info:",item);
        if (item.id === 1) extract_things(right_col, left_col, params);
        else if (item.id === 2) core_ai(right_col, left_col, params);
        else if (item.id === 3) my_moveAIToRight(right_col, left_col, params);
    }
    
    // 如果右侧栏为空，隐藏右侧栏 并 将左侧栏宽度设置为 90%
    if (right_col.children.length === 0){
        right_col.style.display = 'none';
        right_col.style.width = '0';
        left_col.style.width = '90%';
    }
    right_col.dataset.finished = 'true';
});





    // end code here ------------------
});