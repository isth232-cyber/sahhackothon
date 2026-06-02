package com.sahapathi.ai.service.ai;

import com.sahapathi.ai.dto.SimplifyResponse;
import com.sahapathi.ai.dto.TranslateResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

/**
 * Gemini AI Service Implementation.
 * Set GEMINI_API_KEY env variable and set app.ai.provider=gemini in application.yml to activate.
 */
@Service("geminiAIService")
public class GeminiAIServiceImpl implements AIProvider {

    private static final Logger log = LoggerFactory.getLogger(GeminiAIServiceImpl.class);

    @Value("${app.ai.gemini.api-key:}")
    private String apiKey;

    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    private final RestTemplate restTemplate = new RestTemplate();

    private String callGemini(String prompt) {
        String url = GEMINI_URL + "?key=" + apiKey;

        Map<String, Object> body = Map.of(
            "contents", List.of(Map.of(
                "parts", List.of(Map.of("text", prompt))
            ))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.POST, new HttpEntity<>(body, headers), Map.class
            );
            var candidates = (List<?>) response.getBody().get("candidates");
            var content = (Map<?, ?>) ((Map<?, ?>) candidates.get(0)).get("content");
            var parts = (List<?>) content.get("parts");
            return (String) ((Map<?, ?>) parts.get(0)).get("text");
        } catch (Exception e) {
            log.warn("Gemini API call failed: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public TranslateResponse translate(String text, String targetLanguage) {
        if (text == null || text.isBlank()) throw new IllegalArgumentException("text must not be blank");
        if (targetLanguage == null || targetLanguage.isBlank()) throw new IllegalArgumentException("targetLanguage must not be blank");

        String prompt = String.format(
            "Translate the following educational text to %s. " +
            "Keep it simple and suitable for school children aged 6-12. " +
            "Return ONLY the translated text, no explanations.\n\nText: %s",
            targetLanguage, text
        );

        String translated = callGemini(prompt);
        if (translated == null) translated = "[Translation unavailable] " + text;

        return TranslateResponse.builder()
                .originalText(text)
                .translatedText(translated.trim())
                .sourceLanguage("English")
                .targetLanguage(targetLanguage)
                .build();
    }

    @Override
    public SimplifyResponse simplify(String text, String language) {
        if (text == null || text.isBlank()) throw new IllegalArgumentException("text must not be blank");

        String prompt = String.format(
            "Simplify the following text for a child aged 6-10 years old in India. " +
            "Use very simple words, short sentences, and relatable examples from daily Indian life. " +
            "If language is not English, respond in %s. " +
            "Return ONLY the simplified explanation.\n\nText: %s",
            language != null ? language : "English", text
        );

        String simplified = callGemini(prompt);
        if (simplified == null) simplified = "Simply put: " + text.substring(0, Math.min(text.length(), 100));

        return SimplifyResponse.builder()
                .originalText(text)
                .simplifiedText(simplified.trim())
                .language(language != null ? language : "English")
                .build();
    }

    @Override
    public String generateRecommendation(String studentName, String context) {
        String prompt = String.format(
            "You are an AI teaching assistant for an Indian school. " +
            "Based on this student data, give ONE specific, actionable recommendation for the teacher. " +
            "Be concise (2 sentences max). Student: %s. Data: %s",
            studentName, context
        );
        String result = callGemini(prompt);
        return result != null ? result.trim()
            : studentName + " may need additional support. Consider a one-on-one check-in.";
    }

    @Override
    public String generateNumeracyStory(int ageGroup, String topic, String language) {
        String prompt = String.format(
            "Create a short, fun math story problem for an Indian child aged %d about '%s'. " +
            "Use Indian names, foods, and everyday objects. Keep it to 3 sentences. " +
            "End with a clear question. Respond in %s.",
            ageGroup, topic, language != null ? language : "English"
        );
        String result = callGemini(prompt);
        return result != null ? result.trim() : "Riya has 5 mangoes. Her friend gives her 3 more. How many mangoes does Riya have now?";
    }

    @Override
    public String assessReadingLevel(String text) {
        String prompt = String.format(
            "Assess the reading level of this text for Indian school children. " +
            "Reply with ONLY one of: Beginner (Grade 1-2), Elementary (Grade 3-4), Intermediate (Grade 5-6), Advanced (Grade 7+). " +
            "Text: %s", text
        );
        String result = callGemini(prompt);
        return result != null ? result.trim() : "Elementary (Grade 3-4)";
    }

    @Override
    public String generatePhonicsExercise(String letter, String language) {
        if (letter == null || letter.isBlank()) throw new IllegalArgumentException("letter must not be blank");
        String prompt = String.format(
            "Create a fun phonics exercise for an Indian child learning the letter '%s'. " +
            "Include: the sound, a word example using an Indian object or animal, and one activity. " +
            "Keep it to 2-3 sentences. Respond in %s.",
            letter, language != null ? language : "English"
        );
        String result = callGemini(prompt);
        return result != null ? result.trim()
            : String.format("'%s' makes a special sound! Find something starting with %s around you.",
                letter.toUpperCase(java.util.Locale.ROOT), letter.toUpperCase(java.util.Locale.ROOT));
    }
}
