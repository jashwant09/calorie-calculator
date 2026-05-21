window.onload = function () {
    let isLoggedIn = localStorage.getItem("loggedIn");

    // 1. Protect pages
    if (!isLoggedIn &&
        !window.location.pathname.includes("login.html") &&
        !window.location.pathname.includes("register.html")) {
        window.location.href = "login.html";
        return;
    }

    // 2. index.html logic
    if (window.location.pathname.includes("index.html") || window.location.pathname === "/" || window.location.pathname === "") {
        let currentUsername = localStorage.getItem("currentUsername") || "User";
        let welcomeEl = document.getElementById("welcomeUser");
        if (welcomeEl) {
            welcomeEl.innerText = "Hello, " + currentUsername + "!";
        }

        let history = JSON.parse(localStorage.getItem("history")) || [];
        let currentWeight = history.length > 0 ? history[history.length - 1].weight : 0;

    }

    // 3. result.html logic
    if (window.location.pathname.includes("result.html")) {
        // Initialize trackers
        let savedWater = localStorage.getItem("waterTracker") || 0;
        let countEl = document.getElementById("waterCount");
        if (countEl) countEl.innerText = savedWater;

        let mealProgress = JSON.parse(localStorage.getItem("mealProgress")) || {};
        if (document.getElementById("checkBreakfast")) document.getElementById("checkBreakfast").checked = mealProgress.breakfast || false;
        if (document.getElementById("checkLunch")) document.getElementById("checkLunch").checked = mealProgress.lunch || false;
        if (document.getElementById("checkDinner")) document.getElementById("checkDinner").checked = mealProgress.dinner || false;

        let history = JSON.parse(localStorage.getItem("history")) || [];
        // Custom Insight Feature
        let insightText = "Not enough data yet";

        if (history.length >= 2) {
            let latest = history[history.length - 1].weight;
            let previous = history[history.length - 2].weight;

            let diff = (latest - previous).toFixed(1);

            if (diff < 0) {
                insightText = `🔥 Good job! You lost ${Math.abs(diff)} kg`;
            } else if (diff > 0) {
                insightText = `⚠️ You gained ${diff} kg. Check diet & activity`;
            } else {
                insightText = `😐 No change in weight`;
            }
        }

        let weeklyEl = document.getElementById("weeklyInsight");
        if (weeklyEl) {
            weeklyEl.innerHTML = insightText;
        }

        // Apply normal results
        let calories = localStorage.getItem("calories");
        let protein = localStorage.getItem("protein");
        let fat = localStorage.getItem("fat");
        let carbs = localStorage.getItem("carbs");
        let water = localStorage.getItem("water");
        let goalType = localStorage.getItem("goalType");
        let bmi = localStorage.getItem("bmi");
        let bmiCategory = localStorage.getItem("bmiCategory");
        let meals = localStorage.getItem("mealPlan");

        if (document.getElementById("goal")) document.getElementById("goal").innerHTML = "Goal: " + goalType;
        if (document.getElementById("calories")) document.getElementById("calories").innerHTML = "🔥 " + calories + " kcal";
        if (document.getElementById("protein")) document.getElementById("protein").innerHTML = "💪 " + protein + " g";
        if (document.getElementById("fat")) document.getElementById("fat").innerHTML = "🥑 " + fat + " g";
        if (document.getElementById("carbs")) document.getElementById("carbs").innerHTML = "🍚 " + carbs + " g";
        if (document.getElementById("water")) document.getElementById("water").innerHTML = "💧 " + water + " L";
        if (document.getElementById("bmi")) document.getElementById("bmi").innerHTML = "BMI: " + bmi;
        if (document.getElementById("bmiCategory")) document.getElementById("bmiCategory").innerHTML = "Category: " + bmiCategory;
        if (document.getElementById("meals")) document.getElementById("meals").innerHTML = meals;

        let mealContainer = document.getElementById("mealSuggestionsContainer");
        if (mealContainer && meals) {
            try {
                let mealList = JSON.parse(meals);
                if (Array.isArray(mealList)) {
                    let htmlContent = "";
                    mealList.forEach(meal => {
                        let prepHtml = meal.prep.map(step => `<li class="meal-prep-step">${step}</li>`).join("");
                        
                        htmlContent += `
                            <div class="meal-card">
                                <div class="meal-header">
                                    <div class="meal-category-title">
                                        <span class="meal-category">${meal.icon} ${meal.category}</span>
                                        <span class="meal-name">${meal.name}</span>
                                    </div>
                                    <span class="meal-calories-badge">🔥 ${meal.calories} kcal</span>
                                </div>
                                <div class="meal-content">
                                    <div class="meal-prep-col">
                                        <h4>📖 Preparation</h4>
                                        <ul class="meal-prep-steps">
                                            ${prepHtml}
                                        </ul>
                                    </div>
                                    <div class="meal-macros-col">
                                        <h4>⚡ Meal Macros</h4>
                                        <div class="meal-macro-badges">
                                            <div class="meal-macro-badge protein">
                                                <span>💪 Protein</span>
                                                <span>${meal.protein}g</span>
                                            </div>
                                            <div class="meal-macro-badge carbs">
                                                <span>🍚 Carbs</span>
                                                <span>${meal.carbs}g</span>
                                            </div>
                                            <div class="meal-macro-badge fat">
                                                <span>🥑 Healthy Fats</span>
                                                <span>${meal.fat}g</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                    mealContainer.innerHTML = htmlContent;
                } else {
                    mealContainer.innerHTML = `<div class="meal-box">${meals}</div>`;
                }
            } catch(e) {
                mealContainer.innerHTML = `<div class="meal-box">${meals}</div>`;
            }
        }

        let list = document.getElementById("historyList");
        if (list) {
            list.innerHTML = "";
            history.forEach(item => {
                let li = document.createElement("li");
                li.innerHTML = `<span>${item.date}</span> <span>${item.weight}kg (BMI: ${item.bmi})</span>`;
                list.appendChild(li);
            });
        }

        let chartEl = document.getElementById("progressChart");
        if (chartEl && typeof Chart !== 'undefined') {
            let ctx = chartEl.getContext("2d");
            new Chart(ctx, {
                type: "line",
                data: {
                    labels: history.map(item => item.date),
                    datasets: [{
                        label: "Weight Progress",
                        data: history.map(item => item.weight),
                        borderColor: '#60a5fa',
                        borderWidth: 3,
                        pointBackgroundColor: '#6366f1',
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { ticks: { color: '#cbd5e1' } },
                        x: { ticks: { color: '#cbd5e1' } }
                    },
                    plugins: {
                        legend: { labels: { color: '#f8fafc' } }
                    }
                }
            });
        }
        
        // Add new track initializers
        let savedSteps = localStorage.getItem("totalSteps") || 0;
        let stepsEl = document.getElementById("totalSteps");
        if (stepsEl) stepsEl.innerText = savedSteps;

        let wLabel = document.getElementById("waterLabel");
        if(wLabel && history.length > 0) wLabel.innerText = `For ${history[history.length - 1].weight}kg weight, target is ${water}L.`;
        
        // Populate specific summary slide
        let savedHeight = localStorage.getItem("inputHeight") || "--";
        let savedLevel = localStorage.getItem("inputLevel") || "--";
        let savedFood = localStorage.getItem("inputFood") || "--";
        
        let sWeight = document.getElementById("summaryWeight");
        if(sWeight && history.length > 0) sWeight.innerText = history[history.length - 1].weight;
        let sHeight = document.getElementById("summaryHeight");
        if(sHeight) sHeight.innerText = savedHeight;
        let sLevel = document.getElementById("summaryLevel");
        if(sLevel) sLevel.innerText = savedLevel;
        let sFood = document.getElementById("summaryFood");
        if(sFood) sFood.innerText = savedFood;
        
    }
    
    // Auto-highlight active navigation button
    let currentPage = window.location.pathname;
    document.querySelectorAll(".bottom-nav button").forEach(btn => {
        let onclickAttr = btn.getAttribute("onclick");
        if (onclickAttr) {
            let match = onclickAttr.match(/'(.*?)'/);
            if (match && currentPage.includes(match[1])) {
                btn.style.color = "#3b82f6";
                btn.style.textShadow = "0 0 8px rgba(59, 130, 246, 0.6)";
            }
        }
    });
};

function calculatePlan() {

    let weightInput = document.getElementById("weight");
    let heightInput = document.getElementById("height");
    let goalInput = document.getElementById("goalSelect");
    let levelInput = document.getElementById("level");
    let foodInput = document.getElementById("foodType");

    if (!weightInput || !heightInput) return;

    let weight = parseFloat(weightInput.value);
    let height = parseFloat(heightInput.value);
    let goal = goalInput ? goalInput.value : "maintain";
    let level = levelInput ? levelInput.value : "beginner";
    let foodType = foodInput ? foodInput.value : "veg";

    if (isNaN(weight) || isNaN(height)) {
        alert("Enter valid weight & height");
        return;
    }

    height = height / 100;
    let bmi = weight / (height * height);

    let bmiCategory =
        bmi < 18.5 ? "Underweight" :
            bmi < 25 ? "Normal" :
                bmi < 30 ? "Overweight" : "Obese";

    let bmr = (10 * weight) + (6.25 * (height * 100)) - (5 * 25) + 5; // Simplified Mifflin-St Jeor
    
    let activityMultiplier = 1.2;
    if (level === "beginner") activityMultiplier = 1.375;
    else if (level === "intermediate") activityMultiplier = 1.55;
    else if (level === "athlete") activityMultiplier = 1.725;
    
    let calories = bmr * activityMultiplier;
    
    if (goal === "fatloss") {
        calories -= 500;
    } else if (goal === "gain") {
        calories += 500;
    }
    

    
    // Ensure calories don't drop dangerously low
    if (calories < 1200) calories = 1200;

    let protein = weight * 1.7;
    let fat = weight * 0.8;
    let carbs = (calories - (protein * 4 + fat * 9)) / 4;
    let water = weight * 35 / 1000;

    let breakfastCal = Math.round(calories * 0.3);
    let lunchCal = Math.round(calories * 0.4);
    let dinnerCal = Math.round(calories * 0.3);

    let mealPlanData = [];
    if (foodType === "veg") {
        mealPlanData = [
            {
                category: "Breakfast",
                icon: "🍳",
                name: "High Protein Berry Oats Bowl",
                calories: breakfastCal,
                prep: [
                    "Cook oats in soy milk over medium heat for 5 minutes.",
                    "Stir in chia seeds and protein powder (optional).",
                    "Transfer to a bowl and top with fresh berries and sliced almonds."
                ],
                protein: Math.round(protein * 0.3),
                carbs: Math.round(carbs * 0.3),
                fat: Math.round(fat * 0.3)
            },
            {
                category: "Lunch",
                icon: "🍛",
                name: "Paneer & Quinoa Power Bowl",
                calories: lunchCal,
                prep: [
                    "Cook quinoa according to package instructions.",
                    "Sauté paneer cubes and broccoli in a pan with olive oil and spices.",
                    "Combine quinoa, paneer, and broccoli in a bowl, drizzle with lemon-tahini dressing."
                ],
                protein: Math.round(protein * 0.4),
                carbs: Math.round(carbs * 0.4),
                fat: Math.round(fat * 0.4)
            },
            {
                category: "Dinner",
                icon: "🍽️",
                name: "Tofu & Chickpea Curry with Brown Rice",
                calories: dinnerCal,
                prep: [
                    "Cook brown rice in a small saucepan.",
                    "Sauté cubed tofu and chickpeas in coconut milk with a blend of curry spices.",
                    "Fold in fresh spinach until wilted, then serve over brown rice."
                ],
                protein: Math.round(protein * 0.3),
                carbs: Math.round(carbs * 0.3),
                fat: Math.round(fat * 0.3)
            }
        ];
    } else {
        mealPlanData = [
            {
                category: "Breakfast",
                icon: "🍳",
                name: "Spinach Egg Scramble & Avocado Toast",
                calories: breakfastCal,
                prep: [
                    "Whisk eggs and scramble in a pan with baby spinach and a sprinkle of feta.",
                    "Toast a slice of bread and mash avocado on top with pinch of salt.",
                    "Serve scrambled eggs hot alongside the fresh avocado toast."
                ],
                protein: Math.round(protein * 0.3),
                carbs: Math.round(carbs * 0.3),
                fat: Math.round(fat * 0.3)
            },
            {
                category: "Lunch",
                icon: "🍛",
                name: "Herb Grilled Chicken & Sweet Potato Bowl",
                calories: lunchCal,
                prep: [
                    "Season chicken breast with herbs and grill for 6 minutes per side.",
                    "Cube sweet potatoes, toss with olive oil, and roast at 200°C for 25 mins.",
                    "Serve sliced grilled chicken with roasted sweet potatoes and asparagus."
                ],
                protein: Math.round(protein * 0.4),
                carbs: Math.round(carbs * 0.4),
                fat: Math.round(fat * 0.4)
            },
            {
                category: "Dinner",
                icon: "🍽️",
                name: "Pan-Seared Salmon & Steamed Broccoli",
                calories: dinnerCal,
                prep: [
                    "Cook quinoa according to package instructions.",
                    "Season salmon fillet and pan-sear in olive oil for 4 mins skin-side down, then flip for 3 mins.",
                    "Serve salmon with steamed broccoli and a squeeze of fresh lemon."
                ],
                protein: Math.round(protein * 0.3),
                carbs: Math.round(carbs * 0.3),
                fat: Math.round(fat * 0.3)
            }
        ];
    }

    let meals = JSON.stringify(mealPlanData);

    let history = JSON.parse(localStorage.getItem("history")) || [];
    history.push({
        date: new Date().toLocaleDateString(),
        weight: weight,
        bmi: bmi.toFixed(1),
        calories: Math.round(calories)
    });
    localStorage.setItem("history", JSON.stringify(history));

    localStorage.setItem("bmi", bmi.toFixed(1));
    localStorage.setItem("bmiCategory", bmiCategory);
    localStorage.setItem("goalType", goal);
    localStorage.setItem("mealPlan", meals);
    
    // Save extra inputs for the summary slide
    localStorage.setItem("inputHeight", heightInput.value);
    localStorage.setItem("inputLevel", level);
    localStorage.setItem("inputFood", foodType);

    localStorage.setItem("calories", Math.round(calories));
    localStorage.setItem("protein", Math.round(protein));
    localStorage.setItem("fat", Math.round(fat));
    localStorage.setItem("carbs", Math.round(carbs));
    localStorage.setItem("water", water.toFixed(2));

    window.location.href = "result.html";
}

function register() {
    let name = document.getElementById("newUsername").value;
    let pass = document.getElementById("newPassword").value;

    if (name && pass) {
        localStorage.setItem("username", name);
        localStorage.setItem("password", pass);
        alert("Account created successfully! Please login.");
        window.location.href = "login.html";
    } else {
        alert("Please enter both a valid username and password.");
    }
}

function login() {
    let name = document.getElementById("username").value;
    let pass = document.getElementById("password").value;

    let storedName = localStorage.getItem("username") || "admin";
    let storedPass = localStorage.getItem("password") || "admin";

    if ((name === storedName && pass === storedPass) || (name === "admin" && pass === "admin")) {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("currentUsername", name);
        window.location.href = "index.html";
    } else {
        alert("Invalid credentials! Please try again or register an account.");
    }
}

function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("currentUsername");
    window.location.href = "login.html";
}

function startCalculation() {

    window.location.href = "calculator.html";
}

function goBack() {
    window.location.href = "index.html";
}

function updateWeight() {
    let inputEl = document.getElementById("newWeight");
    if (!inputEl || !inputEl.value) {
        alert("Please enter a valid weight!");
        return;
    }

    let newW = parseFloat(inputEl.value);
    let history = JSON.parse(localStorage.getItem("history")) || [];

    if (history.length > 0) {
        let lastEntry = history[history.length - 1];
        let lastBmi = parseFloat(lastEntry.bmi);
        let heightMeters = Math.sqrt(lastEntry.weight / lastBmi);
        let newBmi = newW / (heightMeters * heightMeters);

        history.push({
            date: new Date().toLocaleDateString(),
            weight: newW,
            bmi: newBmi.toFixed(1),
            calories: lastEntry.calories
        });

        localStorage.setItem("history", JSON.stringify(history));

        alert("Weight updated successfully!");
        window.location.reload();
    } else {
        alert("No previous calculations found to build off of. Please start from the dashboard!");
    }
}

// Function for water tracker
function updateWater(change) {
    let countEl = document.getElementById("waterCount");
    if (!countEl) return;
    let current = parseInt(countEl.innerText) || 0;
    current += change;
    if (current < 0) current = 0;
    countEl.innerText = current;
    localStorage.setItem("waterTracker", current);
}

// Function for meals tracker
function updateMeals() {
    let bk = document.getElementById("checkBreakfast") ? document.getElementById("checkBreakfast").checked : false;
    let lu = document.getElementById("checkLunch") ? document.getElementById("checkLunch").checked : false;
    let di = document.getElementById("checkDinner") ? document.getElementById("checkDinner").checked : false;
    
    let mealProgress = { breakfast: bk, lunch: lu, dinner: di };
    localStorage.setItem("mealProgress", JSON.stringify(mealProgress));
}

// Step tracking
function addSteps() {
    let input = document.getElementById("stepInput");
    if (!input || !input.value) return;
    let added = parseInt(input.value);
    if (isNaN(added) || added <= 0) return;
    
    let currentSteps = parseInt(localStorage.getItem("totalSteps")) || 0;
    currentSteps += added;
    localStorage.setItem("totalSteps", currentSteps);
    
    if(document.getElementById("totalSteps")) document.getElementById("totalSteps").innerText = currentSteps;
    input.value = "";
}

// Photo Preview
function previewFoodPhoto(event) {
    let file = event.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function(e) {
            let preview = document.getElementById("foodPhotoPreview");
            let container = document.getElementById("photoPreviewContainer");
            if(preview && container) {
                preview.src = e.target.result;
                container.style.display = "block";
            }
        }
        reader.readAsDataURL(file);
    }
}

function goPage(page) {
    window.location.href = page;
}
