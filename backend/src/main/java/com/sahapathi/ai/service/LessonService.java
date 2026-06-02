package com.sahapathi.ai.service;

import com.sahapathi.ai.dto.LessonRequest;
import com.sahapathi.ai.dto.LessonResponse;
import com.sahapathi.ai.entity.Classroom;
import com.sahapathi.ai.entity.Lesson;
import com.sahapathi.ai.entity.User;
import com.sahapathi.ai.exception.ResourceNotFoundException;
import com.sahapathi.ai.repository.ClassroomRepository;
import com.sahapathi.ai.repository.LessonRepository;
import com.sahapathi.ai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;

    @Transactional
    public LessonResponse createLesson(LessonRequest request, Long teacherId) {
        Classroom classroom = classroomRepository.findById(request.getClassroomId())
                .orElseThrow(() -> new ResourceNotFoundException("Classroom", "id", request.getClassroomId()));
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", teacherId));

        Lesson lesson = Lesson.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .summary(request.getSummary())
                .classroom(classroom)
                .createdBy(teacher)
                .isPublished(request.getIsPublished() != null ? request.getIsPublished() : true)
                .build();

        lesson = lessonRepository.save(lesson);
        return mapToResponse(lesson);
    }

    public LessonResponse getLesson(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", id));
        return mapToResponse(lesson);
    }

    public List<LessonResponse> getLessonsByClassroom(Long classroomId, boolean publishedOnly) {
        List<Lesson> lessons = publishedOnly
                ? lessonRepository.findByClassroomIdAndIsPublishedTrue(classroomId)
                : lessonRepository.findByClassroomId(classroomId);
        return lessons.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public LessonResponse updateLesson(Long id, LessonRequest request) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", id));

        lesson.setTitle(request.getTitle());
        lesson.setContent(request.getContent());
        if (request.getSummary() != null) lesson.setSummary(request.getSummary());
        if (request.getIsPublished() != null) lesson.setIsPublished(request.getIsPublished());

        lesson = lessonRepository.save(lesson);
        return mapToResponse(lesson);
    }

    @Transactional
    public void deleteLesson(Long id) {
        if (!lessonRepository.existsById(id)) {
            throw new ResourceNotFoundException("Lesson", "id", id);
        }
        lessonRepository.deleteById(id);
    }

    private LessonResponse mapToResponse(Lesson lesson) {
        return LessonResponse.builder()
                .id(String.valueOf(lesson.getId()))
                .title(lesson.getTitle())
                .content(lesson.getContent())
                .summary(lesson.getSummary())
                .classroomId(String.valueOf(lesson.getClassroom().getId()))
                .classroomName(lesson.getClassroom().getName())
                .createdById(String.valueOf(lesson.getCreatedBy().getId()))
                .createdByName(lesson.getCreatedBy().getFullName())
                .isPublished(lesson.getIsPublished())
                .createdAt(lesson.getCreatedAt())
                .updatedAt(lesson.getUpdatedAt())
                .build();
    }
}
