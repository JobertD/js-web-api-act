const searchBtn = document.getElementById('search-btn');
const mealList = document.getElementById('meal');
const mealDetailsContent = document.querySelector('.meal-details-content');
const recipeCloseBtn = document.getElementById('recipe-close-btn');
const categoryDropdown = document.getElementById('categoryDropdown');

// Event listeners
searchBtn.addEventListener('click', getMealList);
mealList.addEventListener('click', getMealRecipe);
categoryDropdown.addEventListener('change', getMealList);
recipeCloseBtn.addEventListener('click', () => mealDetailsContent.parentElement.classList.remove('showRecipe'));

// Fetch categories and populate the dropdown
fetch('https://www.themealdb.com/api/json/v1/1/categories.php')
    .then(response => response.json())
    .then(data => populateDropdown(data.categories))
    .catch(error => console.error('Error fetching categories:', error));

// Function to populate the dropdown with categories
function populateDropdown(categories) {
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.strCategory;
        option.text = category.strCategory;
        categoryDropdown.add(option);
    });
}

// Function to get meal list based on ingredients and category
function getMealList() {
    const searchInputTxt = document.getElementById('search-input').value.trim();
    const selectedCategory = categoryDropdown.value;

    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchInputTxt}&c=${selectedCategory}`)
        .then(response => response.json())
        .then(data => {
            let html = data.meals
                ? data.meals.map(meal => `
                    <div class="meal-item" data-id="${meal.idMeal}">
                        <div class="meal-img">
                            <img src="${meal.strMealThumb}" alt="food">
                        </div>
                        <div class="meal-name">
                            <h3>${meal.strMeal}</h3>
                            <a href="#" class="recipe-btn">Get Recipe</a>
                        </div>
                    </div>`
                ).join('')
                : "Sorry, we didn't find any meal!";

            mealList.innerHTML = html;
            mealList.classList.toggle('notFound', !data.meals);
        });
}

// Function to get recipe of the meal
function getMealRecipe(e) {
    e.preventDefault();
    if (e.target.classList.contains('recipe-btn')) {
        const mealItem = e.target.parentElement.parentElement;
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealItem.dataset.id}`)
            .then(response => response.json())
            .then(data => mealRecipeModal(data.meals[0]));
    }
}

// Function to create a modal
function mealRecipeModal(meal) {
    const steps = meal.strInstructions.split(".");
    const ingredients = getIngredients(meal);

    const html = `
        <h2 class="recipe-title">${meal.strMeal}</h2>
        <p class="recipe-category">${meal.strCategory}</p>
        <div class="recipe-instruct">
            <h3>Ingredients: </h3>
            <ul id="food-ingredients-list"></ul>
            <h3>Instructions:</h3>
            <ol id="food-steps-list"></ol>
        </div>
        <div class="recipe-meal-img">
            <img src="${meal.strMealThumb}" alt="">
        </div>
        <div class="recipe-link">
            <a href="${meal.strYoutube}" target="_blank">Watch Video</a>
        </div>`;

    mealDetailsContent.innerHTML = html;
    const stepsList = mealDetailsContent.querySelector("#food-steps-list");
    const ingredientsList = mealDetailsContent.querySelector("#food-ingredients-list");

    steps.forEach(step => step && stepsList.appendChild(createListItem(step)));
    ingredients.forEach(ingredient => ingredient && ingredientsList.appendChild(createListItem(ingredient)));

    mealDetailsContent.parentElement.classList.add('showRecipe');
}

// Function to get ingredients
function getIngredients(meal) {
    const ingredients = Array.from({ length: 20 }, (_, i) => meal[`strIngredient${i + 1}`]);
    const measures = Array.from({ length: 20 }, (_, i) => meal[`strMeasure${i + 1}`]);

    return ingredients
        .map((ingredient, i) => (ingredient && measures[i]) ? `${ingredient} - ${measures[i]}` : "")
        .filter(Boolean);
}

// Helper function to create list item
function createListItem(text) {
    const listItem = document.createElement("li");
    listItem.textContent = text;
    return listItem;
}
