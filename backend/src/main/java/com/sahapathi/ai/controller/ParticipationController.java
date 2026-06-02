package com.sahapathi.ai.controller;

import com.sahapathi.ai.dto.*;
import com.sahapathi.ai.service.ParticipationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participation")
@RequiredArgsConstructor
@Tag(name = "Participation", description = "Participation tracking endpoints")
public class ParticipationController {

    private final ParticipationService participationService;

    @PostMapping("/track")
    @Operation(summary = "Track participation event")
    public ResponseEntity<ApiResponse<Void>> track(
            @RequestParam Long studentId,
            @RequestParam Long classroomId,
            @RequestParam String eventType,
            @RequestParam(required = false) String description) {
        participationService.trackEvent(studentId, classroomId, eventType, description);
        return ResponseEntity.ok(ApiResponse.success("Event tracked", null));
    }

    @GetMapping("/stats/{studentId}/{classroomId}")
    @Operation(summary = "Get student participation stats")
    public ResponseEntity<ApiResponse<ParticipationStatsResponse>> getStats(
            @PathVariable Long studentId, @PathVariable Long classroomId) {
        return ResponseEntity.ok(ApiResponse.success(participationService.getStudentStats(studentId, classroomId)));
    }

    @GetMapping("/heatmap/{classroomId}")
    @Operation(summary = "Get classroom participation heatmap data")
    public ResponseEntity<ApiResponse<List<ParticipationStatsResponse>>> getHeatmap(
            @PathVariable Long classroomId) {
        return ResponseEntity.ok(ApiResponse.success(participationService.getClassroomStats(classroomId)));
    }
}
