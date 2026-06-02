package com.sahapathi.ai.controller;

import com.sahapathi.ai.dto.*;
import com.sahapathi.ai.entity.User;
import com.sahapathi.ai.exception.ResourceNotFoundException;
import com.sahapathi.ai.repository.UserRepository;
import com.sahapathi.ai.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "Attendance management endpoints")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final UserRepository userRepository;

    @PostMapping("/mark")
    @Operation(summary = "Mark attendance for students")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> markAttendance(
            @Valid @RequestBody AttendanceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
        return ResponseEntity.ok(ApiResponse.success("Attendance marked", attendanceService.markAttendance(request, user.getId())));
    }

    @GetMapping("/classroom/{classroomId}")
    @Operation(summary = "Get attendance by date")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getByDate(
            @PathVariable Long classroomId,
            @RequestParam(required = false) String date) {
        LocalDate localDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getAttendanceByDate(classroomId, localDate)));
    }

    @GetMapping("/stats/{studentId}/{classroomId}")
    @Operation(summary = "Get student attendance statistics")
    public ResponseEntity<ApiResponse<AttendanceStatsResponse>> getStats(
            @PathVariable Long studentId, @PathVariable Long classroomId) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getStudentStats(studentId, classroomId)));
    }

    @GetMapping("/report/{classroomId}")
    @Operation(summary = "Get monthly attendance report")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getReport(
            @PathVariable Long classroomId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getMonthlyReport(classroomId, year, month)));
    }
}
