package com.sahapathi.ai.service.ai;

import com.sahapathi.ai.dto.SimplifyResponse;
import com.sahapathi.ai.dto.TranslateResponse;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.security.SecureRandom;

/**
 * Mock AI Service Implementation.
 * Returns realistic mock responses for translation, simplification, and recommendations.
 * Replace with real AI provider (OpenAI, Gemini, Azure, HuggingFace) when ready.
 */
@Service
public class MockAIServiceImpl implements AIProvider {

    private static final Map<String, String> LANG_LABELS = Map.of(
        "Hindi", "हिंदी",
        "Tamil", "தமிழ்",
        "Telugu", "తెలుగు",
        "Kannada", "ಕನ್ನಡ",
        "Malayalam", "മലയാളം"
    );

    private static final Map<String, String> LANG_NOTICE = Map.of(
        "Hindi", "[हिंदी अनुवाद]",
        "Tamil", "[தமிழ் மொழிபெயர்ப்பு]",
        "Telugu", "[తెలుగు అనువాదం]",
        "Kannada", "[ಕನ್ನಡ ಅನುವಾದ]",
        "Malayalam", "[മലയാളം വിവർത്തനം]"
    );

    private static final String[] RECOMMENDATIONS = {
        "Student shows declining participation over the past week. Consider one-on-one check-in.",
        "Student has missed 3 consecutive classes. Recommend reaching out to parents/guardians.",
        "Quiz scores have dropped by 20%. Student may need additional support in this topic.",
        "Student actively participates but struggles with written assessments. Consider alternative evaluation methods.",
        "Student excels in group activities. Consider assigning peer mentorship role.",
        "Language barrier detected. Student frequently uses translation feature. Consider providing bilingual materials.",
        "Student shows improvement in recent quizzes. Positive reinforcement recommended.",
        "Low engagement with lesson content. Interactive or visual materials may help."
    };

    @Override
    public TranslateResponse translate(String text, String targetLanguage) {
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("text must not be null or blank");
        }
        String translated;
        if ("English".equalsIgnoreCase(targetLanguage)) {
            translated = text;
        } else {
            String notice = LANG_NOTICE.getOrDefault(targetLanguage,
                    "[" + targetLanguage + " translation]");
            translated = notice + " " + text;
        }

        return TranslateResponse.builder()
                .originalText(text)
                .translatedText(translated)
                .sourceLanguage("English")
                .targetLanguage(targetLanguage)
                .build();
    }

    @Override
    public SimplifyResponse simplify(String text, String language) {
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("text must not be null or blank");
        }
        String simplified = "Simply put: " + text.replaceAll("\\b(the|is|are|was|were|a|an)\\b", "")
                .replaceAll("\\s+", " ").trim();

        if (text.toLowerCase(java.util.Locale.ROOT).contains("mitochondria")) {
            simplified = "Mitochondria helps produce energy for the cell. Think of it like a battery that powers everything the cell does.";
        } else if (text.toLowerCase(java.util.Locale.ROOT).contains("photosynthesis")) {
            simplified = "Photosynthesis is how plants make their own food using sunlight, water, and air. The leaves capture sunlight and turn it into energy.";
        } else if (text.length() > 100) {
            simplified = text.substring(0, 80) + "... (simplified version: " + text.substring(0, 50) + " in easier words)";
        }

        return SimplifyResponse.builder()
                .originalText(text)
                .simplifiedText(simplified)
                .language(language != null ? language : "English")
                .build();
    }

    @Override
    public String generateRecommendation(String studentName, String context) {
        SecureRandom random = new SecureRandom();
        String recommendation = RECOMMENDATIONS[random.nextInt(RECOMMENDATIONS.length)];
        return recommendation.replace("Student", studentName);
    }

    @Override
    public String generateNumeracyStory(int ageGroup, String topic, String language) {
        return String.format(
            "Riya has 5 mangoes. Her friend gives her 3 more. " +
            "How many mangoes does Riya have now? (Topic: %s, Age: %d)", topic, ageGroup);
    }

    @Override
    public String assessReadingLevel(String text) {
        int words = text.split("\\s+").length;
        if (words < 20) return "Beginner (Grade 1-2)";
        if (words < 60) return "Elementary (Grade 3-4)";
        return "Intermediate (Grade 5-6)";
    }

    @Override
    public String generatePhonicsExercise(String letter, String language) {
        return String.format(
            "'%s' is for Apple! Say it slowly: %s-pple. " +
            "Can you find 3 things around you that start with '%s'?",
            letter.toUpperCase(java.util.Locale.ROOT),
            letter.toUpperCase(java.util.Locale.ROOT),
            letter.toUpperCase(java.util.Locale.ROOT));
    }
}
