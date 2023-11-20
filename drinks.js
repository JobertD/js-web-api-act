const searchBtn = document.getElementById('drink-search-btn');
const drinkList = document.getElementById('drink');
const drinkDetailsContent = document.querySelector('.drink-details-content');
const recipeCloseBtn = document.getElementById('drink-recipe-close-btn');
const categoryDropdown = document.getElementById('categoryDropdown');

// event listeners
searchBtn.addEventListener('click', getDrinkList);
drinkList.addEventListener('click', getDrinkRecipe);
recipeCloseBtn.addEventListener('click', () => {
    drinkDetailsContent.parentElement.classList.remove('showRecipe');
});

// Fetch categories and populate the dropdown
fetch('https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list')
    .then(response => response.json())
    .then(data => populateDropdown(data.drinks))
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

// Function to get drink list based on ingredients and category
function getDrinkList() {
    const searchInputTxt = document.getElementById('drink-search-input').value.trim();
    const selectedCategory = categoryDropdown.value;

    // Modify the API request URL based on the selected category and ingredient
    const apiUrl = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${searchInputTxt}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const drinksArray = [];
            const promises = data.drinks.map(fetchDrink => {
                const lookup = fetchDrink.idDrink;
                console.log(lookup);
                return fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${lookup}`)
                    .then(response => response.json())
                    .then(lookupData => {
                        console.log("Lookup API response:", lookupData); 
                        console.log(lookupData.drinks && lookupData.drinks.length > 0 && lookupData.drinks[0].strCategory, " - ", selectedCategory);
                        if (selectedCategory === "All Categories") {
                            drinksArray.push({
                                idDrink: fetchDrink.idDrink,
                                strDrink: fetchDrink.strDrink,
                                strDrinkThumb: fetchDrink.strDrinkThumb
                            });
                            console.log("Added to Array");
                        }
                        else if ((lookupData.drinks && lookupData.drinks.length > 0 && lookupData.drinks[0].strCategory) == selectedCategory) {
                            drinksArray.push({
                                idDrink: fetchDrink.idDrink,
                                strDrink: fetchDrink.strDrink,
                                strDrinkThumb: fetchDrink.strDrinkThumb
                            });
                            console.log("Added to Array");
                        }
                    })
                    .catch(error => {
                        console.error("Error fetching lookup API:", error);
                    });
            });
            console.log(drinksArray);

            Promise.all(promises)
            .then(() => {
                  let html = drinksArray
                        ? drinksArray.map(drink => `
                            <a href="#" class="recipe-btn">
                                <div class="drink-item" data-id="${drink.idDrink}">
                                    <div class="drink-img">
                                        <img src="${drink.strDrinkThumb}" alt="drink">
                                    </div>
                                    <div class="drink-name">
                                        <h3>${drink.strDrink}</h3>
                                    </div>
                                </div>
                            </a>`
                        ).join('')
                        : "Sorry, we didn't find any drink!";

            drinkList.innerHTML = html;
            drinkList.classList.toggle('notFound', !data.drinks);
            })
        })
        .catch (error => {
                console.error(error)
                let html = "Sorry, we didn't find any drink!";
                drinkList.innerHTML = html;
                drinkList.classList.toggle('notFound', !false);
        });
}

/*
//Get drink list that matches with the ingredient input
function getDrinkList() {
    let searchInputTxt = document.getElementById('drink-search-input').value.trim();
    fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${searchInputTxt}`)
        .then(response => {
                let html = "";
                html = "Sorry, we didn't find any drink!";
                drinkList.classList.add('notFound');
                drinkList.innerHTML = html;
            
            return response.json();
        })
        .then(data => {
            if (data.drinks) {
                let html = "";
                data.drinks.forEach(drink => {
                    html += `
                        <div class="drink-item" data-id="${drink.idDrink}">
                            <div class="drink-img">
                                <img src="${drink.strDrinkThumb}" alt="drink">
                            </div>
                            <div class="drink-name">
                                <h3>${drink.strDrink}</h3>
                                <a href="#" class="recipe-btn">Get Recipe</a>
                            </div>
                        </div>
                    `;
                });
                drinkList.classList.remove('notFound');
                drinkList.innerHTML = html;
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

//Get recipe for the drink
function getDrinkRecipe(e){
    e.preventDefault();
    if(e.target.classList.contains('recipe-btn')){
        let drinkItem = e.target.parentElement.parentElement;
        fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drinkItem.dataset.id}`)
        .then(response => response.json())
        .then(data => drinkRecipeModal(data.drinks));
    }
}

// Create a modal for the drink
function drinkRecipeModal(drink){
    console.log(drink);
    drink = drink[0];
    let steps = drink.strInstructions.split(".");
    let ingredients = getIngredients(drink);
    let html = `
        <h2 class = "recipe-title">${drink.strDrink}</h2>
        <p class = "recipe-category">${drink.strCategory}</p>
        <div class = "recipe-instruct">
            <h3>Ingredients:</h3>
                <ul id="drink-ingredients-list">
                </ul>
            <h3>Instructions:</h3>
                <ol id="drink-steps-list">
                </ol> 
        </div>
        <div class = "recipe-drink-img">
            <img src = "${drink.strDrinkThumb}" alt = "">
        </div>
    `;
    drinkDetailsContent.innerHTML = html;
    let stepsList = drinkDetailsContent.querySelector("ol");
    const ingredientsList = drinkDetailsContent.querySelector("#drink-ingredients-list");
    ingredients.forEach(ingredient => ingredient && ingredientsList.appendChild(createListItem(ingredient)));
    for (let step of steps) {
        if (step == "") continue;
        else {
            let stepEl = document.createElement("li");
            stepEl.textContent = step;
            stepsList.appendChild(stepEl);
        }
    }
    drinkDetailsContent.parentElement.classList.add('showRecipe');
}
*/


// Function to get recipe of the drink
function getDrinkRecipe(e) {
    e.preventDefault();
    const recipeBtn = e.target.closest('.recipe-btn');

    if (recipeBtn) {
        const drinkItem = recipeBtn.querySelector('.drink-item');
        const drinkId = drinkItem.getAttribute('data-id');

        fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drinkId}`)
            .then(response => response.json())
            .then(data => drinkRecipeModal(data.drinks[0]))
            .catch(error => {
                console.error('Error fetching drink recipe:', error);
            });
    }
}

// Function to create a modal
function drinkRecipeModal(drink) {
    const steps = drink.strInstructions.split(".");
    const ingredients = getIngredients(drink);

    const html = `
        <h2 class="recipe-title">${drink.strDrink}</h2>
        <p class="recipe-category">${drink.strCategory}</p>
        <div class="recipe-instruct">
            <h3>Ingredients: </h3>
            <ul id="drink-ingredients-list"></ul>
            <h3>Instructions:</h3>
            <ol id="drink-steps-list"></ol>
        </div>
        <div class="recipe-drink-img">
            <img src="${drink.strDrinkThumb}" alt="">
        </div>;`

    drinkDetailsContent.innerHTML = html;
    const stepsList = drinkDetailsContent.querySelector("#drink-steps-list");
    const ingredientsList = drinkDetailsContent.querySelector("#drink-ingredients-list");

    steps.forEach(step => step && stepsList.appendChild(createListItem(step)));
    ingredients.forEach(ingredient => ingredient && ingredientsList.appendChild(createListItem(ingredient)));

    drinkDetailsContent.parentElement.classList.add('showRecipe');
}




function getIngredients(drink) {
    const ingredients = Array.from({ length: 15 }, (_, i) => drink[`strIngredient${i + 1}`]);
    const measures = Array.from({ length: 15 }, (_, i) => drink[`strMeasure${i + 1}`]);

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