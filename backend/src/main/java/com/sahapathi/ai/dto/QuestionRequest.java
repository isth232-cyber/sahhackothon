package com.sahapathi.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionRequest {
    @NotBlank(message = "Question text is required")
    private String questionText;
    @NotBlank(message = "Option A is required")
    private String optionA;
    @NotBlank(message = "Option B is required")
    private String optionB;
    private String optionC;
    private String optionD;
    @NotBlank(message = "Correct option is required")
    private String correctOption;
    private Integer points;
    private String explanation;
}
