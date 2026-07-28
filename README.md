# Async Race (Angular)

**Score:** 400 / 400 pts  
**Live Deployment:** https://async-race-angular.netlify.app  
**Repository:** https://github.com/mero93/async-race-angular

---

## How To Run

Follow these steps to run the project locally or test the live deployment.

### 1. Run the Mock API Server

The application requires the `async-race-api` backend running locally.

1. Clone or fork the API repository:
   ` git clone https://github.com/mikhama/async-race-api.git`

2. Navigate to the project and install dependencies: `npm install`

3. Start the mock server on port 3000:
   `npm start`

Note: Make sure the API is running at http://localhost:3000.

### 2. Run the Angular Application

#### Local Development

1. Clone this repository and install dependencies:
   git clone https://github.com/mero93/async-race-angular.git
   cd async-race-angular
   npm install

2. Start the Angular development server:
   ng serve

3. Open your browser at http://localhost:4200.

#### Testing Live Deployment

If you are checking the Live Deployment, keep the mock API server running locally on port 3000 so the deployed app can communicate with your local backend.
---

## 📋 Evaluation Checklist

### 🚀 UI Deployment

- [x] **Deployment Platform:** Successfully deploy the UI on Netlify.

### ✅ Requirements to Commits and Repository

- [x] **Commit guidelines compliance:** Ensure that all commits follow the specified commit guidelines.
- [x] **Checklist included in README.md:** Included in README.md.
- [x] **Score calculation:** Included at the top of README.md.
- [x] **UI Deployment link in README.md:** Included at the top of README.md.

---

### 🏛️ Basic Structure (80 points)

- [x] **Two Views (10 points):** Implement two primary views: "Garage" and "Winners".
- [x] **Garage View Content (30 points):** "Garage" view displays view name, car creation/editing panel, race control panel, and garage section.
- [x] **Winners View Content (10 points):** "Winners" view displays view name, winners table, and pagination.
- [x] **Persistent State (30 points):** View state remains consistent when navigating between views (page numbers, input states, etc.).

---

### 🏎️ Garage View (90 points)

- [x] **Car Creation And Editing Panel. CRUD Operations (20 points):** Enables creating, updating, and deleting cars. Deleting a car removes it from both "garage" and "winners".
- [x] **Color Selection (10 points):** Color selection displays the selected color on the car's image.
- [x] **Random Car Creation (20 points):** Button generates 100 random cars with random names and colors.
- [x] **Car Management Buttons (10 points):** Action buttons provided near each car's image.
- [x] **Pagination (10 points):** Displays 7 cars per page.
- [x] **EXTRA POINTS (20 points):**
- [x] **Empty Garage:** Friendly message displayed when garage is empty.
- [x] **Empty Garage Page:** Removing the last car on a page navigates automatically to the previous page.

---

### 🏆 Winners View (50 points)

- [x] **Display Winners (15 points):** Winning cars are displayed in the "Winners view" table.
- [x] **Pagination for Winners (10 points):** Displays 10 winners per page.
- [x] **Winners Table (15 points):** Displays car №, image, name, wins count, and best time in seconds. Increments wins and updates best time.
- [x] **Sorting Functionality (10 points):** Supports sorting by wins and best time in ascending/descending order.

---

### 🚗 Race Operations (170 points)

- [x] **Start Engine Animation (20 points):** Start engine button triggers velocity request, driving request, and animates car.
- [x] **Stop Engine Animation (20 points):** Stop engine button returns car to initial position.
- [x] **Responsive Animation (30 points):** Animations are fluid on screens as small as 500px.
- [x] **Start Race Button (10 points):** Starts race for all cars on current page.
- [x] **Reset Race Button (15 points):** Returns all cars to starting positions.
- [x] **Winner Announcement (5 points):** Displays banner announcing winning car name.
- [x] **Button States (20 points):** Start/stop engine buttons correctly disabled/enabled based on engine state.
- [x] **Actions during the race (50 points):** Actions during running race are handled predictably.

---

### 🎨 Code Quality & Setup (10 points)

- [x] **Prettier Setup (5 points):** Prettier configured with `format` and `ci:format` scripts.
- [x] **ESLint Configuration (5 points):** ESLint configured with strict TypeScript rules.

---

### 🌟 Overall Code Quality (100 points)

- [x] **Code Quality & Architecture (100 points):** Modular architecture with clear layer separation, strict typing, no `any`, and clean functional code practices.

---
