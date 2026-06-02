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
public class ClassroomRequest {
    @NotBlank(message = "Classroom name is required")
    private String name;
    private String subject;
    private String grade;
    private String description;
}
