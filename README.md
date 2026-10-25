🍲 RecipeShare
A React application for discovering, creating and sharing cooking recipes.

Live Application
     · 
    Source Code

React · Vite · React Router · Supabase · Cloudflare Workers

About the project
RecipeShare lets visitors explore recipes and read cooking instructions. Registered users can publish and manage their own recipes, comment on recipes, and maintain a list of favorites. Recipe data and authentication are managed through Supabase.
Features
Visitors	Registered users
Browse the recipe catalog	Create, edit and delete their own recipes
Search, filter and sort recipes	Comment on recipes
Read recipe details and comments	Add and remove favorites
Register and sign in	View My Recipes, Favorites and Profile

Technology stack
Layer	Technology
Frontend	React, JavaScript, Vite
Routing	React Router
Authentication	Supabase Auth, React Context
Database	Supabase PostgreSQL
Styling	External CSS
Deployment	Cloudflare Workers, Wrangler

Getting started
Requirements: Node.js, npm and a configured Supabase project with the application's tables and access policies.
1.	Clone the repository: git clone https://github.com/vlastomar/vlastomar-js-recipes.git
2.	Enter the project directory: cd vlastomar-js-recipes
3.	Install dependencies: npm install
4.	Create .env.local in the project root and add the Supabase settings shown below.
5.	Start the development server: npm run dev
6.	Open the local address printed by Vite.
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
Never commit .env.local or Supabase service-role keys. Only use the public anon/publishable key in the frontend.
Production build: npm run build
Deployment: run npm run build, followed by npx wrangler deploy. The application is served from dist with single-page application fallback configured in wrangler.jsonc.

Functional Guide
The following sections document the application's functionality according to the SoftUni React exam Functional Guide.
1. Project Overview
Application name: RecipeShare
Category: Cooking recipe sharing platform
RecipeShare provides a place to discover and share cooking ideas. Visitors can read recipes without registering, while authenticated users can contribute recipes, manage their own content, comment and save favorites. The application stores its data in Supabase.
2. User Access & Permissions
Guests can open Home, the recipe catalog, individual recipe details, Login and Registration. They can view public recipe information and comments but cannot submit content or manage favorites.
Authenticated users can additionally open Create Recipe, My Recipes, Favorites and Profile. They can create recipes, comment and manage favorites. Only a recipe's author can edit or delete that recipe.
3. Authentication & Session Handling
On startup, the authentication provider requests the current session using Supabase Auth. It subscribes to authentication changes and shares the user, loading state and logout function through React Context.
Registration validates email, password and confirmation. Depending on the Supabase settings, successful registration either starts a session or requires email confirmation. Login verifies the credentials through Supabase. Logout ends the session and updates the navigation.
Supabase persists the browser session. On refresh, the application checks the existing session and restores the authenticated interface when the session is still valid.
4. Routing Structure
React Router handles navigation. Public routes are accessible to everyone, guest-only routes redirect authenticated users, and private routes redirect unauthenticated visitors to Login.
Route	Page	Access
/	Home	Public
/recipes	Catalog	Public
/recipes/:id	Recipe details	Public
/login	Login	Guest-only
/register	Registration	Guest-only
/reset-password	Password recovery	Recovery flow
/recipes/create	Create recipe	Authenticated
/recipes/:id/edit	Edit recipe	Recipe author
/my-recipes	My Recipes	Authenticated
/favorites	Favorites	Authenticated
/profile	Profile	Authenticated
*	Not Found	Public

The two parameterized routes are /recipes/:id and /recipes/:id/edit. The id value identifies the relevant recipe. Route guards are implemented as wrapper components rather than nested layout routes.
5. List → Details Flow
The catalog retrieves recipes from Supabase and renders them as cards. Visitors can search by title or description, filter by preparation time, and sort by date or preparation time.
Opening a recipe navigates to /recipes/:id. React Router supplies the ID, which is used to fetch the recipe's ingredients, instructions, cooking time, description and optional image. Signed-in users can interact through comments and favorites; authors can access edit and delete actions.
6. Data Source & Backend
The application uses Supabase as a real hosted backend, with PostgreSQL for data and Supabase Auth for user accounts. Recipes are fetched remotely rather than stored as hardcoded application data.
Table	Purpose
recipes	Recipe records: id, owner_id, title, description, ingredients, instructions, cooking_minutes, image_url and created_at
recipe_comments	Comments associated with recipes and users
recipe_favorites	Saved relationships between users and recipes

The Supabase JavaScript client performs data operations. Authentication and database access policies control user-specific permissions.
7. Data Operations (CRUD)
Operation	Implementation
Create	A signed-in user submits the Create Recipe form; a new row is inserted into recipes with the current user as owner.
Read	Recipes are fetched for the catalog, details, My Recipes and Favorites views.
Update	The author loads an existing recipe in the Edit form and saves changes to Supabase.
Delete	The author deletes their recipe; the interface then leaves the deleted record or updates the visible list.

Additional interactions include posting comments and adding or removing favorites. These operations use their corresponding Supabase tables.
8. Forms & Validation
The application contains Registration, Login, Password Reset, Create Recipe, Edit Recipe and Comment forms. Inputs are controlled through React state, with onChange updating values and submit handlers preventing default browser form submission.
Field	Validation
Email	Required; valid email format
Password	Required; at least six characters during registration
Confirm password	Required; must match the password
Recipe title	Required; cannot be empty
Recipe content	Required recipe information is checked before submission

Validation and request errors are displayed to users. Loading and submitting states help prevent repeated submissions.
9. React-Specific Techniques
useState manages forms, recipe data, filters, loading indicators and errors. useEffect retrieves sessions and recipes and handles cleanup. useContext gives components access to shared authentication state. React Router hooks support navigation and URL parameters.
Lifecycle example: when the Catalog mounts, an effect fetches recipes. When the request finishes, state updates and React renders the result. When the component unmounts, cleanup prevents obsolete requests from updating its state. The authentication provider also unsubscribes from Supabase auth events.
React Context shares the current user, authentication loading state and logout function with components such as the Header and route guards. Styling is defined in external CSS, including src/style.css.
10. Typical User Flow
7.	Open RecipeShare and browse the public catalog.
8.	Search for a recipe and open its details.
9.	Register or log in to unlock authenticated features.
10.	Create a recipe and find it in My Recipes.
11.	Edit or delete a recipe you own.
12.	Comment on other recipes and save favorites.
13.	Review saved recipes on the Favorites page.
14.	Log out when finished.
11. Error & Edge Case Handling
Authentication failures display feedback and do not grant access to protected pages. Supabase requests expose loading and error states. Empty collections display appropriate messages when no recipes or favorites are available. Unknown routes lead to the Not Found page. Recipe management is restricted to the record's author.

Deployment
Production platform: Cloudflare Workers
Worker name: vlastomar-js-recipes-deploy
Application: Open RecipeShare
Repository: View source on GitHub

