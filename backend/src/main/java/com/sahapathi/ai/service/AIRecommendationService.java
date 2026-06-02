package com.sahapathi.ai.service;

import com.sahapathi.ai.dto.AIRecommendationResponse;
import com.sahapathi.ai.entity.AIRecommendation;
import com.sahapathi.ai.entity.Classroom;
import com.sahapathi.ai.entity.User;
import com.sahapathi.ai.enums.Priority;
import com.sahapathi.ai.enums.RecommendationType;
import com.sahapathi.ai.exception.ResourceNotFoundException;
import com.sahapathi.ai.repository.*;
import com.sahapathi.ai.service.ai.AIProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AIRecommendationService {

    private final AIRecommendationRepository recommendationRepository;
    private final StudentClassroomMappingRepository mappingRepository;
    private final AttendanceRepository attendanceRepository;
    private final ParticipationRepository participationRepository;
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;
    private final AIProvider aiProvider;

    @Transactional
    public List<AIRecommendationResponse> generateRecommendations(Long classroomId) {
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom", "id", classroomId));

        List<AIRecommendation> recommendations = new ArrayList<>();
        var students = mappingRepository.findByClassroomIdAndIsActiveTrue(classroomId);

        for (var mapping : students) {
            User student = mapping.getStudent();
            String message = aiProvider.generateRecommendation(student.getFullName(), "classroom analysis");

            RecommendationType type = RecommendationType.SUPPORT_NEEDED;
            Priority priority = Priority.MEDIUM;

            Long totalScore = participationRepository.getTotalScoreByStudentAndClassroom(student.getId(), classroomId);
            if (totalScore == null || totalScore < 5) {
                type = RecommendationType.LOW_PARTICIPATION;
                priority = Priority.HIGH;
            }

            long totalAttendance = attendanceRepository.countByStudentIdAndClassroomId(student.getId(), classroomId);
            long presentCount = attendanceRepository.countByStudentIdAndClassroomIdAndStatus(
                    student.getId(), classroomId, com.sahapathi.ai.enums.AttendanceStatus.PRESENT);
            if (totalAttendance > 0 && ((double) presentCount / totalAttendance) < 0.7) {
                type = RecommendationType.ATTENDANCE_CONCERN;
                priority = Priority.HIGH;
            }

            AIRecommendation rec = AIRecommendation.builder()
                    .student(student)
                    .classroom(classroom)
                    .type(type.name())
                    .message(message)
                    .priority(priority.name())
                    .build();
            recommendations.add(recommendationRepository.save(rec));
        }

        return recommendations.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<AIRecommendationResponse> getRecommendations(Long classroomId) {
        return recommendationRepository.findByClassroomIdAndIsResolvedFalseOrderByCreatedAtDesc(classroomId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public void resolveRecommendation(Long id) {
        AIRecommendation rec = recommendationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recommendation", "id", id));
        rec.setIsResolved(true);
        recommendationRepository.save(rec);
    }

    private AIRecommendationResponse mapToResponse(AIRecommendation rec) {
        return AIRecommendationResponse.builder()
                .id(String.valueOf(rec.getId()))
                .studentId(String.valueOf(rec.getStudent().getId()))
                .studentName(rec.getStudent().getFullName())
                .classroomId(String.valueOf(rec.getClassroom().getId()))
                .classroomName(rec.getClassroom().getName())
                .type(rec.getType())
                .message(rec.getMessage())
                .priority(rec.getPriority())
                .isResolved(rec.getIsResolved())
                .createdAt(rec.getCreatedAt())
                .build();
    }
}
