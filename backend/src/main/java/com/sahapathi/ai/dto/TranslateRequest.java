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
public class TranslateRequest {
    @NotBlank(message = "Text is required")
    private String text;

    @NotBlank(message = "Target language is required")
    private String language;
}
