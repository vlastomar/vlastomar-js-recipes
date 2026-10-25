
<div align="center">

<h1>🍽️ RecipeShare</h1>

<p>A React application for discovering, creating and sharing cooking recipes.</p>

<p>
  <a href="https://vlastomar-js-recipes-deploy.vlastomar-442.workers.dev">Live Application</a>
  &nbsp; | &nbsp;
  <a href="https://github.com/vlastomar/vlastomar-js-recipes">GitHub Repository</a>
</p>

<p>SoftUni React Exam Project · October 2026</p>

</div>

<hr>

<h2>About the Project</h2>

RecipeShare is a cooking recipe sharing platform built with React and Supabase.

Visitors can explore recipes, read cooking instructions and discover new meal ideas. Registered users can publish recipes, manage their own content, leave comments and save favorite recipes.

The application uses a real remote database, user authentication, protected routes and a responsive interface.

<h2>Technology Stack</h2>

<table>
  <tr><td>Frontend</td><td>React, JavaScript, Vite</td></tr>
  <tr><td>Routing</td><td>React Router</td></tr>
  <tr><td>Backend</td><td>Supabase</td></tr>
  <tr><td>Database</td><td>PostgreSQL</td></tr>
  <tr><td>Authentication</td><td>Supabase Auth</td></tr>
  <tr><td>Styling</td><td>CSS</td></tr>
  <tr><td>Deployment</td><td>Cloudflare Workers</td></tr>
  <tr><td>Version Control</td><td>Git and GitHub</td></tr>
</table>

<h2>Main Features</h2>

<ul>
  <li>User registration, login and logout</li>
  <li>Email confirmation and password recovery</li>
  <li>Public recipe catalog</li>
  <li>Recipe search, filtering and sorting</li>
  <li>Individual recipe details</li>
  <li>Create, edit and delete recipes</li>
  <li>Personal recipe management</li>
  <li>Recipe comments</li>
  <li>Favorite recipes</li>
  <li>User profile</li>
  <li>Protected routes and author permissions</li>
  <li>Database validation and access policies</li>
  <li>Responsive interface</li>
</ul>

<h2>Getting Started</h2>

<h3>Requirements</h3>

To run the project locally, you need:

<ul>
  <li>Node.js</li>
  <li>npm</li>
  <li>A configured Supabase project</li>
  <li>The required database tables and access policies</li>
</ul>

<h3>Installation</h3>

1. Clone the repository.

    git clone https://github.com/vlastomar/vlastomar-js-recipes.git

2. Open the project directory.

    cd vlastomar-js-recipes

3. Install the dependencies.

    npm install

4. Create a file named .env.local in the project root.

Add your Supabase configuration:

    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

Use the environment variable names expected by your application configuration.

5. Start the development server.

    npm run dev

Open the local address displayed in the terminal.

The Supabase database must contain the required tables and access policies before all application features can work.

Never commit .env.local, database passwords or service-role keys to GitHub.

<h3>Production Build</h3>

    npm run build

The production build is generated in the dist directory.

<h3>Cloudflare Deployment</h3>

    npm run build
    npx wrangler deploy

The application uses Cloudflare Workers to serve the built React application.

SPA fallback handling allows React Router pages to load when opened directly or refreshed.

Production application:

https://vlastomar-js-recipes-deploy.vlastomar-442.workers.dev

<hr>

<h1>Functional Guide</h1>

<h2>1. Project Overview</h2>

Application Name: RecipeShare

Application Category: Recipe Sharing Platform

RecipeShare is a web application designed for sharing and discovering cooking recipes.

Visitors can browse recipes, view ingredients and cooking instructions, and explore available content.

Authenticated users can create and manage their own recipes and interact with other recipes through comments and favorites.

The main goal is to provide a simple and accessible platform for sharing cooking ideas.

<h2>2. User Access and Permissions</h2>

<h3>Guest Users</h3>

Visitors who are not authenticated can:

<ul>
  <li>Access the home page</li>
  <li>Browse the recipe catalog</li>
  <li>View recipe details</li>
  <li>Use public search and filtering options</li>
  <li>Register a new account</li>
  <li>Log in to an existing account</li>
</ul>

Guests cannot create, edit or delete recipes.

<h3>Authenticated Users</h3>

Logged-in users can:

<ul>
  <li>Access all public pages</li>
  <li>Create new recipes</li>
  <li>View their own recipes</li>
  <li>Edit and delete recipes they own</li>
  <li>Post recipe comments</li>
  <li>Add or remove favorite recipes</li>
  <li>Access their favorites and profile</li>
  <li>Log out</li>
</ul>

Recipe editing and deletion are restricted to the recipe author.

<h3>Ownership Protection</h3>

RecipeShare checks recipe ownership before allowing access to editing functionality.

During testing, a second authenticated user attempted to open the editing URL of a recipe created by another account.

The application displayed the message:

"Рецептата не е намерена или не е твоя."

The editing form was not available to the second user.

This confirms that the interface restricts unauthorized editing access. Database-level access is additionally controlled through Supabase policies and should be verified independently.

<h2>3. Authentication and Session Handling</h2>

The application uses Supabase Authentication.

When RecipeShare starts, the authentication provider checks for an existing user session.

<h3>Registration</h3>

Registration requires an email address, password and password confirmation.

Supabase may require email confirmation before the new account can be used.

The production Site URL and allowed redirect URLs are configured so email confirmation returns users to the deployed RecipeShare application.

<h3>Login</h3>

During login, Supabase validates the submitted credentials.

After successful authentication, the application updates the current user state and enables access to protected functionality.

<h3>Logout</h3>

Logout ends the active Supabase session and returns the interface to its guest state.

<h3>Session Persistence</h3>

Authentication state is shared through React Context.

Supabase manages session persistence, allowing users to remain authenticated after refreshing the page while their session is valid.

This behavior was tested successfully in the deployed application.

<h2>4. Routing Structure</h2>

RecipeShare uses React Router for client-side navigation.

<table>
  <tr><th>Route</th><th>Page</th><th>Access</th></tr>
  <tr><td>/</td><td>Home</td><td>Public</td></tr>
  <tr><td>/recipes</td><td>Recipe Catalog</td><td>Public</td></tr>
  <tr><td>/recipes/:id</td><td>Recipe Details</td><td>Public</td></tr>
  <tr><td>/register</td><td>Registration</td><td>Guest</td></tr>
  <tr><td>/login</td><td>Login</td><td>Guest</td></tr>
  <tr><td>/reset-password</td><td>Password Recovery</td><td>Recovery flow</td></tr>
  <tr><td>/recipes/create</td><td>Create Recipe</td><td>Authenticated</td></tr>
  <tr><td>/recipes/:id/edit</td><td>Edit Recipe</td><td>Recipe author</td></tr>
  <tr><td>/my-recipes</td><td>My Recipes</td><td>Authenticated</td></tr>
  <tr><td>/favorites</td><td>Favorites</td><td>Authenticated</td></tr>
  <tr><td>/profile</td><td>Profile</td><td>Authenticated</td></tr>
  <tr><td>*</td><td>Not Found</td><td>Public</td></tr>
</table>

GuestRoute prevents authenticated users from accessing guest-only pages.

PrivateRoute redirects unauthenticated users to the login page.

The :id URL parameter identifies a specific recipe for viewing or editing.

Directly opening and refreshing a recipe details URL was tested successfully in production.

<h2>5. List to Details Flow</h2>

The recipe catalog retrieves recipe records from Supabase and displays them as recipe cards.

Users can:

<ul>
  <li>Browse available recipes</li>
  <li>Search for matching recipes</li>
  <li>Apply available filters</li>
  <li>Change the sorting order</li>
  <li>Open individual recipe details</li>
</ul>

Selecting a recipe opens its details page.

React Router reads the recipe ID from the URL, and the application retrieves the corresponding record from Supabase.

The details page presents information such as the recipe title, description, ingredients, preparation instructions, cooking time and image when available.

Authenticated users can interact with recipes through comments and favorites.

<h2>6. Data Source and Backend</h2>

RecipeShare uses Supabase as a hosted backend service.

Supabase provides:

<ul>
  <li>PostgreSQL database</li>
  <li>User authentication</li>
  <li>JavaScript client for database operations</li>
  <li>Row Level Security policies</li>
</ul>

<h3>Database Resources</h3>

<table>
  <tr><th>Resource</th><th>Purpose</th></tr>
  <tr><td>recipes</td><td>Stores recipes and their associated information</td></tr>
  <tr><td>Comments collection</td><td>Stores comments associated with recipes</td></tr>
  <tr><td>Favorites collection</td><td>Stores favorite recipes for individual users</td></tr>
</table>

The exact comments and favorites table names should match the current Supabase schema.

The recipes table contains fields for recipe identification, ownership, title, description, ingredients, instructions, cooking time, image URL and creation date.

Database access policies help protect user-owned data and restrict unauthorized operations.

<h3>Data Persistence</h3>

Recipe records are stored remotely in Supabase rather than in hardcoded application arrays.

Newly created recipes and edits remain available after refreshing the page.

<h2>7. Data Operations (CRUD)</h2>

The main CRUD resource is the recipe.

<h3>Create</h3>

Authenticated users open the Create Recipe page, complete the form and submit the information.

A valid recipe is inserted into the Supabase recipes table and associated with the current user.

Creating a recipe and viewing it in My Recipes was tested successfully.

<h3>Read</h3>

Recipe data is retrieved from Supabase and displayed in the catalog, recipe details, My Recipes and Favorites pages.

<h3>Update</h3>

The recipe author can open the editing page and modify existing recipe information.

After a successful update, the modified data is stored in Supabase.

Editing a recipe and refreshing the page was tested successfully.

<h3>Delete</h3>

The recipe author can delete their own recipe.

The application removes the corresponding database record and updates the interface after successful deletion.

Deleting a recipe and confirming its absence after refreshing was tested successfully.

<h3>Additional Operations</h3>

Comments allow authenticated users to interact with recipes.

Favorites allow users to save recipes and remove them from their personal favorites collection.

<h2>8. Forms and Validation</h2>

RecipeShare includes the following forms:

<ul>
  <li>Registration</li>
  <li>Login</li>
  <li>Password recovery and reset</li>
  <li>Create Recipe</li>
  <li>Edit Recipe</li>
  <li>Recipe comment</li>
</ul>

Form values are managed using React state.

<h3>Authentication Validation</h3>

<table>
  <tr><th>Field</th><th>Validation</th></tr>
  <tr><td>Email</td><td>Required and must be a valid email address</td></tr>
  <tr><td>Registration password</td><td>Required, minimum 6 characters</td></tr>
  <tr><td>Password confirmation</td><td>Required and must match the password</td></tr>
  <tr><td>New password during recovery</td><td>Minimum 8 characters</td></tr>
</table>

<h3>Recipe Database Validation</h3>

The provided Supabase SQL schema defines the following constraints for recipe records:

<table>
  <tr><th>Field</th><th>Validation Rule</th></tr>
  <tr><td>Title</td><td>Between 3 and 100 characters</td></tr>
  <tr><td>Description</td><td>Between 10 and 2000 characters</td></tr>
  <tr><td>Ingredients</td><td>At least 3 characters</td></tr>
  <tr><td>Cooking instructions</td><td>At least 10 characters</td></tr>
  <tr><td>Cooking time</td><td>Between 1 and 1440 minutes</td></tr>
  <tr><td>Image URL</td><td>Optional</td></tr>
</table>

These constraints help prevent invalid recipe information from being stored in the database.

<h3>Validation Test</h3>

During testing, an attempt to publish a recipe with an invalid description was rejected by Supabase.

The database returned the following error:

    new row for relation "recipes" violates check constraint "recipes_description_check"

After the description was corrected, the recipe was successfully published.

This confirms that the database rejects recipe descriptions that violate its constraints.

<h3>Current Validation Feedback</h3>

The application currently displays a technical database error when the description constraint is violated.

Improving client-side validation and displaying more user-friendly messages is a planned enhancement.

The intended improvement is to validate the input before sending the request and display messages such as:

"Описанието трябва да съдържа между 10 и 2000 символа."

The database constraints will remain enabled to provide an additional layer of validation.

<h2>9. React-Specific Techniques</h2>

<h3>React Hooks</h3>

useState manages form values, loaded recipes, loading indicators, errors and other interface state.

useEffect handles side effects such as loading recipes, checking the authentication session and subscribing to authentication events.

useContext provides access to shared authentication state.

React Router hooks support navigation and parameterized routes.

<h3>Component Lifecycle</h3>

When the catalog mounts, it starts retrieving recipes from Supabase.

After the data arrives, React updates the component state and renders the available recipes.

When the component unmounts, effect cleanup is used to avoid outdated operations affecting the component.

The authentication provider also cleans up its authentication subscription.

<h3>Context API</h3>

AuthContext shares the current user, authentication loading state and logout functionality.

This information is consumed by navigation components, route guards and other components requiring authentication information.

<h3>Styling</h3>

The application uses external CSS, including src/style.css.

Styles cover navigation, forms, buttons, recipe cards, page layouts and responsive presentation.

<h2>10. Typical User Flow</h2>

1. A visitor opens RecipeShare and browses the catalog.
2. The visitor selects a recipe and reads its details.
3. The visitor registers or logs in.
4. The authenticated user creates a new recipe.
5. The user opens My Recipes to manage their content.
6. The user edits or deletes a recipe they own.
7. The user explores other recipes, adds comments and saves favorites.
8. The user opens Favorites to revisit saved recipes.
9. The user logs out.

<h2>11. Error and Edge Case Handling</h2>

<h3>Authentication Errors</h3>

Invalid login credentials and unsuccessful registration attempts display error messages.

Private routes remain inaccessible to unauthenticated users.

<h3>Network and Database Errors</h3>

Supabase requests are handled asynchronously.

The application uses loading indicators and error messages to provide feedback when requests are pending or fail.

<h3>Database Constraint Errors</h3>

Supabase rejects recipe records that violate database constraints.

A description validation error was observed during testing. The recipe was successfully published after correcting the invalid input.

Improving the clarity of database error messages is a planned enhancement.

<h3>Empty and Missing Data</h3>

The interface accounts for situations such as an empty recipe catalog, missing recipes, an empty favorites collection or a user without created recipes.

Unknown routes display a Not Found page.

<h3>Unauthorized Actions</h3>

Guests cannot access protected recipe management functionality.

The application restricts editing functionality to the recipe author.

A test using two different authenticated accounts confirmed that the second account could not open the editing form for another user's recipe.

Supabase Row Level Security policies provide database-level access control, which should also be verified independently.

<hr>

<h2>Deployment Information</h2>

<table>
  <tr><td>Platform</td><td>Cloudflare Workers</td></tr>
  <tr><td>Worker Name</td><td>vlastomar-js-recipes-deploy</td></tr>
  <tr><td>Frontend</td><td>React + Vite</td></tr>
  <tr><td>Backend</td><td>Supabase</td></tr>
</table>

Live application:

https://vlastomar-js-recipes-deploy.vlastomar-442.workers.dev

Source code:

https://github.com/vlastomar/vlastomar-js-recipes

<hr>

<div align="center">
  <p>RecipeShare · Vladimir Marinov: SoftUni React Exam Project · 2026</p>
</div>
