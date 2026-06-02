package com.sahapathi.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParticipationStatsResponse {
    private String studentId;
    private String studentName;
    private String classroomId;
    private String totalScore;
    private Map<String, String> eventTypeCounts;
    private Map<String, String> dailyScores;
}
