// 菜品数据：包含所有可制作的菜品信息
// 每个菜品包含名称、所需食材和制作步骤
const recipes = [
    {
        name: '番茄炒蛋',
        ingredients: ['西红柿', '盐', ],
        steps: [
            '将鸡蛋打散，加入少许盐调味',
            '番茄切块，葱花切碎',
            '热油锅，倒入打散的鸡蛋快速翻炒至金黄',
            '盛出鸡蛋，放入番茄翻炒出汤',
            '放入炒好的鸡蛋，加盐调味',
            '撒上葱花即可出锅了'
        ]
    },
    {
        name: '土豆炒肉丝',
        ingredients: ['土豆', '猪肉', '蒜', '盐', '生抽'],
        steps: [
            '土豆切丝，猪肉切丝，蒜切末',
            '热油锅，爆香蒜末',
            '放入肉丝翻炒至变色',
            '加入土豆丝翻炒',
            '加入适量盐和生抽调味',
            '炒至土豆丝变软即可出锅'
        ]
    }
];

// 根据已选食材查找可以制作的菜品
// @param {Array} selectedIngredients - 用户已选择的食材数组
// @returns {Array} 返回匹配的菜品数组，每个菜品对象包含匹配度信息
function findMatchingRecipes(selectedIngredients) {
    return recipes.map(recipe => {
        const requiredIngredients = new Set(recipe.ingredients);
        const selected = new Set(selectedIngredients);
        let matchCount = 0;
        let missingIngredients = [];
        
        for (let ingredient of requiredIngredients) {
            if (selected.has(ingredient)) {
                matchCount++;
            } else {
                missingIngredients.push(ingredient);
            }
        }
        
        return {
            ...recipe,
            matchCount,
            missingIngredients,
            canCook: matchCount === requiredIngredients.size
        };
    }).filter(recipe => recipe.canCook);
}

// 在指定容器中显示菜品的制作步骤
// @param {Object} recipe - 菜品对象，包含名称、食材和步骤信息
// @param {HTMLElement} container - 用于显示制作步骤的DOM容器
function showRecipeSteps(recipe, container) {
    container.innerHTML += `
        <div class="recipe-content">
            <h2>${recipe.name}</h2>
            <div class="recipe-ingredients">
                <h3>所需食材：</h3>
                <p>${recipe.ingredients.join('、')}</p>
            </div>
            <div class="recipe-steps">
                <h3>制作步骤：</h3>
                <ol>
                    ${recipe.steps.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
        </div>
    `;
}
