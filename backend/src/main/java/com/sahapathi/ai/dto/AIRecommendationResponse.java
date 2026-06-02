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
public class AIRecommendationResponse {
    private String id;
    private String studentId;
    private String studentName;
    private String classroomId;
    private String classroomName;
    private String type;
    private String message;
    private String priority;
    private Boolean isResolved;
    private LocalDateTime createdAt;
}
