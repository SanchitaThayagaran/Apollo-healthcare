# Apollo-healthcare
Team11- Health Management System

Overview - 

The Healthcare Management System (HMS) is designed to digitize patient records and improve doctor-patient interactions. It includes secure authentication and role-based access control for doctors, patients, and staff. The system features electronic health records (EHR), enabling patients to upload their medical history, lab results, and prescriptions, while doctors can update consultation notes. Additionally, search and filtering functions allow for quick access to patient history, prescriptions, and diagnoses.  To enhance patient care, the system includes health risk assessments using self-assessment questionnaires to evaluate potential risks such as diabetes, heart disease, and other health conditions. The system also automates prescription refill requests and tracks patient drug usage to ensure proper medication management. To maintain data security and compliance, the system employs encryption and HIPAA-compliant security measures to protect sensitive medical information.

# Apollo Healthcare Backend Setup

## Prerequisites
- Python 3.11+
- pip
- PostgreSQL 

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

## 6. Run the Development Server
```
python manage.py runserver
```


## 7. CORS
If you are using a frontend on a different port, make sure to configure CORS in `settings.py`:
```python
INSTALLED_APPS += ["corsheaders"]
MIDDLEWARE = ["corsheaders.middleware.CorsMiddleware"] + MIDDLEWARE
CORS_ALLOW_ALL_ORIGINS = True  # For development only
```



