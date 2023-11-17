const searchBtn = document.getElementById('drink-search-btn');
const drinkList = document.getElementById('drink');
const drinkDetailsContent = document.querySelector('.drink-details-content');
const recipeCloseBtn = document.getElementById('drink-recipe-close-btn');

// event listeners
searchBtn.addEventListener('click', getDrinkList);
drinkList.addEventListener('click', getDrinkRecipe);
recipeCloseBtn.addEventListener('click', () => {
    drinkDetailsContent.parentElement.classList.remove('showRecipe');
});

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
    let html = `
        <h2 class = "recipe-title">${drink.strDrink}</h2>
        <p class = "recipe-category">${drink.strCategory}</p>
        <div class = "recipe-instruct">
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