package com.sahapathi.ai.service.ai;

import com.sahapathi.ai.dto.SimplifyResponse;
import com.sahapathi.ai.dto.TranslateResponse;

/**
 * AI Service interface - abstraction layer for AI providers.
 * Implementations: MockAIServiceImpl, OpenAIServiceImpl, GeminiServiceImpl, etc.
 */
public interface AIProvider {

    TranslateResponse translate(String text, String targetLanguage);

    SimplifyResponse simplify(String text, String language);

    String generateRecommendation(String studentName, String context);

    /** Generate a story-based numeracy problem for a child (FLN feature) */
    String generateNumeracyStory(int ageGroup, String topic, String language);

    /** Assess reading level of a text passage (FLN feature) */
    String assessReadingLevel(String text);

    /** Generate phonics exercise for a letter/word (FLN feature) */
    String generatePhonicsExercise(String letter, String language);
}
