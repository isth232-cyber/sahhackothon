package com.sahapathi.ai.controller;

import com.sahapathi.ai.dto.*;
import com.sahapathi.ai.entity.User;
import com.sahapathi.ai.exception.ResourceNotFoundException;
import com.sahapathi.ai.repository.UserRepository;
import com.sahapathi.ai.service.ClassroomService;
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
@RequestMapping("/api/classrooms")
@RequiredArgsConstructor
@Tag(name = "Classrooms", description = "Classroom management endpoints")
public class ClassroomController {

    private final ClassroomService classroomService;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Create a classroom")
    public ResponseEntity<ApiResponse<ClassroomResponse>> create(
            @Valid @RequestBody ClassroomRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Classroom created", classroomService.createClassroom(request, user.getId())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get classroom by ID")
    public ResponseEntity<ApiResponse<ClassroomResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(classroomService.getClassroom(id)));
    }

    @GetMapping("/my-classrooms")
    @Operation(summary = "Get current user's classrooms")
    public ResponseEntity<ApiResponse<List<ClassroomResponse>>> getMyClassrooms(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        List<ClassroomResponse> classrooms;
        if (user.getRole().getName().name().equals("ROLE_TEACHER")) {
            classrooms = classroomService.getTeacherClassrooms(user.getId());
        } else {
            classrooms = classroomService.getStudentClassrooms(user.getId());
        }
        return ResponseEntity.ok(ApiResponse.success(classrooms));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update classroom")
    public ResponseEntity<ApiResponse<ClassroomResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ClassroomRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success(classroomService.updateClassroom(id, request, user.getId())));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete classroom")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        classroomService.deleteClassroom(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Classroom deleted", null));
    }

    @PostMapping("/join")
    @Operation(summary = "Join classroom with invite code")
    public ResponseEntity<ApiResponse<String>> join(
            @RequestParam String inviteCode,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success(classroomService.joinClassroom(inviteCode, user.getId())));
    }

    @GetMapping("/{id}/students")
    @Operation(summary = "Get students in classroom")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getStudents(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(classroomService.getClassroomStudents(id)));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
    }
}
