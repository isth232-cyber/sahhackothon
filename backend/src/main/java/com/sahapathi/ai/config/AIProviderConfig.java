package com.sahapathi.ai.config;

import com.sahapathi.ai.service.ai.AIProvider;
import com.sahapathi.ai.service.ai.GeminiAIServiceImpl;
import com.sahapathi.ai.service.ai.MockAIServiceImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class AIProviderConfig {

    @Value("${app.ai.provider:mock}")
    private String provider;

    @Value("${app.ai.gemini.api-key:}")
    private String geminiApiKey;

    @Bean
    @Primary
    public AIProvider aiProvider(MockAIServiceImpl mockAI, GeminiAIServiceImpl geminiAI) {
        if ("gemini".equalsIgnoreCase(provider) && !geminiApiKey.isBlank()) {
            return geminiAI;
        }
        return mockAI;
    }
}
