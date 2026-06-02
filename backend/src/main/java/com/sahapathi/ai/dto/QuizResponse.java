package com.sahapathi.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizResponse {
    private String id;
    private String title;
    private String description;
    private String classroomId;
    private String classroomName;
    private String createdById;
    private String createdByName;
    private Integer durationMinutes;
    private Integer totalMarks;
    private Boolean isPublished;
    private LocalDateTime dueDate;
    private List<QuestionResponse> questions;
    private int questionCount;
    private Double averageScore;
    private int attemptCount;
    private LocalDateTime createdAt;
}

