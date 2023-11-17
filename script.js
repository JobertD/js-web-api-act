const searchBtn = document.getElementById('search-btn');
const mealList = document.getElementById('meal');
const mealDetailsContent = document.querySelector('.meal-details-content');
const recipeCloseBtn = document.getElementById('recipe-close-btn');

// event listeners
searchBtn.addEventListener('click', getMealList);
mealList.addEventListener('click', getMealRecipe);
recipeCloseBtn.addEventListener('click', () => {
    mealDetailsContent.parentElement.classList.remove('showRecipe');
});

// get meal list that matches with the ingredients
function getMealList(){
    let searchInputTxt = document.getElementById('search-input').value.trim();
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchInputTxt}`)
    .then(response => response.json())
    .then(data => {
        let html = "";
        if(data.meals){
            data.meals.forEach(meal => {
                html += `
                    <div class = "meal-item" data-id = "${meal.idMeal}">
                        <div class = "meal-img">
                            <img src = "${meal.strMealThumb}" alt = "food">
                        </div>
                        <div class = "meal-name">
                            <h3>${meal.strMeal}</h3>
                            <a href = "#" class = "recipe-btn">Get Recipe</a>
                        </div>
                    </div>
                `;
            });
            mealList.classList.remove('notFound');
        } else{
            html = "Sorry, we didn't find any meal!";
            mealList.classList.add('notFound');
        }

        mealList.innerHTML = html;
    });
}


// get recipe of the meal
function getMealRecipe(e){
    e.preventDefault();
    if(e.target.classList.contains('recipe-btn')){
        let mealItem = e.target.parentElement.parentElement;
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealItem.dataset.id}`)
        .then(response => response.json())
        .then(data => mealRecipeModal(data.meals));
    }
}

// create a modal
function mealRecipeModal(meal){
    console.log(meal);
    meal = meal[0];
    let steps = meal.strInstructions.split(".");
    let ingredients = getIngredients(meal);
    let html = `
        <h2 class = "recipe-title">${meal.strMeal}</h2>
        <p class = "recipe-category">${meal.strCategory}</p>
        <div class = "recipe-instruct">
            <h3>Ingredients: </h3>
                <ul id="food-ingredients-list">
                </ul>
            <h3>Instructions:</h3>
                <ol id="food-steps-list">
                </ol>
        </div>
        <div class = "recipe-meal-img">
            <img src = "${meal.strMealThumb}" alt = "">
        </div>
        <div class = "recipe-link">
            <a href = "${meal.strYoutube}" target = "_blank">Watch Video</a>
        </div>
    `;
    mealDetailsContent.innerHTML = html;
    let stepsList = mealDetailsContent.querySelector("ol");
    let ingredientsList = mealDetailsContent.querySelector("ul");
    for (let step of steps) {
        if (step == "") continue;
        else {
            let stepEl = document.createElement("li");
            stepEl.textContent = step;
            stepsList.appendChild(stepEl);
        }
    }

    for (let ingredient of ingredients) {
        if (ingredient == "") continue;
        else {
            let ingredientEl = document.createElement("li");
            ingredientEl.textContent = ingredient;
            ingredientsList.appendChild(ingredientEl);
        }
    }
    mealDetailsContent.parentElement.classList.add('showRecipe');
}

function getIngredients(meal) {
    let ingredients = [];
    let measures = [];
    ingredients.push(meal.strIngredient1);
    ingredients.push(meal.strIngredient2);
    ingredients.push(meal.strIngredient3);
    ingredients.push(meal.strIngredient4);
    ingredients.push(meal.strIngredient5);
    ingredients.push(meal.strIngredient6);
    ingredients.push(meal.strIngredient7);
    ingredients.push(meal.strIngredient8);
    ingredients.push(meal.strIngredient9);
    ingredients.push(meal.strIngredient10);
    ingredients.push(meal.strIngredient11);
    ingredients.push(meal.strIngredient12);
    ingredients.push(meal.strIngredient13);
    ingredients.push(meal.strIngredient14);
    ingredients.push(meal.strIngredient15);
    ingredients.push(meal.strIngredient16);
    ingredients.push(meal.strIngredient17);
    ingredients.push(meal.strIngredient18);
    ingredients.push(meal.strIngredient19);
    ingredients.push(meal.strIngredient20);

    measures.push(meal.strMeasure1);
    measures.push(meal.strMeasure2);
    measures.push(meal.strMeasure3);
    measures.push(meal.strMeasure4);
    measures.push(meal.strMeasure5);
    measures.push(meal.strMeasure6);
    measures.push(meal.strMeasure7);
    measures.push(meal.strMeasure8);
    measures.push(meal.strMeasure9);
    measures.push(meal.strMeasure10);
    measures.push(meal.strMeasure11);
    measures.push(meal.strMeasure12);
    measures.push(meal.strMeasure13);
    measures.push(meal.strMeasure14);
    measures.push(meal.strMeasure15);
    measures.push(meal.strMeasure16);
    measures.push(meal.strMeasure17);
    measures.push(meal.strMeasure18);
    measures.push(meal.strMeasure19);
    measures.push(meal.strMeasure20);

    for (let i = 0; i < 20; i++) {
        if (measures[i] == "" || measures[i] == null || ingredients[i] == "" || ingredients[i] == null) continue;
        else {
            ingredients[i] += ` - ${measures[i]}`;
        }
    }

    return  ingredients.filter((ingredient) => {
        console.log(ingredient);
        return ingredient != "" || ingredient != null;
    });

}
