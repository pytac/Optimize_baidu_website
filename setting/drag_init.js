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

        // ----- 工具函数：根据数据创建列表项 (使用 select_item 属性存储标识) -----
        function createItemElement(id, text) {
            const li = document.createElement('li');
            li.className = 'select_item'; // 改为 select_item，匹配内部样式
            // 使用自定义属性 select_item 存储唯一标识，避免占用标准 id
            li.setAttribute('select_item', id);
            const textSpan = document.createElement('span');
            textSpan.className = 'select_item-text';
            textSpan.textContent = text;
            const idBadge = document.createElement('span');
            idBadge.className = 'badge-id';
            idBadge.textContent = id;          // 显示id便于识别
            li.appendChild(textSpan);
            li.appendChild(idBadge);
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
            dragClass: 'sortable-drag'
        });

        new Sortable(deleteListEl, {
            group: 'shared',
            animation: 200,
            sort: true,
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag'
        });

        // ----- 提供一个默认的初始数据，使页面打开时就有示例 -----
        const defaultData = {
            show: [
                {"item":"show_baidu_ai","content":"百度AI模块"},
                {"item":"extract","content":"提取模块"},
            ],
            delete: []
        };
        updateBoards(defaultData);

        // ----- 保留原有的排序信息获取函数 (方便调试/外部调用) -----
        window.getSortingInfo = function() {
            // 注意：选择器改为 .select_item，以匹配新的类名
            const todoItems = Array.from(document.querySelectorAll('#list-todo .select_item')).map(li => ({
                id: li.getAttribute('select_item'),
                content: li.querySelector('.select_item-text')?.textContent || li.innerText,
            }));
            const deleteItems = Array.from(document.querySelectorAll('#list-delete .select_item')).map(li => ({
                id: li.getAttribute('select_item'),
                content: li.querySelector('.select_item-text')?.textContent || li.innerText,
            }));
            return {
                show: todoItems,
                delete: deleteItems
            };
        };
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