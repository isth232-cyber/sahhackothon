package com.sahapathi.ai.config;

import com.sahapathi.ai.entity.*;
import com.sahapathi.ai.enums.*;
import com.sahapathi.ai.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Configuration
@Profile("!no-db")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final ClassroomRepository classroomRepository;
    private final LessonRepository lessonRepository;
    private final StudentClassroomMappingRepository mappingRepository;
    private final AttendanceRepository attendanceRepository;
    private final ParticipationRepository participationRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedData() {
        return args -> {
            // Seed roles
            for (RoleName roleName : RoleName.values()) {
                if (!roleRepository.existsByName(roleName)) {
                    roleRepository.save(Role.builder()
                            .name(roleName)
                            .description(roleName.name().replace("ROLE_", "") + " role")
                            .build());
                }
            }

            // Seed base users
            User admin   = seedUser("admin@sahapathi.ai",   "admin123",   "System Administrator", null,         RoleName.ROLE_ADMIN,   "English");
            User teacher = seedUser("teacher@sahapathi.ai", "teacher123", "Demo Teacher",         "9876543210", RoleName.ROLE_TEACHER, "English");
            seedUser("student@sahapathi.ai", "student123", "Demo Student", "9876543211", RoleName.ROLE_STUDENT, "Hindi");

            // Seed demo students
            User priya  = seedUser("priya@test.com",  "test123", "Priya Kumar",   null, RoleName.ROLE_STUDENT, "English");
            User rahul  = seedUser("rahul@test.com",  "test123", "Rahul Singh",   null, RoleName.ROLE_STUDENT, "Hindi");
            User ananya = seedUser("ananya@test.com", "test123", "Ananya Sharma", null, RoleName.ROLE_STUDENT, "English");
            User arjun  = seedUser("arjun@test.com",  "test123", "Arjun Patel",   null, RoleName.ROLE_STUDENT, "English");
            User kavya  = seedUser("kavya@test.com",  "test123", "Kavya Reddy",   null, RoleName.ROLE_STUDENT, "Tamil");

            // Seed demo teacher
            User demoTeacher = seedUser("siva1@gmail.com", "siva123", "siva1", null, RoleName.ROLE_TEACHER, "English");

            // Seed classrooms (only if teacher has none)
            List<Classroom> existing = classroomRepository.findByTeacherIdAndIsActiveTrue(demoTeacher.getId());
            if (existing.isEmpty()) {
                Classroom c1 = seedClassroom("Science Grade 8",    "Science", "8", "Physics, Chemistry and Biology", demoTeacher, "DEMO0001");
                Classroom c2 = seedClassroom("Mathematics Grade 9", "Math",    "9", "Algebra and Geometry",           demoTeacher, "DEMO0002");
                Classroom c3 = seedClassroom("Hindi Literature",    "Hindi",   "8", "Hindi prose and poetry",         demoTeacher, "DEMO0003");

                // Enroll students in Science Grade 8
                List<User> students = List.of(priya, rahul, ananya, arjun, kavya);
                for (User s : students) enrollStudent(s, c1);
                enrollStudent(priya,  c2);
                enrollStudent(rahul,  c2);
                enrollStudent(ananya, c3);
                enrollStudent(kavya,  c3);

                // Seed lessons
                seedLesson("Introduction to Physics",    "Newton's laws of motion explain how objects move. First law: inertia. Second law: F=ma. Third law: action-reaction.",        "Basic physics concepts",    c1, demoTeacher, true);
                seedLesson("Chemical Reactions",         "Types: synthesis, decomposition, single/double replacement, combustion. Balancing equations is essential.",                 "Chemistry basics",          c1, demoTeacher, true);
                seedLesson("Cell Biology",               "Cells are the basic unit of life. Plant cells have cell walls and chloroplasts. Animal cells have centrioles.",             "Biology fundamentals",      c1, demoTeacher, true);
                seedLesson("Earth and Space",            "The solar system has 8 planets. Earth orbits the Sun in 365.25 days. The Moon orbits Earth in ~27 days.",                  "Solar system basics",       c1, demoTeacher, false);
                seedLesson("Algebra Fundamentals",       "Variables, expressions, and equations. Solving linear equations using inverse operations.",                                 "Intro to algebra",          c2, demoTeacher, true);
                seedLesson("Geometry Basics",            "Points, lines, angles, triangles. Pythagorean theorem: a²+b²=c². Area and perimeter formulas.",                            "Shapes and measurements",   c2, demoTeacher, true);
                seedLesson("Hindi Prose - Premchand",    "Munshi Premchand ki rachnaon mein samajik samasya ka chitran. Godan, Nirmala, Gaban pramukh upanyas hain.",                "Hindi literature basics",   c3, demoTeacher, true);
                seedLesson("Hindi Poetry - Kabir",       "Kabir ke dohe mein jeevan ki sachai ka varnan hai. Unki bhasha sadhi aur seedhi thi jo aam log samajh sakte the.",        "Kabir ke dohe",             c3, demoTeacher, true);

                // Seed attendance for last 5 days
                AttendanceStatus[][] statusGrid = {
                    { AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT },
                    { AttendanceStatus.PRESENT, AttendanceStatus.ABSENT,  AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT },
                    { AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.ABSENT,  AttendanceStatus.LATE,    AttendanceStatus.PRESENT },
                    { AttendanceStatus.LATE,    AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.ABSENT  },
                    { AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.ABSENT,  AttendanceStatus.PRESENT },
                };
                for (int d = 4; d >= 0; d--) {
                    LocalDate date = LocalDate.now().minusDays(d);
                    for (int i = 0; i < students.size(); i++) {
                        seedAttendance(students.get(i), c1, date, statusGrid[d][i], demoTeacher);
                    }
                }

                // Seed participation events
                seedParticipation(priya,  c1, ParticipationEventType.QUESTION_ASKED, "Asked about Newton's first law",          LocalDate.now().minusDays(4));
                seedParticipation(priya,  c1, ParticipationEventType.LESSON_VIEW,    "Viewed Introduction to Physics",          LocalDate.now().minusDays(3));
                seedParticipation(priya,  c1, ParticipationEventType.QUIZ_ATTEMPT,   "Attempted Physics Quiz",                  LocalDate.now().minusDays(2));
                seedParticipation(priya,  c1, ParticipationEventType.AI_INTERACTION, "Used AI to simplify content",             LocalDate.now().minusDays(1));
                seedParticipation(rahul,  c1, ParticipationEventType.QUESTION_ASKED, "Asked about chemical bonds",              LocalDate.now().minusDays(4));
                seedParticipation(rahul,  c1, ParticipationEventType.LESSON_VIEW,    "Viewed Chemical Reactions",               LocalDate.now().minusDays(2));
                seedParticipation(ananya, c1, ParticipationEventType.LESSON_VIEW,    "Viewed Cell Biology",                     LocalDate.now().minusDays(3));
                seedParticipation(ananya, c1, ParticipationEventType.AI_INTERACTION, "Used translation feature",                LocalDate.now().minusDays(1));
                seedParticipation(ananya, c1, ParticipationEventType.QUIZ_ATTEMPT,   "Attempted quiz",                         LocalDate.now());
                seedParticipation(arjun,  c1, ParticipationEventType.LESSON_VIEW,    "Viewed Earth and Space",                  LocalDate.now().minusDays(2));
                seedParticipation(arjun,  c1, ParticipationEventType.TRANSLATION,    "Translated lesson to Gujarati",           LocalDate.now().minusDays(1));
                seedParticipation(kavya,  c1, ParticipationEventType.QUESTION_ASKED, "Asked about solar system",               LocalDate.now().minusDays(3));
                seedParticipation(kavya,  c1, ParticipationEventType.TRANSLATION,    "Translated lesson to Tamil",             LocalDate.now().minusDays(1));
                seedParticipation(kavya,  c1, ParticipationEventType.LESSON_VIEW,    "Viewed Introduction to Physics",         LocalDate.now());

                log.info("✅ Demo data seeded: 3 classrooms, 5 students, 8 lessons, attendance + participation");
            } else {
                log.info("✅ Demo data already exists, skipping seed");
            }

            log.info("Data seeding completed!");
        };
    }

    private User seedUser(String email, String rawPassword, String fullName, String phone, RoleName roleName, String lang) {
        if (userRepository.existsByEmail(email)) return userRepository.findByEmail(email).orElseThrow();
        Role role = roleRepository.findByName(roleName).orElseThrow();
        return userRepository.save(User.builder()
                .email(email).password(passwordEncoder.encode(rawPassword))
                .fullName(fullName).phone(phone).role(role).languagePref(lang).build());
    }

    private Classroom seedClassroom(String name, String subject, String grade, String desc, User teacher, String code) {
        return classroomRepository.findByInviteCode(code).orElseGet(() ->
            classroomRepository.save(Classroom.builder()
                .name(name).subject(subject).grade(grade).description(desc)
                .teacher(teacher).inviteCode(code).isActive(true).build()));
    }

    private void enrollStudent(User student, Classroom classroom) {
        if (!mappingRepository.existsByStudentIdAndClassroomId(student.getId(), classroom.getId())) {
            mappingRepository.save(StudentClassroomMapping.builder()
                .student(student).classroom(classroom).isActive(true).build());
        }
    }

    private void seedLesson(String title, String content, String summary, Classroom classroom, User teacher, boolean published) {
        if (lessonRepository.findByClassroomId(classroom.getId()).stream().noneMatch(l -> l.getTitle().equals(title))) {
            lessonRepository.save(Lesson.builder()
                .title(title).content(content).summary(summary)
                .classroom(classroom).createdBy(teacher).isPublished(published).build());
        }
    }

    private void seedAttendance(User student, Classroom classroom, LocalDate date, AttendanceStatus status, User markedBy) {
        if (!attendanceRepository.findByStudentIdAndClassroomIdAndDate(student.getId(), classroom.getId(), date).isPresent()) {
            attendanceRepository.save(Attendance.builder()
                .student(student).classroom(classroom).date(date)
                .status(status).markedBy(markedBy).build());
        }
    }

    private void seedParticipation(User student, Classroom classroom, ParticipationEventType type, String desc, LocalDate date) {
        participationRepository.save(Participation.builder()
            .student(student).classroom(classroom)
            .eventType(type).description(desc).score(1).eventDate(date).build());
    }
}
