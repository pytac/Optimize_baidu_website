'use strict';

// ================== 移动 AI 模块到右侧栏（移动后折叠）==================
// 此函数整合了原先的 moveAIToRight 及其所有辅助函数 (foldAIModule, foldWendaGenerate, foldNewBaikanIndex, createCustomFoldButton, updateFoldButtonText)
// ================== 移动 AI 模块到右侧栏（移动后折叠） ==================

async function moveAIToRight(right_col, left_col, params) {
    // 添加右侧栏 div
    const innerhtml = `
    <div class="baidu_ai">
        <!-- 百度 AI 模块 -->
        <!-- 填 -->
        <hr/>
    </div>
    `;
    right_col.insertAdjacentHTML('beforeend', innerhtml);


    // 内部辅助函数：创建自定义折叠按钮
    function createCustomFoldButton(text) {
        const btn = document.createElement('span');
        btn.textContent = text;
        btn.style.cursor = 'pointer';
        btn.style.color = '#4e6ef2';
        btn.style.marginLeft = '10px';
        btn.style.fontSize = '14px';
        btn.style.userSelect = 'none';
        return btn;
    }

    // 内部辅助函数：更新原生折叠按钮的文字和图标
    function updateFoldButtonText(btn, isHidden) {
        const textSpan = btn.querySelector('.cos-fold-switch-text');
        const icon = btn.querySelector('.cos-icon');
        if (textSpan) textSpan.textContent = isHidden ? '展开' : '折叠';
        if (icon) icon.className = isHidden ? 'cos-icon cos-icon-down' : 'cos-icon cos-icon-up';
    }

    // 折叠 wenda_generate 模块
    function foldWendaGenerate(aiDiv) {
        const header = aiDiv.querySelector('.header_620nA');
        const content = aiDiv.querySelector('.content-container_6NKPM');
        const funcArea = aiDiv.querySelector('.cosd-search-header-functional-area');
        const interaction = aiDiv.querySelector('.interaction_1QalB');
        if (!header || !content || !funcArea) return;

        if (interaction) interaction.style.display = 'none';

        let foldBtn = aiDiv.querySelector('.wenda-general-fold-switch_7six0 .cosd-fold-switch');
        if (foldBtn) {
            funcArea.appendChild(foldBtn);
            const newBtn = foldBtn.cloneNode(true);
            foldBtn.parentNode.replaceChild(newBtn, foldBtn);
            foldBtn = newBtn;
            foldBtn.style.marginLeft = '8px';
            foldBtn.style.display = 'inline-flex';
            foldBtn.style.alignItems = 'center';
        } else {
            foldBtn = createCustomFoldButton('展开');
            funcArea.appendChild(foldBtn);
        }

        content.style.display = 'none';
        updateFoldButtonText(foldBtn, true);

        foldBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? '' : 'none';
            updateFoldButtonText(foldBtn, !isHidden);
        });
    }

    // 折叠 new_baikan_index 模块
    function foldNewBaikanIndex(aiDiv) {
        const header = aiDiv.querySelector('.cosd-search-header');
        const content = aiDiv.querySelector('.content-container_64QCb');
        const interaction = aiDiv.querySelector('.interact-container_440HL');
        if (!header || !content) return;

        content.style.display = 'none';
        if (interaction) interaction.style.display = 'none';

        const foldBtn = createCustomFoldButton('展开');
        const funcArea = header.querySelector('.cosd-search-header-functional-area');
        if (funcArea) funcArea.appendChild(foldBtn);
        else header.appendChild(foldBtn);

        foldBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? '' : 'none';
            if (interaction) interaction.style.display = isHidden ? '' : 'none';
            foldBtn.textContent = isHidden ? '折叠' : '展开';
        });

        // 删除AI中的广告
        document.querySelectorAll('div.cos-space-mt-lg[disable-jump="true"][rl-type="stop"][data-show-ext="{}"]')
            .forEach(ad => ad.remove());
    }

    // 异步折叠入口
    async function foldAIModule(aiDiv) {
        if (!aiDiv) return;
        // 读取开关状态，决定是否保留或删除
        const result = await chrome.storage.sync.get(['show_baidu_ai']);
        const showAI = result.show_baidu_ai !== false;
        if (!showAI) {
            aiDiv.remove();
            return;
        }
        // 防止重复折叠
        if (aiDiv.dataset.foldProcessed) return;
        aiDiv.dataset.foldProcessed = 'true';

        const tpl = aiDiv.getAttribute('tpl');
        if (tpl === 'wenda_generate') foldWendaGenerate(aiDiv);
        else if (tpl === 'new_baikan_index') foldNewBaikanIndex(aiDiv);
    }

    // ========== 主逻辑 ==========
    // 1. 读取开关状态
    const result = await chrome.storage.sync.get(['show_baidu_ai']);
    const showAI = result.show_baidu_ai !== false;  // 默认 true

    // 2. 查找元素
    const aiDiv = document.querySelector('div[tpl="wenda_generate"], div[tpl="new_baikan_index"]');
    const baidu_ai_area = document.querySelector('.baidu_ai');

    // 3. 根据开关决定行为
    if (!showAI) {
        // 开关关闭：删除所有相关模块
        if (aiDiv) aiDiv.remove();
        if (baidu_ai_area) baidu_ai_area.remove();
        return;
    }

    // 开关打开：检查元素是否存在
    if (!aiDiv) {
        // 没有 AI 模块，删除空容器（可选）
        if (baidu_ai_area) baidu_ai_area.remove();
        return;
    }
    if (!baidu_ai_area) {
        // 右侧栏容器不存在，无法移动
        console.warn('缺少 .baidu_ai 容器');
        return;
    }
    if (baidu_ai_area.contains(aiDiv)) return; // 已移动过

    // 4. 移动并折叠
    aiDiv.querySelector("div.cos-fold-switch-context").dispatchEvent(new Event('click')); // 激活
    baidu_ai_area.insertAdjacentElement('afterbegin', aiDiv);
    aiDiv.style.width = '100%';
    aiDiv.style.margin = '0';
    
    await foldAIModule(aiDiv);
}

function extract_things(right_col, left_col, params){
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
    const guanwang = left_col.querySelector('a[href= "https://aiqicha.baidu.com/feedback/official?from=baidu &type=gw "]')?.closest( ".c-container ");
    console.log( "guanwang: ", guanwang);
    if (guanwang) {
        // console.log( ");
        const link = guanwang.querySelector( ".sc-link ")?.href;
        if (link) {
            const target = right_col.querySelector('.extract_guanwang');
            if (target) target.innerHTML =  `跳转:` `<a href="${link}">${guanwang.querySelector(".sc-link").textContent}</a>` ;
        }
    }
    // 翻译处理
    const translate = left_col.querySelector( ".word-fy-card_604a5 ")?.closest( ".c-container ");
    console.log( "translate: ", translate);
    if (translate) {
        translate.style[ "scrollMarginTop "] = '80px';
        const target = right_col.querySelector('.extract_translate');
        if (target) {
            target.innerHTML = `定位: <a href= "javascript:void(0); ">${translate.querySelector( ".cosc-title-slot ").textContent} </a >`;
            target.onclick = () => translate.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // 百度百科
    const baike = left_col.querySelector( ".is-entry_4m0sD ")?.closest( ".c-container ");
    console.log( "baike: ", baike);
    if (baike) {
        baike.style[ "scrollMarginTop "] = '80px';

        const link = baike.querySelector( ".sc-link ");
        const text = link?.textContent;
        if (link) {
            const target = right_col.querySelector('.extract_baike');
            if (target){
                target.innerHTML = `定位: <a class= "baike_pos " href= "javascript:void(0); ">${text} </a > &nbsp;或 &nbsp; <a href= "${link.href} " >直接跳转 </a >`;
                target.querySelector( ".baike_pos ").onclick = () => baike.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
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
        else if (item.id === 2) moveAIToRight(right_col, left_col, params);
        else if (item.id === 3) core_ai(right_col, left_col, params);
    }
    right_col.dataset.finished = 'true';
    console.log("right_col.dataset.finished:",right_col.dataset.finished);
});





    // end code here ------------------
});