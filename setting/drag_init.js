(function() {
    // 等待 DOM 加载完成再执行
    function initDrag() {
        // ----- 获取容器元素 -----
        const todoListEl = document.getElementById('list-todo');
        const deleteListEl = document.getElementById('list-delete');

        // 防御性检查：确保两个列表容器都存在
        if (!todoListEl || !deleteListEl) {
            console.warn('拖拽初始化失败：未找到 #list-todo 或 #list-delete 元素，请检查 HTML');
            return;
        }

        // --- 新增：定义拖拽完成后的处理逻辑 ---
        function onDragEnd(evt) {
            console.log("拖拽完成，即将触发 AfterDrag 事件:", evt);

            // 创建一个自定义事件 "AfterDrag"
            // CustomEvent 构造函数允许你传递一个 detail 对象，用于携带自定义数据
            const customEvent = new CustomEvent("AfterDrag", {
                detail: {
                    // 将 SortableJS 事件对象中的关键信息传递出去
                    draggedElement: evt.item,
                    fromContainerId: evt.from.id,
                    toContainerId: evt.to.id,
                    oldIndex: evt.oldIndex,
                    newIndex: evt.newIndex,
                    // 可选：也可以直接传递整个 evt 对象，但通常传递具体需要的数据更好
                    // sortableEvent: evt 
                },
                bubbles: true, // 事件是否向上冒泡
                cancelable: true // 事件是否可以被取消
            });

            // 在 document 上触发这个自定义事件
            // 你可以在其他地方监听这个事件
            document.dispatchEvent(customEvent);

            // console.log("AfterDrag 自定义事件已触发。");
        }


        // ----- 工具函数 ：根据数据创建列表项 (使用 data-item-id 属性存储标识，移除 badge-id) -----
        function createItemElement(id, text) {
            const li = document.createElement('li');
            li.className = 'select_item'; // 改为 select_item，匹配内部样式
            // 使用 data-item-id 属性存储唯一标识，不再显示在页面上
            li.setAttribute('data-item-id', id);
            const textSpan = document.createElement('span');
            textSpan.className = 'select_item-text';
            textSpan.textContent = text;
            // <--- 移除了 badge-id 相关的代码 --->
            li.appendChild(textSpan); // 只附加文本部分
            return li;
        }

        // ----- 核心更新函数：接受 { show: [ {item, content}, ... ], delete: [ {item, content}, ... ] }
        //      完全根据传入的数据重新渲染两个列表，保留拖拽功能
        window.updateBoards = function(data) {
            // 清空两个列表
            todoListEl.innerHTML = '';
            deleteListEl.innerHTML = '';

            // 填充“实现”列表 (show)
            if (Array.isArray(data?.show)) {
                data.show.forEach(itemObj => {
                    // 每个对象应包含 item 和 content 字段
                    const id = itemObj.item ?? String(Math.random());  // 后备id几乎不会触发
                    const content = itemObj.content ?? '无描述';
                    const li = createItemElement(id, content);
                    todoListEl.appendChild(li);
                });
            }

            // 填充“删除”列表 (delete)
            if (Array.isArray(data?.delete)) {
                data.delete.forEach(itemObj => {
                    const id = itemObj.item ?? String(Math.random());
                    const content = itemObj.content ?? '无描述';
                    const li = createItemElement(id, content);
                    deleteListEl.appendChild(li);
                });
            }
        };

        // ----- 初始化 Sortable (共享group，实现跨列拖拽) -----
        new Sortable(todoListEl, {
            group: 'shared',
            animation: 200,
            sort: true,
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag',
            // 添加拖拽结束事件监听器
            onEnd: onDragEnd
        });

        new Sortable(deleteListEl, {
            group: 'shared',
            animation: 200,
            sort: true,
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag',
            // 添加拖拽结束事件监听器
            onEnd: onDragEnd
        });

        // ----- 保留原有的排序信息获取函数 (方便调试/外部调用) -----
        // 注意：获取ID时，现在使用 dataset.itemId
        window.getSortingInfo = function() {
            // 注意：选择器改为 .select_item，以匹配新的类名
            const todoItems = Array.from(document.querySelectorAll('#list-todo .select_item')).map(li => ({
                id: li.dataset.itemId, // 从 data-item-id 属性获取ID
                content: li.querySelector('.select_item-text')?.textContent || li.innerText,
            }));
            const deleteItems = Array.from(document.querySelectorAll('#list-delete .select_item')).map(li => ({
                id: li.dataset.itemId, // 从 data-item-id 属性获取ID
                content: li.querySelector('.select_item-text')?.textContent || li.innerText,
            }));
            return {
                show: todoItems,
                delete: deleteItems
            };
        };

        // ----- 提供一个默认的初始数据，使页面打开时就有示例 -----
        const defaultData = {
            show: [
                { "item": "show_baidu_ai", "content": "百度AI模块" },
                { "item": "extract", "content": "提取模块" },
            ],
            delete: []
        };
        updateBoards(defaultData);
    }

    // 根据文档加载状态执行初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initDrag();
            chrome.storage.sync.get(["right_list"], (result) => {
                updateBoards(result.right_list);
                console.log(result.right_list);
            });
        });
    } else {
        initDrag();
        chrome.storage.sync.get(["right_list"], (result) => {
            updateBoards(result.right_list);
            console.log(result.right_list);
        });
    }
})();

/*
updateBoards: 更新内容
@param {Object} data - { show: [ {item, content}, ... ], delete: [ {item, content}, ... ] }
getSortingInfo: 获取排序信息
@return {Object} - { show: [ {id, content}, ... ], delete: [ {id, content}, ... ] }
*/

// 监听自定义的 AfterDrag 事件，以便在拖拽结束后保存数据
document.addEventListener("AfterDrag", () => {
    const sort = window.getSortingInfo();
    chrome.storage.sync.set({ "right_list": sort });
    console.log("after_drag_sort", sort); // 修改日志标签以便区分
});