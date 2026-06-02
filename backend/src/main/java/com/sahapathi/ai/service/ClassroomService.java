package com.sahapathi.ai.service;

import com.sahapathi.ai.dto.ClassroomRequest;
import com.sahapathi.ai.dto.ClassroomResponse;
import com.sahapathi.ai.dto.UserResponse;
import com.sahapathi.ai.entity.*;
import com.sahapathi.ai.exception.BadRequestException;
import com.sahapathi.ai.exception.ResourceNotFoundException;
import com.sahapathi.ai.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassroomService {

    private final ClassroomRepository classroomRepository;
    private final StudentClassroomMappingRepository mappingRepository;
    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final QuizRepository quizRepository;

    @Transactional
    public ClassroomResponse createClassroom(ClassroomRequest request, Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", teacherId));

        Classroom classroom = Classroom.builder()
                .name(request.getName())
                .subject(request.getSubject())
                .grade(request.getGrade())
                .description(request.getDescription())
                .inviteCode(generateInviteCode())
                .teacher(teacher)
                .build();

        classroom = classroomRepository.save(classroom);
        return mapToResponse(classroom);
    }

    public ClassroomResponse getClassroom(Long id) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom", "id", id));
        return mapToResponse(classroom);
    }

    public List<ClassroomResponse> getTeacherClassrooms(Long teacherId) {
        return classroomRepository.findByTeacherIdAndIsActiveTrue(teacherId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ClassroomResponse> getStudentClassrooms(Long studentId) {
        return mappingRepository.findByStudentIdAndIsActiveTrue(studentId)
                .stream()
                .map(mapping -> mapToResponse(mapping.getClassroom()))
                .collect(Collectors.toList());
    }

    @Transactional
    public ClassroomResponse updateClassroom(Long id, ClassroomRequest request, Long teacherId) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom", "id", id));

        if (!classroom.getTeacher().getId().equals(teacherId)) {
            throw new BadRequestException("You can only update your own classrooms");
        }

        classroom.setName(request.getName());
        classroom.setSubject(request.getSubject());
        classroom.setGrade(request.getGrade());
        classroom.setDescription(request.getDescription());
        classroom = classroomRepository.save(classroom);

        return mapToResponse(classroom);
    }

    @Transactional
    public void deleteClassroom(Long id, Long teacherId) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom", "id", id));

        if (!classroom.getTeacher().getId().equals(teacherId)) {
            throw new BadRequestException("You can only delete your own classrooms");
        }

        classroom.setIsActive(false);
        classroomRepository.save(classroom);
    }

    @Transactional
    public String joinClassroom(String inviteCode, Long studentId) {
        Classroom classroom = classroomRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom", "inviteCode", inviteCode));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", studentId));

        if (mappingRepository.existsByStudentIdAndClassroomId(studentId, classroom.getId())) {
            throw new BadRequestException("Already joined this classroom");
        }

        mappingRepository.save(StudentClassroomMapping.builder()
                .student(student)
                .classroom(classroom)
                .build());

        return "Successfully joined classroom: " + classroom.getName();
    }

    public List<UserResponse> getClassroomStudents(Long classroomId) {
        return mappingRepository.findByClassroomIdAndIsActiveTrue(classroomId)
                .stream()
                .map(mapping -> {
                    User student = mapping.getStudent();
                    return UserResponse.builder()
                            .id(student.getId())
                            .fullName(student.getFullName())
                            .email(student.getEmail())
                            .phone(student.getPhone())
                            .role(student.getRole().getName().name())
                            .languagePref(student.getLanguagePref())
                            .isActive(student.getIsActive())
                            .build();
                })
                .collect(Collectors.toList());
    }

    public List<ClassroomResponse> getAllClassrooms() {
        return classroomRepository.findAll().stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    private ClassroomResponse mapToResponse(Classroom classroom) {
        return ClassroomResponse.builder()
                .id(classroom.getId())
                .name(classroom.getName())
                .subject(classroom.getSubject())
                .grade(classroom.getGrade())
                .description(classroom.getDescription())
                .inviteCode(classroom.getInviteCode())
                .teacherId(classroom.getTeacher().getId())
                .teacherName(classroom.getTeacher().getFullName())
                .studentCount(mappingRepository.countByClassroomIdAndIsActiveTrue(classroom.getId()))
                .lessonCount(lessonRepository.countByClassroomId(classroom.getId()))
                .quizCount(quizRepository.countByClassroomId(classroom.getId()))
                .isActive(classroom.getIsActive())
                .createdAt(classroom.getCreatedAt())
                .build();
    }

    private String generateInviteCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase(java.util.Locale.ROOT);
    }
}
