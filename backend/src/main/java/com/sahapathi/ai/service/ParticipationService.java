package com.sahapathi.ai.service;

import com.sahapathi.ai.dto.ParticipationStatsResponse;
import com.sahapathi.ai.entity.Classroom;
import com.sahapathi.ai.entity.Participation;
import com.sahapathi.ai.entity.User;
import com.sahapathi.ai.enums.ParticipationEventType;
import com.sahapathi.ai.exception.ResourceNotFoundException;
import com.sahapathi.ai.repository.ClassroomRepository;
import com.sahapathi.ai.repository.ParticipationRepository;
import com.sahapathi.ai.repository.StudentClassroomMappingRepository;
import com.sahapathi.ai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParticipationService {

    private final ParticipationRepository participationRepository;
    private final UserRepository userRepository;
    private final ClassroomRepository classroomRepository;
    private final StudentClassroomMappingRepository mappingRepository;

    @Transactional
    public void trackEvent(Long studentId, Long classroomId, String eventType, String description) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", studentId));
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom", "id", classroomId));

        Participation participation = Participation.builder()
                .student(student)
                .classroom(classroom)
                .eventType(ParticipationEventType.valueOf(eventType))
                .description(description)
                .eventDate(LocalDate.now())
                .score(1)
                .build();

        participationRepository.save(participation);
    }

    public ParticipationStatsResponse getStudentStats(Long studentId, Long classroomId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", studentId));

        Long totalScore = participationRepository.getTotalScoreByStudentAndClassroom(studentId, classroomId);
        List<Object[]> eventCounts = participationRepository.countByEventType(studentId, classroomId);

        Map<String, String> eventTypeCounts = new LinkedHashMap<>();
        for (Object[] row : eventCounts) {
            eventTypeCounts.put(row[0].toString(), row[1].toString());
        }

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(30);
        List<Object[]> dailyScoreRows = participationRepository.getDailyScores(classroomId, startDate, endDate);

        Map<String, String> dailyScores = new LinkedHashMap<>();
        for (Object[] row : dailyScoreRows) {
            if (row[0] != null) {
                dailyScores.put(row[0].toString(), row[1].toString());
            }
        }

        return ParticipationStatsResponse.builder()
                .studentId(String.valueOf(studentId))
                .studentName(student.getFullName())
                .classroomId(String.valueOf(classroomId))
                .totalScore(totalScore != null ? String.valueOf(totalScore) : "0")
                .eventTypeCounts(eventTypeCounts)
                .dailyScores(dailyScores)
                .build();
    }

    public List<ParticipationStatsResponse> getClassroomStats(Long classroomId) {
        return mappingRepository.findByClassroomIdAndIsActiveTrue(classroomId)
                .stream()
                .map(mapping -> getStudentStats(mapping.getStudent().getId(), classroomId))
                .collect(Collectors.toList());
    }
}
