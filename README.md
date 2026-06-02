
# SahaPathi AI – Multilingual Inclusive Classroom Assistant

> An AI-powered full-stack platform that helps teachers create inclusive classroom environments through multilingual support, accessibility features, participation tracking, and student engagement monitoring.

## 🏗️ Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   React Frontend │────▶│  Spring Boot API  │────▶│     MySQL DB     │
│   (Vite + MUI)   │◀────│  (Java 21 + JWT) │◀────│  (sahapathi_db)  │
└──────────────────┘     └────────┬─────────┘     └──────────────────┘
                                  │
                         ┌────────▼─────────┐
                         │  AI Service Layer │
                         │ (Mock → OpenAI/   │
                         │  Gemini/Azure/HF) │
                         └──────────────────┘
```

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite, Material UI, React Router, Recharts, Axios |
| **Backend** | Spring Boot 3.3, Java 21, Spring Security (JWT), Spring Data JPA |
| **Database** | MySQL 8+ |
| **AI Layer** | Mock implementation (pluggable for OpenAI, Gemini, Azure AI, HuggingFace) |
| **Docs** | Swagger / OpenAPI 3 |

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Manage schools, teachers, classrooms, view platform analytics |
| **Teacher** | Create classrooms, upload lessons, manage quizzes, track attendance & participation, view AI insights |
| **Student** | Join classrooms, access lessons, translate content, use TTS, attempt quizzes |

## 📦 Project Structure

```
SahAI/
├── backend/                        # Spring Boot 3 (Java 21)
│   ├── pom.xml
│   └── src/main/java/com/sahapathi/ai/
│       ├── config/                 # Security, CORS, Swagger, DataSeeder
│       ├── controller/             # 8 REST controllers
│       ├── dto/                    # Request/Response DTOs
│       ├── entity/                 # 13 JPA entities
│       ├── enums/                  # Role, Language, Status enums
│       ├── exception/              # Global exception handler
│       ├── repository/             # Spring Data JPA repositories
│       ├── security/               # JWT filter, provider, UserDetailsService
│       └── service/                # Business logic + AI abstraction
│           └── ai/                 # AIProvider interface + MockAIServiceImpl
├── frontend/                       # React + Vite
│   └── src/
│       ├── components/             # Shared UI components
│       ├── context/                # Auth, Accessibility contexts
│       ├── layouts/                # DashboardLayout, Sidebar, TopNavbar
│       ├── pages/                  # Auth, Teacher, Student, Admin pages
│       ├── services/               # Axios API client + service modules
│       └── styles/                 # MUI theme
├── schema.sql                      # MySQL schema (13 tables)
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Java 21+
- Node.js 18+
- MySQL 8+
- Maven 3.9+

### 1. Database Setup
```bash
mysql -u root -p < schema.sql
```
Or let Spring Boot auto-create tables (JPA `ddl-auto: update`).

### 2. Backend Setup
```bash
cd backend

# Update MySQL credentials in src/main/resources/application.yml
# Default: root/password on localhost:3306

mvn clean install
mvn spring-boot:run
```
Backend starts at: **http://localhost:8081**
Swagger UI: **http://localhost:8080/swagger-ui.html**

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend starts at: **http://localhost:5173**

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sahapathi.ai | admin123 |
| Teacher | teacher@sahapathi.ai | teacher123 |
| Student | student@sahapathi.ai | student123 |

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### Classrooms
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/classrooms` | Create classroom (Teacher) |
| GET | `/api/classrooms/{id}` | Get classroom |
| GET | `/api/classrooms/my-classrooms` | Get user's classrooms |
| PUT | `/api/classrooms/{id}` | Update classroom |
| DELETE | `/api/classrooms/{id}` | Delete classroom |
| POST | `/api/classrooms/join` | Join with invite code |

### AI Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/translate` | Translate text |
| POST | `/api/ai/simplify` | Simplify text |
| GET | `/api/ai/recommendations/{classroomId}` | Get AI insights |

### Lessons, Quizzes, Attendance, Participation, Notifications
Full CRUD endpoints — see Swagger UI for complete documentation.

## ♿ Accessibility Features

- **Text-to-Speech** (Web Speech API)
- **Speech-to-Text** (Web Speech API)
- **Adjustable Font Sizes** (Small / Medium / Large)
- **Dyslexia-Friendly Mode** (OpenDyslexic font, increased spacing)
- **High Contrast Mode** (WCAG-compliant colors)

## 🌐 Supported Languages

English, Hindi (हिंदी), Tamil (தமிழ்), Telugu (తెలుగు), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം)

## 🤖 AI Integration

The AI layer uses an interface-based design pattern:

```java
public interface AIProvider {
    TranslateResponse translate(String text, String targetLanguage);
    SimplifyResponse simplify(String text, String language);
    String generateRecommendation(String studentName, String context);
}
```

Currently uses `MockAIServiceImpl`. To integrate a real provider:
1. Create `OpenAIServiceImpl implements AIProvider`
2. Add `@Primary` annotation
3. Configure API keys in `application.yml`

## 📊 Database Schema

13 tables with proper foreign keys, indexes, and constraints:
- `roles`, `users`, `classrooms`, `student_classroom_mapping`
- `lessons`, `attendance`, `participation`
- `quizzes`, `questions`, `quiz_attempts`, `quiz_answers`
- `notifications`, `ai_recommendations`

## 🚢 Deployment

### Production Build
```bash
# Backend
cd backend && mvn clean package -DskipTests
java -jar target/sahapathi-ai-1.0.0.jar

# Frontend
cd frontend && npm run build
# Serve dist/ with Nginx or any static server
```

### Environment Variables
```yaml
SPRING_DATASOURCE_URL: jdbc:mysql://host:3306/sahapathi_db
SPRING_DATASOURCE_USERNAME: your_user
SPRING_DATASOURCE_PASSWORD: your_password
APP_JWT_SECRET: your_base64_encoded_secret
```

## 📄 License

This project is built for educational purposes and hackathon demonstrations.
