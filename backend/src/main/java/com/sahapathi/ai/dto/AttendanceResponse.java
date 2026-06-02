package com.sahapathi.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceResponse {
    private String id;
    private String studentId;
    private String studentName;
    private String classroomId;
    private LocalDate date;
    private String status;
    private String remarks;
}
