package com.sahapathi.ai.controller;

import com.sahapathi.ai.dto.*;
import com.sahapathi.ai.enums.RoleName;
import com.sahapathi.ai.repository.*;
import com.sahapathi.ai.service.ClassroomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin management endpoints")
public class AdminController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ClassroomRepository classroomRepository;
    private final ClassroomService classroomService;

    @GetMapping("/analytics")
    @Operation(summary = "Get platform analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        roleRepository.findByName(RoleName.ROLE_TEACHER).ifPresent(r -> analytics.put("totalTeachers", userRepository.countByRole(r)));
        roleRepository.findByName(RoleName.ROLE_STUDENT).ifPresent(r -> analytics.put("totalStudents", userRepository.countByRole(r)));
        analytics.put("totalClassrooms", classroomRepository.countByIsActiveTrue());
        analytics.put("totalUsers", userRepository.count());
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    @GetMapping("/teachers")
    @Operation(summary = "Get all teachers")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getTeachers() {
        var role = roleRepository.findByName(RoleName.ROLE_TEACHER).orElse(null);
        List<UserResponse> teachers = role == null ? List.of() : userRepository.findByRoleAndIsActiveTrue(role)
                .stream()
                .map(u -> UserResponse.builder()
                        .id(u.getId())
                        .fullName(u.getFullName())
                        .email(u.getEmail())
                        .phone(u.getPhone())
                        .role(u.getRole().getName().name())
                        .languagePref(u.getLanguagePref())
                        .isActive(u.getIsActive())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(teachers));
    }

    @GetMapping("/students")
    @Operation(summary = "Get all students")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getStudents() {
        var role = roleRepository.findByName(RoleName.ROLE_STUDENT).orElse(null);
        List<UserResponse> students = role == null ? List.of() : userRepository.findByRoleAndIsActiveTrue(role)
                .stream()
                .map(u -> UserResponse.builder()
                        .id(u.getId())
                        .fullName(u.getFullName())
                        .email(u.getEmail())
                        .phone(u.getPhone())
                        .role(u.getRole().getName().name())
                        .languagePref(u.getLanguagePref())
                        .isActive(u.getIsActive())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(students));
    }

    @GetMapping("/classrooms")
    @Operation(summary = "Get all classrooms")
    public ResponseEntity<ApiResponse<List<ClassroomResponse>>> getClassrooms() {
        return ResponseEntity.ok(ApiResponse.success(classroomService.getAllClassrooms()));
    }

    @PutMapping("/users/{id}/toggle-active")
    @Operation(summary = "Toggle user active status")
    public ResponseEntity<ApiResponse<String>> toggleUserActive(@PathVariable Long id) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new com.sahapathi.ai.exception.ResourceNotFoundException("User", "id", id));
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("User status updated"));
    }
}
