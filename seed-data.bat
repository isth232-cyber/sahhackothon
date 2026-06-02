@echo off
REM Seed Demo Data Script for SahAi
echo Starting data seeding...
set TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzaXZhMUBnbWFpbC5jb20iLCJpYXQiOjE3ODAzOTEzMjIsImV4cCI6MTc4MDQ3NzcyMn0.pivhh1b5UHRnABXnNe9zprSgQmM_tYIUbQtv33pKBXo
set API=http://localhost:8082/api

REM Create 2 more classrooms
echo Creating classrooms...
curl -s -X POST %API%/classrooms -H "Content-Type: application/json" -H "Authorization: Bearer %TOKEN%" -d "{\"name\":\"Mathematics Grade 9\",\"subject\":\"Math\",\"grade\":\"9\",\"description\":\"Advanced math\"}" > nul
curl -s -X POST %API%/classrooms -H "Content-Type: application/json" -H "Authorization: Bearer %TOKEN%" -d "{\"name\":\"Hindi Literature\",\"subject\":\"Hindi\",\"grade\":\"8\",\"description\":\"Hindi class\"}" > nul

REM Register 5 students
echo Creating students...
curl -s -X POST %API%/auth/register -H "Content-Type: application/json" -d "{\"fullName\":\"Priya Kumar\",\"email\":\"priya@test.com\",\"password\":\"test123\",\"role\":\"STUDENT\",\"languagePref\":\"English\"}" > nul
curl -s -X POST %API%/auth/register -H "Content-Type: application/json" -d "{\"fullName\":\"Rahul Singh\",\"email\":\"rahul@test.com\",\"password\":\"test123\",\"role\":\"STUDENT\",\"languagePref\":\"Hindi\"}" > nul
curl -s -X POST %API%/auth/register -H "Content-Type: application/json" -d "{\"fullName\":\"Ananya Sharma\",\"email\":\"ananya@test.com\",\"password\":\"test123\",\"role\":\"STUDENT\",\"languagePref\":\"English\"}" > nul
curl -s -X POST %API%/auth/register -H "Content-Type: application/json" -d "{\"fullName\":\"Arjun Patel\",\"email\":\"arjun@test.com\",\"password\":\"test123\",\"role\":\"STUDENT\",\"languagePref\":\"English\"}" > nul
curl -s -X POST %API%/auth/register -H "Content-Type: application/json" -d "{\"fullName\":\"Kavya Reddy\",\"email\":\"kavya@test.com\",\"password\":\"test123\",\"role\":\"STUDENT\",\"languagePref\":\"Tamil\"}" > nul

REM Get invite codes
echo Enrolling students...
for /L %%i in (12,1,16) do (
    curl -s -X POST %API%/classrooms/join?inviteCode=2F80B9EC -H "Authorization: Bearer %%STUDENT_TOKEN%%" > nul 2>&1
)

REM Create lessons for classroom 1
echo Creating lessons...
curl -s -X POST %API%/lessons -H "Content-Type: application/json" -H "Authorization: Bearer %TOKEN%" -d "{\"title\":\"Introduction to Physics\",\"content\":\"Newton's laws of motion...\",\"summary\":\"Basic physics concepts\",\"classroomId\":1,\"isPublished\":true}" > nul
curl -s -X POST %API%/lessons -H "Content-Type: application/json" -H "Authorization: Bearer %TOKEN%" -d "{\"title\":\"Chemical Reactions\",\"content\":\"Types of reactions...\",\"summary\":\"Chemistry basics\",\"classroomId\":1,\"isPublished\":true}" > nul
curl -s -X POST %API%/lessons -H "Content-Type: application/json" -H "Authorization: Bearer %TOKEN%" -d "{\"title\":\"Cell Biology\",\"content\":\"Plant and animal cells...\",\"summary\":\"Biology fundamentals\",\"classroomId\":1,\"isPublished\":true}" > nul

REM Create a quiz for classroom 1
echo Creating quiz...
curl -s -X POST %API%/quizzes -H "Content-Type: application/json" -H "Authorization: Bearer %TOKEN%" -d "{\"title\":\"Physics Quiz 1\",\"description\":\"Test your knowledge\",\"classroomId\":1,\"durationMinutes\":30,\"questions\":[{\"questionText\":\"What is Newton's first law?\",\"optionA\":\"Force equals mass times acceleration\",\"optionB\":\"An object at rest stays at rest\",\"optionC\":\"Every action has a reaction\",\"optionD\":\"None\",\"correctOption\":\"optionB\",\"points\":10},{\"questionText\":\"What is the SI unit of force?\",\"optionA\":\"Joule\",\"optionB\":\"Watt\",\"optionC\":\"Newton\",\"optionD\":\"Pascal\",\"correctOption\":\"optionC\",\"points\":10}]}" > nul

REM Publish the quiz
curl -s -X PUT %API%/quizzes/1/publish -H "Authorization: Bearer %TOKEN%" > nul

REM Mark attendance (last 3 days)
echo Marking attendance...
for /L %%d in (0,1,2) do (
    curl -s -X POST %API%/attendance/mark -H "Content-Type: application/json" -H "Authorization: Bearer %TOKEN%" -d "{\"classroomId\":1,\"date\":\"2026-06-0%%d\",\"records\":[{\"studentId\":12,\"status\":\"PRESENT\"},{\"studentId\":13,\"status\":\"PRESENT\"},{\"studentId\":14,\"status\":\"ABSENT\"},{\"studentId\":15,\"status\":\"LATE\"},{\"studentId\":16,\"status\":\"PRESENT\"}]}" > nul 2>&1
)

REM Track participation events
echo Tracking participation...
curl -s -X POST "%API%/participation/track?studentId=12&classroomId=1&eventType=QUESTION_ASKED&description=Asked about gravity" -H "Authorization: Bearer %TOKEN%" > nul
curl -s -X POST "%API%/participation/track?studentId=12&classroomId=1&eventType=ANSWER_GIVEN&description=Answered correctly" -H "Authorization: Bearer %TOKEN%" > nul
curl -s -X POST "%API%/participation/track?studentId=13&classroomId=1&eventType=QUESTION_ASKED&description=Asked question" -H "Authorization: Bearer %TOKEN%" > nul
curl -s -X POST "%API%/participation/track?studentId=15&classroomId=1&eventType=QUIZ_ATTEMPT&description=Completed quiz" -H "Authorization: Bearer %TOKEN%" > nul
curl -s -X POST "%API%/participation/track?studentId=16&classroomId=1&eventType=PARTICIPATION&description=Active in class" -H "Authorization: Bearer %TOKEN%" > nul

echo.
echo ========================================
echo Demo data seeded successfully!
echo ========================================
echo.
echo Classroom: Science Grade 8 (ID: 1)
echo Invite Code: 2F80B9EC
echo Students: 5 (Priya, Rahul, Ananya, Arjun, Kavya)
echo Lessons: 3
echo Quizzes: 1
echo Attendance: Last 3 days
echo Participation: Multiple events tracked
echo.
echo Login credentials (all students):
echo Password: test123
echo.
echo Refresh your browser to see the data!
pause
