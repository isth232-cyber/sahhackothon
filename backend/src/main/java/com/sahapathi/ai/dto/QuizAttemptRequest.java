package com.sahapathi.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAttemptRequest {
    private Long quizId;
    private Map<Long, String> answers; // questionId -> selectedOption
}
