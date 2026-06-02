package com.sahapathi.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassroomResponse {
    private Long id;
    private String name;
    private String subject;
    private String grade;
    private String description;
    private String inviteCode;
    private Long teacherId;
    private String teacherName;
    private long studentCount;
    private long lessonCount;
    private long quizCount;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
