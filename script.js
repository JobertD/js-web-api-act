const searchBtn = document.getElementById('search-btn');
const mealList = document.getElementById('meal');
const mealDetailsContent = document.querySelector('.meal-details-content');
const recipeCloseBtn = document.getElementById('recipe-close-btn');
const categoryDropdown = document.getElementById('categoryDropdown');

// Event listeners
searchBtn.addEventListener('click', getMealList);
mealList.addEventListener('click', getMealRecipe);
recipeCloseBtn.addEventListener('click', () => mealDetailsContent.parentElement.classList.remove('showRecipe'));

// Fetch categories and populate the dropdown
fetch('https://www.themealdb.com/api/json/v1/1/categories.php')
    .then(response => response.json())
    .then(data => populateDropdown(data.categories))
    .catch(error => console.error('Error fetching categories:', error));


// Function to populate the dropdown with categories
function populateDropdown(categories) {
    const allCategoriesOption = document.createElement('option');
    allCategoriesOption.value = 'All Categories';
    allCategoriesOption.text = 'All Categories';
    categoryDropdown.add(allCategoriesOption);

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

    // Modify the API request URL based on the selected category and ingredient
    const apiUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchInputTxt}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const mealsArray = [];
            const promises = data.meals.map(fetchMeal => {
                const lookup = fetchMeal.idMeal;
                console.log(lookup);
                return fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${lookup}`)
                    .then(response => response.json())
                    .then(lookupData => {
                        console.log("Lookup API response:", lookupData); 
                        console.log(lookupData.meals && lookupData.meals.length > 0 && lookupData.meals[0].strCategory, " - ", selectedCategory);
                        if (selectedCategory === "All Categories") {
                            mealsArray.push({
                                idMeal: fetchMeal.idMeal,
                                strMeal: fetchMeal.strMeal,
                                strMealThumb: fetchMeal.strMealThumb
                            });
                            console.log("Added to Array");
                        }
                        else if ((lookupData.meals && lookupData.meals.length > 0 && lookupData.meals[0].strCategory) == selectedCategory) {
                            mealsArray.push({
                                idMeal: fetchMeal.idMeal,
                                strMeal: fetchMeal.strMeal,
                                strMealThumb: fetchMeal.strMealThumb
                            });
                            console.log("Added to Array");
                        }
                    })
                    .catch(error => {
                        console.error("Error fetching lookup API:", error);
                    });
            });
            console.log(mealsArray);

            Promise.all(promises)
            .then(() => {
                  let html = mealsArray.length != 0
                        ? mealsArray.map(meal => `
                            <a href="#" class="recipe-btn">
                                <div class="meal-item" data-id="${meal.idMeal}">
                                    <div class="meal-img">
                                        <img src="${meal.strMealThumb}" alt="food">
                                    </div>
                                    <div class="meal-name">
                                        <h3>${meal.strMeal}</h3>
                                    </div>
                                </div>
                            </a>`
                        ).join('')
                        : "Sorry, we didn't find any meal!";

            mealList.innerHTML = html;
            mealList.classList.toggle('notFound', !data.meals);
            })
        })
        .catch (error => {
                console.error(error)
                let html = "Sorry, we didn't find any meal!";
                mealList.innerHTML = html;
                mealList.classList.toggle('notFound', !false);
        });
}

// Function to get recipe of the meal
function getMealRecipe(e) {
    e.preventDefault();
    const recipeBtn = e.target.closest('.recipe-btn');

    if (recipeBtn) {
        const mealItem = recipeBtn.querySelector('.meal-item');
        const mealId = mealItem.getAttribute('data-id');

        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
            .then(response => response.json())
            .then(data => mealRecipeModal(data.meals[0]))
            .catch(error => {
                console.error('Error fetching meal recipe:', error);
            });
    }
}


// Helper function to get YouTube embed URL
function getYouTubeEmbedUrl(youtubeUrl) {
    const videoId = youtubeUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : youtubeUrl;
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
            <iframe width="560" height="315" src="${getYouTubeEmbedUrl(meal.strYoutube)}" frameborder="0" allowfullscreen></iframe>
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
