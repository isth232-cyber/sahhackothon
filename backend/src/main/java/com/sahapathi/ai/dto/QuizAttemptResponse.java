package com.sahapathi.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAttemptResponse {
    private String id;
    private String quizId;
    private String quizTitle;
    private String studentId;
    private String studentName;
    private Integer score;
    private Integer totalMarks;
    private Double percentage;
    private Boolean isCompleted;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
}
