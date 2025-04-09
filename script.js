// 食材数据：包含所有可用食材的分类信息
// 每个食材包含名称和对应的emoji图标
const ingredients = {
    '蔬菜': [
        { name: '生菜', icon: '🥬' },
        { name: '胡萝卜', icon: '🥕' },
        { name: '土豆', icon: '🥔' },
        { name: '西红柿', icon: '🍅' },
        { name: '黄瓜', icon: '🥒' },
        { name: '茄子', icon: '🍆' },
        { name: '青椒', icon: '🫑' },
        { name: '白菜', icon: '🥬' }
    ],
    '肉类': [
        { name: '猪肉', icon: '🥩' },
        { name: '鸡肉', icon: '🍗' },
        { name: '牛肉', icon: '🥩' },
        { name: '羊肉', icon: '🍖' },
        { name: '鱼', icon: '🐟' }
    ],
    '调料': [
        { name: '盐', icon: '🧂' },
        { name: '糖', icon: '🧂' },
        { name: '酱油', icon: '🫗' },
        { name: '醋', icon: '🫗' },
        { name: '蒜', icon: '🧄' },
        { name: '姜', icon: '🫚' },
        { name: '辣椒', icon: '🌶️' },
        { name: '生抽', icon: '🫗' }
    ],
    '主食': [
        { name: '米饭', icon: '🍚' },
        { name: '面条', icon: '🍜' },
        { name: '馒头', icon: '🍞' },
        { name: '饼', icon: '🫓' }
    ]
};

// 存储用户当前选中的食材集合
let selectedIngredients = new Set();

// 当前显示的食材分类，默认为蔬菜
let currentCategory = '蔬菜';

// 获取页面上的DOM元素，用于后续的交互操作
const ingredientsGrid = document.querySelector('.ingredients-grid');
const categoryNav = document.querySelector('.category-nav');
const selectedItems = document.querySelector('.selected-items');
const selectedCount = document.querySelector('.selected-count');
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');
const confirmBtn = document.querySelector('.confirm-btn');

// 渲染食材网格
// @param {Array} items - 要显示的食材数组
// 根据传入的食材数组，创建对应的食材卡片并添加到网格中
function renderIngredients(items) {
    ingredientsGrid.innerHTML = '';
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = `ingredient-card${selectedIngredients.has(item.name) ? ' selected' : ''}`;
        card.innerHTML = `
            <div class="ingredient-icon">${item.icon}</div>
            <div class="ingredient-name">${item.name}</div>
        `;
        card.addEventListener('click', () => toggleIngredient(item));
        ingredientsGrid.appendChild(card);
    });
}

// 切换食材的选中状态
// @param {Object} item - 食材对象，包含name和icon属性
// 当食材被点击时，在已选列表中添加或删除该食材
function toggleIngredient(item) {
    if (selectedIngredients.has(item.name)) {
        selectedIngredients.delete(item.name);
    } else {
        selectedIngredients.add(item.name);
    }
    updateSelectedBar();
    renderIngredients(filterIngredients());
}

// 处理制作按钮点击事件
// 根据已选食材查找匹配的菜品，并显示制作步骤
// 如果有多个匹配的菜品，让用户选择要制作的菜品
function handleCooking() {
    const matchingRecipes = findMatchingRecipes(Array.from(selectedIngredients));
    if (matchingRecipes.length === 0) {
        alert('当前食材无法制作任何菜品，请尝试添加更多食材！');
        return;
    }
    
    // 隐藏食材选择界面
    document.querySelector('.container').style.display = 'none';
    
    // 创建制作步骤页面
    const cookingPage = document.createElement('div');
    cookingPage.className = 'cooking-page';
    
    // 如果有多个匹配的菜品，让用户选择
    if (matchingRecipes.length > 1) {
        const recipeNames = matchingRecipes.map((recipe, index) => 
            `${index + 1}. ${recipe.name} (已有${recipe.matchCount}种食材，还缺少：${recipe.missingIngredients.join('、')})`
        ).join('\n');
        
        const choice = prompt(`找到多个可以制作的菜品，请输入数字选择：\n${recipeNames}`);
        const index = parseInt(choice) - 1;
        
        if (isNaN(index) || index < 0 || index >= matchingRecipes.length) {
            alert('无效的选择！');
            document.querySelector('.container').style.display = 'block';
            return;
        }
        
        showRecipeSteps(matchingRecipes[index], cookingPage);
    } else {
        // 只有一个匹配的菜品，显示并提示缺少的食材
        const recipe = matchingRecipes[0];
        if (recipe.missingIngredients.length > 0) {
            alert(`你可以制作${recipe.name}，但还缺少以下食材：${recipe.missingIngredients.join('、')}`);
        }
        showRecipeSteps(recipe, cookingPage);
    }
    
    // 添加返回按钮
    const backButton = document.createElement('button');
    backButton.className = 'back-btn';
    backButton.textContent = '返回食材选择';
    backButton.onclick = () => {
        document.body.removeChild(cookingPage);
        document.querySelector('.container').style.display = 'block';
    };
    cookingPage.appendChild(backButton);
    
    // 显示制作步骤页面
    document.body.appendChild(cookingPage);
}

// 更新已选食材栏的显示
// 显示当前选中的食材数量，并为每个食材创建可删除的标签
function updateSelectedBar() {
    selectedItems.innerHTML = '';
    selectedCount.textContent = selectedIngredients.size;

    selectedIngredients.forEach(name => {
        const item = document.createElement('div');
        item.className = 'selected-item';
        item.innerHTML = `
            <span>${name}</span>
            <button class="remove-btn">×</button>
        `;
        item.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            selectedIngredients.delete(name);
            updateSelectedBar();
            renderIngredients(filterIngredients());
        });
        selectedItems.appendChild(item);
    });
}

// 根据搜索关键词过滤食材
// 首先在当前分类中搜索，如果没有结果则在其他分类中搜索
// @returns {Array} 过滤后的食材数组
function filterIngredients() {
    const searchTerm = searchInput.value.toLowerCase();
    if (!searchTerm) return ingredients[currentCategory];
    
    let results = [];
    // 首先搜索当前分类
    results = ingredients[currentCategory].filter(item =>
        item.name.toLowerCase().includes(searchTerm)
    );
    
    // 如果当前分类没有结果，搜索其他分类
    if (results.length === 0) {
        for (let category in ingredients) {
            if (category !== currentCategory) {
                const categoryResults = ingredients[category].filter(item =>
                    item.name.toLowerCase().includes(searchTerm)
                );
                results = results.concat(categoryResults);
            }
        }
    }
    
    return results;
}

// 初始化分类导航
categoryNav.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-item')) {
        categoryNav.querySelector('.active').classList.remove('active');
        e.target.classList.add('active');
        currentCategory = e.target.textContent;
        searchInput.value = '';
        renderIngredients(ingredients[currentCategory]);
    }
});

// 搜索功能
searchBtn.addEventListener('click', () => {
    renderIngredients(filterIngredients());
});

searchInput.addEventListener('input', () => {
    renderIngredients(filterIngredients());
});

searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        renderIngredients(filterIngredients());
    }
});

// 制作按钮点击事件
confirmBtn.addEventListener('click', handleCooking);

// 初始渲染
renderIngredients(ingredients[currentCategory]);