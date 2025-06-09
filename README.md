# E-commerce Sales Chatbot: Chippy

## Project Overview
A comprehensive, responsive sales chatbot, "Chippy," tailored for an e-commerce platform specializing in electronics. Chippy enhances the shopping experience by enabling efficient product search, exploration, and a simulated purchase process. It features secure user authentication, persistent chat history, and an intuitive, animated user interface.

## Core Features

* **Responsive Chatbot Widget:** A sleek robot-head icon floats on the bottom-right, expanding into a full-screen, responsive chat window with smooth Framer Motion animations on click.
* **Secure User Authentication:** Implemented with a Login and Registration module using Django REST Framework and JWT (JSON Web Tokens) for secure, token-based user sessions.
* **Session Management & Continuity:** Users maintain their logged-in state across browser sessions. Tokens are stored in local storage and validated upon chat window open.
* **Persistent Chat History:** All user queries and Chippy's responses are stored securely in Google Cloud Firestore, loaded automatically upon login/session resume, ensuring conversation continuity.
* **Conversation Reset:** A dedicated "Clear Chat" button (with confirmation dialog) allows users to delete their personal chat history without logging out.
* **Rule-Based Conversational AI:** Chippy uses an extensive rule-based system to understand common user intents (greetings, product search, queries about pricing, stock, features, etc.) and provides contextual, friendly, and guiding responses.
* **Enhanced Product Visualization:** Product search results are dynamically displayed as interactive Material-UI cards within the chat, featuring images, prices, brands, stock status, and actionable "View Details" / "Add to Cart" buttons.
* **Simulated Purchase Process:** Interactive buttons on product cards trigger simulated next steps for viewing details or adding items to a cart, guiding the user towards purchase.
* **Typing Indicator & Smooth Interactions:** An animated "..." indicator for bot responses and smooth scrolling in the chat window enhance the user experience.

## Technology Stack

### Frontend (React.js)
* **React.js:** A declarative, component-based JavaScript library for building user interfaces. Chosen for its efficiency in building complex UIs, vibrant ecosystem, and maintainability.
* **Material-UI (MUI):** A comprehensive React UI framework implementing Google's Material Design. Utilized for rapid development of beautiful, responsive, and customizable UI components, adhering to modern design principles (e.g., off-white background, black accents, curved elements).
* **Framer Motion:** A production-ready animation library for React. Selected for declarative and performant animations, delivering a smooth user experience for chatbot opening/closing, message entry, and product card display.
* **Axios:** A popular promise-based HTTP client for the browser. Chosen for its ease of use, robust error handling, and consistent API for making requests to the Django backend.
* **UUID:** A lightweight library for generating universally unique identifiers. Used for tracking individual chat sessions.
* **HTML5 & CSS3:** The foundational web technologies for structuring content and styling, enhanced by MUI's powerful styling system.

### Backend (Django & Python)
* **Django:** A high-level Python web framework that encourages rapid development and clean, pragmatic design. Chosen for its "batteries-included" approach (ORM, Admin, Auth), strong security features, and scalability.
* **Django REST Framework (DRF):** A powerful and flexible toolkit for building Web APIs in Django. Facilitates rapid development of RESTful endpoints for products, authentication, and chat history.
* **djangorestframework-simplejwt:** An extension for DRF providing JSON Web Token (JWT) authentication. Selected for its stateless nature, security, and suitability for single-page applications like our React frontend.
* **django-cors-headers:** A Django application that handles Cross-Origin Resource Sharing (CORS) headers. Essential for enabling secure communication between the separately hosted React frontend (localhost:3000) and Django backend (localhost:8000).
* **Firebase Admin SDK (Python):** The official server-side SDK for Firebase services. Used to securely interact with Google Cloud Firestore from Django.
* **Faker:** A Python library for generating realistic-looking fake data. Employed to quickly populate the mock e-commerce inventory (electronics products) in MySQL.
* **MySQL:** A widely used open-source relational database management system. Chosen for storing structured product data due to its reliability, maturity, and strong integration with Django's ORM.
* **Google Cloud Firestore:** A flexible, scalable NoSQL document database. Ideal for storing dynamic and potentially unstructured chat interaction data due to its real-time capabilities and ease of use for document-based storage.

## Architecture

The application follows a **client-server architecture**:
1.  **Frontend (React.js App):** Serves the user interface, manages user sessions, and makes API calls.
2.  **Backend (Django App):** Exposes RESTful APIs, handles business logic, authenticates users, processes search queries, and interacts with databases.





## Project Setup and Local Development

Follow these steps to get the project running on your local machine.

### Prerequisites

* **Python 3.8+:** Download from [python.org](https://www.python.org/downloads/).
* **Node.js & npm:** Download from [nodejs.org](https://nodejs.org/).
* **MySQL Server:** Ensure a MySQL server instance is running locally (e.g., via XAMPP, Docker, or standalone installation).
* **Google Firebase Project & Service Account Key:**
    1.  Go to [Firebase Console](https://console.firebase.google.com/).
    2.  Create or select a project.
    3.  Navigate to **Project settings** (gear icon) > **Service accounts**.
    4.  Click **"Generate new private key"** and download the JSON file.
    5.  **Rename this file to `firebase_service_account.json`** and place it in the `backend/` directory of your project.
    6.  **Crucially, add `firebase_service_account.json` to your `backend/.gitignore`** to prevent it from being committed to source control.
    7.  **Enable the Cloud Firestore API** for your project by visiting the Google Cloud Console link: `https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=<YOUR_PROJECT_ID>`. Click **"ENABLE"**. When prompted for security rules, choose **"Production mode (Restrictive)"**.

### Setup Steps

1.  **Clone the Repository:**
    ```bash
    git clone <your-github-repo-url>
    cd ecommerce_chatbot_project
    ```

2.  **Backend Setup:**
    ```bash
    cd backend

    # Create and activate Python virtual environment
    python -m venv venv
    # On Windows: .\venv\Scripts\activate
    # On macOS/Linux: source venv/bin/activate

    # Install Python dependencies
    pip install -r requirements.txt # (Create this file with `pip freeze > requirements.txt` after installing all below)
    # If requirements.txt is not yet made, install manually:
    # pip install Django djangorestframework djangorestframework-simplejwt django-cors-headers mysqlclient Faker firebase-admin

    # Create MySQL Database
    # Open your MySQL client (e.g., MySQL Workbench, command line) and run:
    CREATE DATABASE ecommerce_chatbot_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

    # Configure Django Settings
    # Open `ecommerce_chatbot_backend/settings.py` and:
    #   - Update the `DATABASES` setting with your MySQL credentials (NAME, USER, PASSWORD, HOST, PORT).
    #   - Ensure `TIME_ZONE = 'Asia/Kolkata'` is set.
    #   - The `firebase_service_account.json` (from prerequisites) should be in the `backend/` directory;
    #     the `settings.py` is configured to automatically detect and use it for local Firebase initialization.
    #   - Verify `CORS_ALLOW_ALL_ORIGINS = True` and `CORS_ALLOWED_HEADERS` include `'authorization'` for local dev.

    # Apply Django Migrations & Create Superuser
    python manage.py makemigrations
    python manage.py migrate
    python manage.py createsuperuser # Follow prompts to create an admin user for Django Admin panel

    # Populate Mock Product Data
    # Ensure you are in the `backend/` directory
    python manage.py populate_products --num_products 200 # Creates 200 electronics products

    # Start Backend Server
    python manage.py runserver
    # Keep this terminal running.
    ```

3.  **Frontend Setup:**
    ```bash
    cd ../frontend # Go back to the main project directory, then into frontend

    # Install Node.js dependencies
    npm install

    # Start Frontend Development Server
    npm start
    # This will open the app in your default browser at http://localhost:3000.
    ```

## Usage

1.  Open your browser to `http://localhost:3000`.
2.  Click the **robot head icon** at the bottom-right corner to open the chatbot.
3.  **Register a new user** or log in with an existing one.
4.  Start interacting with Chippy!
    * **Greetings:** Try "Hi", "Hello", "Good morning", "How are you?".
    * **General Queries:** "Tell me a joke", "Who are you?", "Help me", "Thanks".
    * **Product Search:** "laptop", "Apple phone", "gaming camera", "Sony headphones".
    * **Product Exploration:** After products appear, click "View Details" or "Add to Cart" on the cards.
    * **Specific Shopping Questions:** "What about price?", "How to pay?", "Shipping info", "Check stock of HP laptop".
    * **Chat Management:** Use the "Clear Chat" and "Logout" buttons in the chat header.
5.  Observe how Chippy responds with customized messages or interactive product cards.
6.  Verify chat history persists by closing and reopening the chat window (without logging out).
7.  Check your Firebase Console ([Firestore Data tab](https://console.firebase.google.com/u/0/project/_/firestore)) to see chat interactions being stored under your user's ID.

## Challenges Faced & Solutions

This project involved navigating several common full-stack development hurdles. Here's a summary of the challenges encountered and the solutions implemented:

1.  **Cross-Origin Resource Sharing (CORS) Issues:**
    * **Challenge:** Initial attempts to connect the React frontend (running on `http://localhost:3000`) with the Django backend (running on `http://127.0.0.1:8000`) were blocked by browser's security policies (`CORS policy: No 'Access-Control-Allow-Origin' header`). This included `OPTIONS` preflight requests and the actual `POST`/`GET` requests. A specific typo (`autherization` instead of `Authorization`) in the request header also caused blocks.
    * **Solution:** Implemented `django-cors-headers` on the backend, configuring `CorsMiddleware` in `settings.py` and setting `CORS_ALLOW_ALL_ORIGINS = True` (for development) or `CORS_ALLOWED_ORIGINS` to `http://localhost:3000`. Explicitly added `'authorization'` to `CORS_ALLOWED_HEADERS`. Corrected the `Authorization` header typo in frontend `axios` calls.

2.  **JWT Token Invalidation & `TypeError` during Login:**
    * **Challenge:** After successful login, the `GET /api/auth/me/` request (using the newly received access token) repeatedly failed with "Authentication credentials were not provided" or "Given token not valid for any token type" / "Token is invalid" errors. A `TypeError: string indices must be integers, not 'str'` also occurred during token processing on the backend.
    * **Solution:**
        * **Time Synchronization:** Ensured `TIME_ZONE = 'Asia/Kolkata'` was correctly set in Django's `settings.py` and system clocks were synchronized to resolve token expiration discrepancies.
        * **Token Blacklisting:** Configured `rest_framework_simplejwt.token_blacklist` in `INSTALLED_APPS` and ran migrations to enable proper token blacklisting for logout and refresh token rotation.
        * **`TypeError`:** The `TypeError` was traced to `serializer.data['token']` being a string instead of a dictionary. This was resolved by defining a `TokenPairSerializer` in `auth_serializers.py` and correctly nesting it within `UserLoginSerializer`, ensuring the serializer output structure was a dictionary for tokens.
        * **`SECRET_KEY` Consistency:** Verified the `SIGNING_KEY` in `SIMPLE_JWT` settings correctly referenced the project's `SECRET_KEY` variable.

3.  **Firebase Admin SDK Initialization for Local Development:**
    * **Challenge:** The Django backend failed to initialize the Firebase Admin SDK locally, as `__firebase_config` (a Canvas-specific environment variable) was not found. This resulted in "No config found" and "Firestore client not initialized" errors.
    * **Solution:** Implemented a fallback mechanism in `settings.py` to load Firebase credentials from a local `firebase_service_account.json` file when running outside the Canvas environment. This involved creating a Firebase project, downloading its service account key, and securely placing it in the backend directory. The project ID from this key was used for the `APP_ID` Firestore path.


4.  **Product Card Display and Prop Mismatch:**
    * **Challenge:** Product search results initially displayed literal HTML tags and `$\{variable\}` syntax. Additionally, clicking "View Details" or "Add to Cart" on product cards led to `onAction is not a function` error.
    * **Solution:**
        * **Template Literals:** Corrected the `botResponseText` string construction in `handleSendMessage` to use **backticks (`` ` ``)** consistently, ensuring JavaScript variable interpolation instead of literal string output. Verified no stray HTML tags were present.
        * **Prop Mismatch:** Identified that `ChatMessage` was expecting a `message` prop, but `App.js` was sending `content` and `type`. Corrected `ChatMessage`'s function signature to directly destructure `content`, `sender`, `type`, and `onProductAction`, resolving the `onAction` undefined issue and ensuring correct rendering of product cards.
