package com.sahapathi.ai.controller;

import com.sahapathi.ai.dto.*;
import com.sahapathi.ai.entity.User;
import com.sahapathi.ai.exception.ResourceNotFoundException;
import com.sahapathi.ai.repository.UserRepository;
import com.sahapathi.ai.service.LessonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
@Tag(name = "Lessons", description = "Lesson management endpoints")
public class LessonController {

    private final LessonService lessonService;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Create a lesson")
    public ResponseEntity<ApiResponse<LessonResponse>> create(
            @Valid @RequestBody LessonRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
        return ResponseEntity.ok(ApiResponse.success("Lesson created", lessonService.createLesson(request, user.getId())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get lesson by ID")
    public ResponseEntity<ApiResponse<LessonResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(lessonService.getLesson(id)));
    }

    @GetMapping("/classroom/{classroomId}")
    @Operation(summary = "Get lessons by classroom")
    public ResponseEntity<ApiResponse<List<LessonResponse>>> getByClassroom(
            @PathVariable Long classroomId,
            @RequestParam(defaultValue = "false") boolean publishedOnly) {
        return ResponseEntity.ok(ApiResponse.success(lessonService.getLessonsByClassroom(classroomId, publishedOnly)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update lesson")
    public ResponseEntity<ApiResponse<LessonResponse>> update(
            @PathVariable Long id, @Valid @RequestBody LessonRequest request) {
        return ResponseEntity.ok(ApiResponse.success(lessonService.updateLesson(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete lesson")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        lessonService.deleteLesson(id);
        return ResponseEntity.ok(ApiResponse.success("Lesson deleted", null));
    }
}
