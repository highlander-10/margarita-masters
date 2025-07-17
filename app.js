class MargaritaMasters {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.tourId = null;
        this.currentRestaurant = 0;
        this.tourData = null;
        this.userRatings = {};
        this.triviaScores = {};
        this.draftTour = null;
        this.prefilledName = null;
        this.nicknameHistory = [];

        this.init();
    }

    init() {
        console.log('🚀 App initializing...');
        this.checkUrlParams();
        console.log('📋 URL params:', { tourId: this.tourId, isAdmin: this.isAdmin, prefilledName: this.prefilledName });

        this.loadSession();
        console.log('💾 Session loaded:', { currentUser: this.currentUser, isAdmin: this.isAdmin, tourId: this.tourId });

        if (this.currentUser && this.tourId) {
            console.log('✅ User and tour found, loading tour...');
            this.loadTour();
        } else {
            console.log('❌ Missing user or tour, showing login screen');
            this.showLoginScreen();
        }
    }

    loadSession() {
        console.log('🔍 Loading session from localStorage...');
        const session = localStorage.getItem('margarita_session');
        console.log('📦 Raw session data:', session);

        if (session) {
            try {
                const sessionData = JSON.parse(session);
                console.log('✅ Parsed session data:', sessionData);

                this.currentUser = sessionData.currentUser;
                this.isAdmin = sessionData.isAdmin;
                this.tourId = sessionData.tourId; // Make sure to restore tourId too!

                console.log('🔄 Session restored:', {
                    currentUser: this.currentUser,
                    isAdmin: this.isAdmin,
                    tourId: this.tourId
                });

                if (sessionData.currentUser) {
                    document.getElementById('user-info').textContent = `Welcome, ${sessionData.currentUser}!`;
                }
            } catch (error) {
                console.error('❌ Error parsing session data:', error);
            }
        } else {
            console.log('❌ No session found in localStorage');
        }
    }

    saveSession() {
        const sessionData = {
            currentUser: this.currentUser,
            isAdmin: this.isAdmin,
            tourId: this.tourId
        };
        console.log('💾 Saving session:', sessionData);
        localStorage.setItem('margarita_session', JSON.stringify(sessionData));
        console.log('✅ Session saved to localStorage');
    }

    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        this.tourId = urlParams.get('tour');
        const user = urlParams.get('user');
        this.prefilledName = urlParams.get('name');

        if (user === 'phill') {
            this.isAdmin = true;
        }
    }

    showLoginScreen() {
        const prefilledValue = this.prefilledName || (this.isAdmin ? 'Phill' : '');

        const content = `
            <div class="screen active" id="login-screen">
                <h2>Welcome to Margarita Masters!</h2>
                <div class="form-group">
                    <label for="username">Enter your name:</label>
                    <input type="text" id="username" placeholder="Your name" value="${prefilledValue}" oninput="app.generateNickname()">
                </div>
                <div class="form-group">
                    <label for="nickname">Your Margarita Nickname:</label>
                    <div style="display: flex; gap: 0.5rem;">
                        <input type="text" id="nickname" placeholder="Auto-generated nickname" readonly style="background: #f8f9fa; flex: 1;">
                        <button class="btn" style="width: auto; padding: 0.5rem;" onclick="app.generateNewNickname()">🎲</button>
                    </div>
                    <div id="nickname-history" style="font-size: 0.8rem; color: #666; margin-top: 0.25rem;"></div>
                    <small style="color: #666; font-size: 0.8rem;">Click the dice to generate new names, or click the nickname to edit</small>
                </div>
                <button class="btn" onclick="app.login()">Start Tasting!</button>
                <button class="btn success" onclick="app.showAdminLogin()">Login as Admin</button>
            </div>
        `;
        document.getElementById('main-content').innerHTML = content;

        if (prefilledValue) {
            setTimeout(() => this.generateNickname(), 100);
        }
    }

    generateNickname() {
        const nameInput = document.getElementById('username');
        const nicknameInput = document.getElementById('nickname');

        if (!nameInput || !nicknameInput) return;

        const name = nameInput.value.trim();
        if (!name) {
            nicknameInput.value = '';
            return;
        }

        const firstLetter = name.charAt(0).toUpperCase();
        const nicknames = {
            'A': ['Agave', 'Awesome', 'Amazing', 'Alcohol-friendly'],
            'B': ['Blanco', 'Boozy', 'Bold', 'Bartender'],
            'C': ['Citrus', 'Cool', 'Cocktail', 'Cantina'],
            'D': ['Daring', 'Delicious', 'Double-shot', 'Dancing'],
            'E': ['Epic', 'Elegant', 'Extra-lime', 'Enthusiastic'],
            'F': ['Fiesta', 'Frozen', 'Fun', 'Fantastic'],
            'G': ['Grande', 'Golden', 'Groovy', 'Giggling'],
            'H': ['Happy', 'Hot', 'Hilarious', 'Hardcore'],
            'I': ['Icy', 'Incredible', 'Intense', 'Island'],
            'J': ['Jalapeño', 'Joyful', 'Jumbo', 'Jazzy'],
            'K': ['Killer', 'Kooky', 'Kickin', 'Karaoke'],
            'L': ['Lime', 'Legendary', 'Loco', 'Lucky'],
            'M': ['Margarita', 'Magnificent', 'Merry', 'Mixologist'],
            'N': ['Neat', 'Naughty', 'Nice', 'Notorious'],
            'O': ['Outstanding', 'On-the-rocks', 'Outgoing', 'Original'],
            'P': ['Party', 'Perfect', 'Passionate', 'Premium'],
            'Q': ['Quality', 'Quick', 'Quirky', 'Queen/King'],
            'R': ['Reposado', 'Rockin', 'Refreshing', 'Radical'],
            'S': ['Salty', 'Smooth', 'Spectacular', 'Spicy'],
            'T': ['Tequila', 'Tipsy', 'Terrific', 'Top-shelf'],
            'U': ['Ultimate', 'Unbeatable', 'Upbeat', 'Unique'],
            'V': ['Vibrant', 'Victory', 'Vivacious', 'Vintage'],
            'W': ['Wild', 'Wonderful', 'Wasted', 'Winner'],
            'X': ['eXtra-strong', 'eXciting', 'eXpert', 'eXotic'],
            'Y': ['Yummy', 'Young', 'Yelling', 'Yearly'],
            'Z': ['Zesty', 'Zippy', 'Zealous', 'Zone']
        };

        const options = nicknames[firstLetter] || ['Margarita', 'Tequila', 'Lime', 'Salt'];
        const randomNickname = options[Math.floor(Math.random() * options.length)];

        nicknameInput.value = `${randomNickname} ${name}`;
        nicknameInput.style.background = '#f8f9fa';
        nicknameInput.readOnly = false;

        nicknameInput.onclick = function () {
            this.readOnly = false;
            this.style.background = 'white';
            this.focus();
        };
    }

    generateNewNickname() {
        const nicknameInput = document.getElementById('nickname');
        const historyDiv = document.getElementById('nickname-history');

        if (nicknameInput && nicknameInput.value && !this.nicknameHistory.includes(nicknameInput.value)) {
            this.nicknameHistory.push(nicknameInput.value);
        }

        this.generateNickname();

        if (this.nicknameHistory.length > 0 && historyDiv) {
            historyDiv.innerHTML = `Previous: ${this.nicknameHistory.slice(-3).join(', ')}`;
        }
    }

    showAdminLogin() {
        const content = `
            <div class="screen active">
                <h2>Admin Login</h2>
                <div class="form-group">
                    <label for="admin-pin">Enter Admin PIN:</label>
                    <input type="password" id="admin-pin" placeholder="Enter PIN">
                </div>
                <button class="btn" onclick="app.verifyAdminPin()">Login</button>
                <button class="btn" onclick="app.showLoginScreen()">Back</button>
            </div>
        `;
        document.getElementById('main-content').innerHTML = content;
    }

    verifyAdminPin() {
        const pin = document.getElementById('admin-pin').value;
        if (pin === '2390') {
            this.isAdmin = true;
            this.currentUser = 'Phill';
            document.getElementById('user-info').textContent = 'Welcome, Phill (Admin)!';
            this.showAdminPanel();
        } else {
            alert('Incorrect PIN');
        }
    }

    login() {
        const username = document.getElementById('username').value.trim();
        const nickname = document.getElementById('nickname').value.trim();

        if (!username) {
            alert('Please enter your name');
            return;
        }

        this.currentUser = nickname || username;
        document.getElementById('user-info').textContent = `Welcome, ${this.currentUser}!`;
        this.saveSession();

        if (this.tourId) {
            this.loadTour();
        } else if (this.isAdmin) {
            this.showAdminPanel();
        } else {
            this.showWaitingScreen();
        }
    }

    showWaitingScreen() {
        const content = `
            <div class="screen active">
                <h2>Waiting for Tour</h2>
                <p>Ask Phill to create a tour and share the link with you!</p>
                <button class="btn" onclick="location.reload()">Refresh</button>
            </div>
        `;
        document.getElementById('main-content').innerHTML = content;
    }

    showAdminPanel() {
        const content = `
            <div class="screen active">
                <h2>Admin Panel</h2>
                <button class="btn success" onclick="app.createNewTour()">Create New Tour</button>
                <button class="btn danger" onclick="app.resetAllData()">Reset All Data</button>
            </div>
        `;
        document.getElementById('main-content').innerHTML = content;
    }

    createNewTour() {
        const draft = localStorage.getItem('draft_tour');
        if (draft) {
            this.draftTour = JSON.parse(draft);
        } else {
            this.draftTour = {
                name: '',
                restaurants: [],
                users: []
            };
        }

        this.showTourCreationForm();
    }

    showTourCreationForm() {
        const content = `
            <div class="screen active">
                <h2>Create New Tour</h2>
                <div class="form-group">
                    <label for="tour-name">Tour Name:</label>
                    <input type="text" id="tour-name" placeholder="e.g., Downtown Margarita Crawl" value="${this.draftTour.name}">
                </div>
                
                <div class="form-group">
                    <label>Users (besides admin):</label>
                    <div id="users-list"></div>
                    <input type="text" id="user-name" placeholder="Add user name">
                    <button class="btn" onclick="app.addUser()">Add User</button>
                </div>
                
                <div id="restaurants-list">
                    <h3>Restaurants</h3>
                </div>
                <div class="form-group">
                    <label for="restaurant-name">Add Restaurant:</label>
                    <input type="text" id="restaurant-name" placeholder="Restaurant name">
                </div>
                <button class="btn" onclick="app.addRestaurant()">Add Restaurant</button>
                <button class="btn success" onclick="app.saveTour()" id="save-tour-btn" style="display:none;">Save Tour & Generate Link</button>
                <button class="btn" onclick="app.showAdminPanel()">Back</button>
            </div>
        `;
        document.getElementById('main-content').innerHTML = content;
        this.updateUsersList();
        this.updateRestaurantsList();
    }

    addUser() {
        const name = document.getElementById('user-name').value.trim();
        if (!name) {
            alert('Please enter a user name');
            return;
        }

        if (this.draftTour.users.includes(name)) {
            alert('User already added');
            return;
        }

        this.draftTour.users.push(name);
        document.getElementById('user-name').value = '';
        this.updateUsersList();
        this.saveDraft();
    }

    updateUsersList() {
        const list = document.getElementById('users-list');
        if (!list) return;

        let html = '';
        this.draftTour.users.forEach((user, index) => {
            html += `
                <div class="restaurant-card" style="padding:0.5rem;">
                    <span>${user}</span>
                    <button class="btn danger" style="width:auto;float:right;padding:0.25rem 0.5rem;" onclick="app.removeUser(${index})">Remove</button>
                </div>
            `;
        });
        list.innerHTML = html;
    }

    removeUser(index) {
        this.draftTour.users.splice(index, 1);
        this.updateUsersList();
        this.saveDraft();
    }

    addRestaurant() {
        const name = document.getElementById('restaurant-name').value.trim();
        if (!name) {
            alert('Please enter a restaurant name');
            return;
        }

        this.draftTour.restaurants.push({
            name: name,
            id: Date.now().toString()
        });

        document.getElementById('restaurant-name').value = '';
        this.updateRestaurantsList();
        document.getElementById('save-tour-btn').style.display = 'block';
        this.saveDraft();
    }

    updateRestaurantsList() {
        const list = document.getElementById('restaurants-list');
        if (!list) return;

        let html = '<h3>Restaurants</h3>';

        this.draftTour.restaurants.forEach((restaurant, index) => {
            html += `
                <div class="restaurant-card">
                    <span>${restaurant.name}</span>
                    <button class="btn danger" style="width:auto;float:right;padding:0.25rem 0.5rem;" onclick="app.removeRestaurant(${index})">Remove</button>
                </div>
            `;
        });

        list.innerHTML = html;
    }

    removeRestaurant(index) {
        this.draftTour.restaurants.splice(index, 1);
        this.updateRestaurantsList();
        this.saveDraft();
        if (this.draftTour.restaurants.length === 0) {
            document.getElementById('save-tour-btn').style.display = 'none';
        }
    }

    saveDraft() {
        const tourNameInput = document.getElementById('tour-name');
        if (tourNameInput) {
            this.draftTour.name = tourNameInput.value.trim();
        }

        localStorage.setItem('draft_tour', JSON.stringify(this.draftTour));
    }

    saveTour() {
        const tourName = document.getElementById('tour-name').value.trim();
        if (!tourName) {
            alert('Please enter a tour name');
            return;
        }

        if (this.draftTour.restaurants.length === 0) {
            alert('Please add at least one restaurant');
            return;
        }

        const nextTourNumber = this.getNextTourNumber();
        const tourId = `tour${nextTourNumber}`;

        const tourData = {
            id: tourId,
            name: tourName,
            restaurants: this.draftTour.restaurants,
            users: this.draftTour.users,
            created: new Date().toISOString(),
            ratings: {},
            triviaScores: {}
        };

        localStorage.setItem(`tour_${tourId}`, JSON.stringify(tourData));
        localStorage.removeItem('draft_tour');
        this.draftTour = null;

        const baseUrl = `${window.location.origin}${window.location.pathname}`;
        const generalUrl = `${baseUrl}?tour=${tourId}`;

        let userLinksHtml = '';
        if (tourData.users.length > 0) {
            userLinksHtml = '<h4>Individual User Links:</h4>';
            tourData.users.forEach(user => {
                const userUrl = `${baseUrl}?tour=${tourId}&name=${encodeURIComponent(user)}`;
                userLinksHtml += `
                    <div class="restaurant-card" style="padding:0.75rem;">
                        <strong>${user}:</strong><br>
                        <input type="text" value="${userUrl}" readonly style="margin:0.5rem 0; font-size:0.8rem;" onclick="this.select()">
                        <button class="btn" style="width:auto;padding:0.25rem 0.5rem;" onclick="navigator.clipboard.writeText('${userUrl}')">Copy</button>
                    </div>
                `;
            });
        }

        const content = `
            <div class="screen active">
                <h2>Tour Created!</h2>
                <div class="results-card">
                    <h3>${tourName}</h3>
                    
                    <h4>General Link (anyone can use):</h4>
                    <input type="text" value="${generalUrl}" readonly style="margin:0.5rem 0;" onclick="this.select()">
                    <button class="btn" onclick="navigator.clipboard.writeText('${generalUrl}')">Copy General Link</button>
                    
                    ${userLinksHtml}
                </div>
                <button class="btn success" onclick="app.startTour('${tourId}')">Start Tour</button>
                <button class="btn" onclick="app.showAdminPanel()">Back to Admin</button>
            </div>
        `;
        document.getElementById('main-content').innerHTML = content;
    }

    getNextTourNumber() {
        let maxNumber = 0;
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('tour_tour')) {
                const match = key.match(/tour_tour(\d+)/);
                if (match) {
                    maxNumber = Math.max(maxNumber, parseInt(match[1]));
                }
            }
        });
        return maxNumber + 1;
    }

    startTour(tourId) {
        this.tourId = tourId;
        this.loadTour();
    }

    resetAllData() {
        if (confirm('Reset all data?')) {
            localStorage.clear();
            location.reload();
        }
    }

    loadTour() {
        const tourData = localStorage.getItem(`tour_${this.tourId}`);
        if (!tourData) {
            this.showError('Tour not found');
            return;
        }

        this.tourData = JSON.parse(tourData);
        this.showRestaurantList();
    }

    showRestaurantList() {
        let restaurantsList = '';
        this.tourData.restaurants.forEach((restaurant, index) => {
            const isCompleted = this.tourData.ratings[this.currentUser] &&
                this.tourData.ratings[this.currentUser][restaurant.id];
            const statusColor = isCompleted ? '#27ae60' : '#e74c3c';
            const statusText = isCompleted ? '✓ Completed' : 'Not Rated';

            restaurantsList += `
                <div class="restaurant-card" onclick="app.rateSpecificRestaurant(${index})" style="cursor: pointer;">
                    <h4>${restaurant.name}</h4>
                    <span style="color: ${statusColor}; font-weight: bold;">
                        ${statusText}
                    </span>
                </div>
            `;
        });

        const content = `
            <div class="screen active">
                <h2>${this.tourData.name}</h2>
                <div class="results-card">
                    <p>Click on any restaurant to rate it!</p>
                </div>
                ${restaurantsList}
                <button class="btn" onclick="app.showResults()">View Results</button>
                <button class="btn" onclick="location.reload()">Refresh</button>
                <button class="btn" onclick="app.startOver()">Start Over</button>
                ${this.isAdmin ? '<button class="btn" onclick="app.showAdminPanel()">Admin Panel</button>' : ''}
            </div>
        `;
        document.getElementById('main-content').innerHTML = content;
    }

    rateSpecificRestaurant(restaurantIndex) {
        this.currentRestaurant = restaurantIndex;
        this.showRatingForm();
    }

    showRatingForm() {
        const restaurant = this.tourData.restaurants[this.currentRestaurant];

        const content = `
            <div class="screen active">
                <h2>Rate: ${restaurant.name}</h2>
                
                <div class="rating-section">
                    <h4>🍹 Margarita Rating</h4>
                    
                    <div class="rating-item">
                        <label>Saltiness</label>
                        <div class="slider-container">
                            <input type="range" min="1" max="5" value="3" class="slider" id="saltiness">
                            <div class="slider-labels">
                                <span>Not Salty Enough</span>
                                <span>Perfect</span>
                                <span>Too Salty</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="rating-item">
                        <label>Sweetness</label>
                        <div class="slider-container">
                            <input type="range" min="1" max="5" value="3" class="slider" id="sweetness">
                            <div class="slider-labels">
                                <span>Not Sweet Enough</span>
                                <span>Perfect</span>
                                <span>Too Sweet</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="rating-item">
                        <label>Spiciness</label>
                        <div class="slider-container">
                            <input type="range" min="1" max="5" value="3" class="slider" id="spiciness">
                            <div class="slider-labels">
                                <span>Not Spicy Enough</span>
                                <span>Perfect</span>
                                <span>Too Spicy</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="rating-item">
                        <label>Lime Taste</label>
                        <div class="slider-container">
                            <input type="range" min="1" max="5" value="3" class="slider" id="lime">
                            <div class="slider-labels">
                                <span>Not Enough Lime</span>
                                <span>Perfect</span>
                                <span>Too Much Lime</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="rating-item">
                        <label>Presentation</label>
                        <div class="slider-container">
                            <input type="range" min="1" max="5" value="3" class="slider" id="presentation">
                            <div class="slider-labels">
                                <span>Poor</span>
                                <span>Good</span>
                                <span>Excellent</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="rating-section">
                    <h4>🏪 Venue Rating</h4>
                    
                    <div class="rating-item">
                        <label>Atmosphere</label>
                        <div class="slider-container">
                            <input type="range" min="1" max="5" value="3" class="slider" id="atmosphere">
                            <div class="slider-labels">
                                <span>Poor</span>
                                <span>Good</span>
                                <span>Excellent</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="rating-item">
                        <label>Service</label>
                        <div class="slider-container">
                            <input type="range" min="1" max="5" value="3" class="slider" id="service">
                            <div class="slider-labels">
                                <span>Poor</span>
                                <span>Good</span>
                                <span>Excellent</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <button class="btn success" onclick="app.submitRating()">Submit Rating</button>
                <button class="btn" onclick="app.showRestaurantList()">Back to Restaurants</button>
            </div>
        `;
        document.getElementById('main-content').innerHTML = content;
    }

    submitRating() {
        const restaurant = this.tourData.restaurants[this.currentRestaurant];

        const rating = {
            saltiness: parseInt(document.getElementById('saltiness').value),
            sweetness: parseInt(document.getElementById('sweetness').value),
            spiciness: parseInt(document.getElementById('spiciness').value),
            lime: parseInt(document.getElementById('lime').value),
            presentation: parseInt(document.getElementById('presentation').value),
            atmosphere: parseInt(document.getElementById('atmosphere').value),
            service: parseInt(document.getElementById('service').value),
            timestamp: new Date().toISOString()
        };

        const scores = Object.values(rating).filter(v => typeof v === 'number');
        rating.average = scores.reduce((a, b) => a + b, 0) / scores.length;

        if (!this.tourData.ratings[this.currentUser]) {
            this.tourData.ratings[this.currentUser] = {};
        }
        this.tourData.ratings[this.currentUser][restaurant.id] = rating;

        localStorage.setItem(`tour_${this.tourId}`, JSON.stringify(this.tourData));

        const content = `
            <div class="screen active">
                <div class="results-card">
                    <h3>Rating Submitted! 🎉</h3>
                    <p>Thanks for rating ${restaurant.name}!</p>
                </div>
                <button class="btn success" onclick="app.showRestaurantList()">Back to Restaurant List</button>
                <button class="btn" onclick="app.showResults()">View Results</button>
            </div>
        `;
        document.getElementById('main-content').innerHTML = content;
    }

    showResults() {
        const results = this.calculateResults();

        let resultsHtml = '';
        results.forEach((result, index) => {
            const cardClass = index === 0 ? 'winner-card' : 'results-card';
            const trophy = index === 0 ? '🏆 ' : '';

            resultsHtml += `
                <div class="${cardClass}">
                    <h3>${trophy}${result.restaurant.name}</h3>
                    <div class="score-display">${result.averageScore.toFixed(1)}/5.0</div>
                    <p>${result.totalRatings} rating(s)</p>
                </div>
            `;
        });

        const content = `
            <div class="screen active">
                <h2>🏆 Results</h2>
                ${resultsHtml}
                <button class="btn" onclick="app.showRestaurantList()">Back to Restaurants</button>
                <button class="btn" onclick="location.reload()">Refresh Results</button>
            </div>
        `;
        document.getElementById('main-content').innerHTML = content;
    }

    calculateResults() {
        const results = [];

        this.tourData.restaurants.forEach(restaurant => {
            const ratings = [];

            Object.keys(this.tourData.ratings).forEach(user => {
                if (this.tourData.ratings[user][restaurant.id]) {
                    ratings.push(this.tourData.ratings[user][restaurant.id]);
                }
            });

            if (ratings.length > 0) {
                const averageScore = ratings.reduce((sum, rating) => sum + rating.average, 0) / ratings.length;
                results.push({
                    restaurant,
                    averageScore,
                    totalRatings: ratings.length,
                    ratings
                });
            }
        });

        results.sort((a, b) => b.averageScore - a.averageScore);

        return results;
    }

    showError(message) {
        const content = `
            <div class="screen active">
                <div class="error">
                    <h3>Error</h3>
                    <p>${message}</p>
                </div>
                <button class="btn" onclick="location.reload()">Refresh</button>
            </div>
        `;
        document.getElementById('main-content').innerHTML = content;
    }

    startOver() {
        console.log('🔄 Starting over - clearing session...');
        // Clear session data
        localStorage.removeItem('margarita_session');

        // Reset app state
        this.currentUser = null;
        this.isAdmin = false;
        this.tourId = null;
        this.tourData = null;

        // Clear user info display
        document.getElementById('user-info').textContent = '';

        // Go to login screen
        this.showLoginScreen();

        console.log('✅ Session cleared, back to login screen');
    }
}

// Initialize the app
const app = new MargaritaMasters();
