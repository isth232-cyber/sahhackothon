package com.sahapathi.ai.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRequest {
    @NotNull(message = "Classroom ID is required")
    private Long classroomId;
    private String date; // yyyy-MM-dd
    private List<StudentAttendance> records;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentAttendance {
        private Long studentId;
        private String status; // PRESENT, ABSENT, LATE
        private String remarks;
    }
}
