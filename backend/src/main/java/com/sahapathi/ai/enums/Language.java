package com.sahapathi.ai.enums;

public enum Language {
    ENGLISH("English", "en"),
    HINDI("Hindi", "hi"),
    TAMIL("Tamil", "ta"),
    TELUGU("Telugu", "te"),
    KANNADA("Kannada", "kn"),
    MALAYALAM("Malayalam", "ml");

    private final String displayName;
    private final String code;

    Language(String displayName, String code) {
        this.displayName = displayName;
        this.code = code;
    }

    public String getDisplayName() { return displayName; }
    public String getCode() { return code; }
}
