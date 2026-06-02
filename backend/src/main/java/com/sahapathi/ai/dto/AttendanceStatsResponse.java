package com.sahapathi.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceStatsResponse {
    private String studentId;
    private String studentName;
    private String classroomId;
    private String totalDays;
    private String presentDays;
    private String absentDays;
    private String lateDays;
    private double attendancePercentage;
}
