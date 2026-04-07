'use strict';

// ================== 移动 AI 模块到右侧栏（移动后折叠）==================
// 此函数整合了原先的 moveAIToRight 及其所有辅助函数 (foldAIModule, foldWendaGenerate, foldNewBaikanIndex, createCustomFoldButton, updateFoldButtonText)
// ================== 移动 AI 模块到右侧栏（移动后折叠） ==================

/**
 * 将页面左侧的 AI 模块（如“新文心一言”、“智能回答”等）移动到指定的右侧栏容器中。
 * 移动后，会根据用户的设置决定是否显示该模块，并为模块添加折叠功能。
 *
 * @param {HTMLElement} right_col - 右侧栏的 DOM 元素。
 * @param {HTMLElement} left_col - 左侧栏的 DOM 元素（主要供其他函数使用，此函数内未直接使用）。
 * @param {URLSearchParams} params - URL 查询参数对象。
 */
async function moveAIToRight(right_col, left_col, params) {
    // 1. 在右侧栏创建一个容器来放置 AI 模块
    const right_html = `<div class="baidu_ai"> <!-- 百度 AI 模块 --> <!-- 填 --> <hr/> </div>`;
    right_col.insertAdjacentHTML('beforeend', right_html);

    // ========== 内部辅助函数定义 ==========
    // 创建一个自定义的折叠按钮
    function createCustomFoldButton(text) {
        const btn = document.createElement('span');
        btn.textContent = text;
        btn.style.cursor = 'pointer';
        btn.style.color = '#4e6ef2'; // 使用原始颜色
        btn.style.marginLeft = '10px';
        btn.style.fontSize = '14px';
        btn.style.userSelect = 'none';
        return btn;
    }

    // 更新 wenda_generate 类型原生折叠按钮的文字和图标
    function updateFoldButtonText(btn, isHidden) {
        const textSpan = btn.querySelector('.cos-fold-switch-text');
        const icon = btn.querySelector('.cos-icon');
        if (textSpan) textSpan.textContent = isHidden ? '展开' : '折叠';
        if (icon) icon.className = isHidden ? 'cos-icon cos-icon-down' : 'cos-icon cos-icon-up';
    }

    // 折叠 wenda_generate 类型的模块
    function foldWendaGenerate(aiDiv) {
        const header = aiDiv.querySelector('.header_620nA');
        const content = aiDiv.querySelector('.content-container_6NKPM');
        const funcArea = aiDiv.querySelector('.cosd-search-header-functional-area');
        // 注意：根据 AI情况2.txt，互动区域可能是 .interaction_1QalB
        // 但根据 AI情况2.txt 的实际HTML结构，互动区域似乎是在折叠按钮下方，可能不在初始可见区域内，或者其选择器不同。
        // 为了兼容，我们仍然尝试查找并隐藏它。
        const interaction = aiDiv.querySelector('.interaction_1QalB');
        if (!header || !content || !funcArea) {
            console.warn('WendaGenerate module missing required elements for folding.');
            return;
        }

        // 隐藏互动区域 (如果存在)
        if (interaction) {
            interaction.style.display = 'none';
        }

        // 尝试查找并复用原有的折叠按钮
        let foldBtn = aiDiv.querySelector('.wenda-general-fold-switch_7six0 .cosd-fold-switch');
        if (foldBtn) {
            // 确保按钮在功能区内部
            funcArea.appendChild(foldBtn);
            // 为了防止事件监听器丢失，克隆并替换按钮
            const newBtn = foldBtn.cloneNode(true);
            foldBtn.parentNode.replaceChild(newBtn, foldBtn);
            foldBtn = newBtn;
            foldBtn.style.marginLeft = '8px';
            foldBtn.style.display = 'inline-flex';
            foldBtn.style.alignItems = 'center';
        } else {
            // 如果没有原生按钮，则创建一个自定义按钮
            foldBtn = createCustomFoldButton('展开');
            funcArea.appendChild(foldBtn);
        }

        // 初始状态设为隐藏
        content.style.display = 'none';
        updateFoldButtonText(foldBtn, true);

        // 为折叠按钮添加点击事件
        foldBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? '' : 'none';
            // 如果存在互动区域，也同步其显示/隐藏状态
            if (interaction) {
                 interaction.style.display = isHidden ? '' : 'none';
            }
            updateFoldButtonText(foldBtn, !isHidden);
        });
    }

    // 折叠 new_baikan_index 类型的模块
    function foldNewBaikanIndex(aiDiv) {
        const header = aiDiv.querySelector('.cosd-search-header');
        const content = aiDiv.querySelector('.content-container_64QCb');
        // 注意：根据 AI情况1.txt，互动区域是 .interact-container_440HL
        const interaction = aiDiv.querySelector('.interact-container_440HL');
        if (!header || !content) {
             console.warn('NewBaikanIndex module missing required elements for folding.');
            return;
        }

        // 初始状态设为隐藏
        content.style.display = 'none';
        if (interaction) {
             interaction.style.display = 'none';
        }

        // 创建并添加自定义折叠按钮
        const foldBtn = createCustomFoldButton('展开');
        const funcArea = header.querySelector('.cosd-search-header-functional-area');
        if (funcArea) {
            funcArea.appendChild(foldBtn);
        } else {
            // 如果功能区不存在，则直接加到头部
            header.appendChild(foldBtn);
        }

        // 为折叠按钮添加点击事件
        foldBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? '' : 'none';
            if (interaction) {
                 interaction.style.display = isHidden ? '' : 'none';
            }
            foldBtn.textContent = isHidden ? '折叠' : '展开';
        });

        // 删除AI模块中的广告（保留原有逻辑）
        document.querySelectorAll('div.cos-space-mt-lg[disable-jump="true"][rl-type="stop"][data-show-ext="{}"]')
            .forEach(ad => ad.remove());
    }

    // ========== 主逻辑 ==========
    // 1. 读取用户设置
    // const result = await chrome.storage.sync.get(['show_baidu_ai']);
    // const showAI = result.show_baidu_ai !== false; // 默认 true
    const showAI = true;

    // 2. 查找页面上的 AI 模块和右侧栏的容器
    const aiDiv = document.querySelector('div[tpl="wenda_generate"], div[tpl="new_baikan_index"]');
    const baidu_ai_area = document.querySelector('.baidu_ai');

    // 3. 根据用户设置决定行为
    if (!showAI) {
        // 如果设置为不显示，删除页面上存在的模块和右侧栏的空容器
        if (aiDiv) aiDiv.remove();
        if (baidu_ai_area) baidu_ai_area.remove();
        return; // 结束函数
    }

    // 4. 检查必要元素是否存在
    if (!aiDiv) {
        // 页面上没有 AI 模块，无需操作，也可以选择删除空的右侧栏容器
        if (baidu_ai_area) baidu_ai_area.remove();
        return;
    }
    if (!baidu_ai_area) {
        // 右侧栏容器不存在，无法移动，给出警告
        console.warn('缺少 .baidu_ai 容器，无法移动 AI 模块');
        return;
    }

    // 5. 检查是否已经移动过
    if (baidu_ai_area.contains(aiDiv)) {
        // 如果 AI 模块已经在右侧栏的容器里了，就不重复移动
        return;
    }

    // 6. 执行移动和折叠操作
    // 首先点击原模块的折叠开关以确保其处于激活状态（以便正确获取内容，特别是对于 wenda_generate）
    const activationSwitch = aiDiv.querySelector("div.cos-fold-switch-context");
    if (activationSwitch) {
        // 使用 dispatchEvent 触发点击事件
        const clickEvent = new Event('click', { bubbles: true });
        activationSwitch.dispatchEvent(clickEvent);
    }

    // 将 AI 模块移动到右侧栏的容器中
    baidu_ai_area.insertAdjacentElement('afterbegin', aiDiv);
    // 设置样式以适应右侧栏宽度
    aiDiv.style.width = '100%';
    aiDiv.style.margin = '0';

    // 7. 根据模块的 tpl 属性判断类型并应用相应的折叠逻辑
    const tpl = aiDiv.getAttribute('tpl');
    if (tpl === 'wenda_generate') {
        foldWendaGenerate(aiDiv);
    } else if (tpl === 'new_baikan_index') {
        foldNewBaikanIndex(aiDiv);
    }
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
        else if (item.id === 3) moveAIToRight(right_col, left_col, params);
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