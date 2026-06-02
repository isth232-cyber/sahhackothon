package com.sahapathi.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TranslateResponse {
    private String originalText;
    private String translatedText;
    private String sourceLanguage;
    private String targetLanguage;
}
