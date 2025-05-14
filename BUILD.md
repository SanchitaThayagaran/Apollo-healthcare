# Apollo Healthcare Frontend Setup

## Prerequisites

- Node.js (v16+)
- npm or yarn

## Steps

1. Navigate to the Frontend Directory

```
cd ../Apollo-healthcare
```

2. Install Frontend Dependencies

```
npm install
# or
yarn install
```

3. Configure Environment Variables
   Create a .env file in the frontend folder:

```
env
REACT_APP_API_BASE_URL=http://127.0.0.1:8000
```

This base URL will allow your React app to make API calls to the Django backend.

4. Run the Frontend App

```
npm start
# or
yarn start
```

The app should now be accessible at http://localhost:3000.

# Apollo Healthcare Backend Setup

## Prerequisites

- Python 3.11+
- pip
- PostgreSQL (for production; SQLite can be used for local testing)

## 1. Clone the Repository

```
git clone <repo-url>
cd Apollo-healthcare/healthmanagement
```

## 2. Install Python Dependencies

```
pip install -r requirements.txt
```

## 3. Set Up PostgreSQL

- Install PostgreSQL (macOS: `brew install postgresql`)
- Start PostgreSQL:
  ```
  brew services start postgresql
  ```
- Create a database and user (replace with your DB name/user if needed):
  ```
  psql -U postgres
  CREATE DATABASE "apollo-health";
  CREATE USER postgres WITH PASSWORD 'postgres';
  GRANT ALL PRIVILEGES ON DATABASE "apollo-health" TO postgres;
  \q
  ```
- Update `healthmanagement/healthmanagement/settings.py` with your DB credentials if needed:
  ```python
  DATABASES = {
      'default': {
          'ENGINE': 'django.db.backends.postgresql',
          'NAME': 'apollo-health',
          'USER': 'postgres',
          'PASSWORD': 'postgres',
          'HOST': 'localhost',
          'PORT': '5432',
      }
  }
  ```

## 4. Run Migrations

```
python manage.py migrate
```

## 5. (Optional) Create a Superuser

```
python manage.py createsuperuser
```

## 6. Update OPEN_AI key 

Update open ai key in .env file at `healthmanagement` for self assessments to work

## 7. Run the Development Server

```
python manage.py runserver
```

## 8. API Usage

- The risk prediction endpoint is available at:
  ```
  POST http://127.0.0.1:8000/api/accounts/api/risk/
  Content-Type: application/json
  ```
- Example payload:
  ```json
  {
    "requestedEngines": ["QRisk3"],
    "sex": "Male",
    "age": 25,
    "bmi": 25.2,
    "ethnicity": "NotRecorded",
    "smokingStatus": "NonSmoker"
  }
  ```

## 9. CORS

If you are using a frontend on a different port, make sure to configure CORS in `settings.py`:

```python
INSTALLED_APPS += ["corsheaders"]
MIDDLEWARE = ["corsheaders.middleware.CorsMiddleware"] + MIDDLEWARE
CORS_ALLOW_ALL_ORIGINS = True  # For development only
```

---

For any issues, check the error messages in your terminal or contact the project maintainer.
