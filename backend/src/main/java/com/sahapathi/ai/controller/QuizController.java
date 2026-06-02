package com.sahapathi.ai.controller;

import com.sahapathi.ai.dto.*;
import com.sahapathi.ai.entity.User;
import com.sahapathi.ai.exception.ResourceNotFoundException;
import com.sahapathi.ai.repository.UserRepository;
import com.sahapathi.ai.service.QuizService;
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
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
@Tag(name = "Quizzes", description = "Quiz management endpoints")
public class QuizController {

    private final QuizService quizService;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Create a quiz")
    public ResponseEntity<ApiResponse<QuizResponse>> create(
            @Valid @RequestBody QuizRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
        return ResponseEntity.ok(ApiResponse.success("Quiz created", quizService.createQuiz(request, user.getId())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get quiz by ID")
    public ResponseEntity<ApiResponse<QuizResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(quizService.getQuiz(id)));
    }

    @GetMapping("/classroom/{classroomId}")
    @Operation(summary = "Get quizzes by classroom")
    public ResponseEntity<ApiResponse<List<QuizResponse>>> getByClassroom(
            @PathVariable Long classroomId,
            @RequestParam(defaultValue = "false") boolean publishedOnly) {
        return ResponseEntity.ok(ApiResponse.success(quizService.getQuizzesByClassroom(classroomId, publishedOnly)));
    }

    @PutMapping("/{id}/publish")
    @Operation(summary = "Publish a quiz")
    public ResponseEntity<ApiResponse<QuizResponse>> publish(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(quizService.publishQuiz(id)));
    }

    @PostMapping("/attempt")
    @Operation(summary = "Submit quiz attempt")
    public ResponseEntity<ApiResponse<QuizAttemptResponse>> submitAttempt(
            @RequestBody QuizAttemptRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
        return ResponseEntity.ok(ApiResponse.success("Quiz submitted", quizService.submitAttempt(request, user.getId())));
    }

    @GetMapping("/{id}/attempts")
    @Operation(summary = "Get attempts for a quiz")
    public ResponseEntity<ApiResponse<List<QuizAttemptResponse>>> getAttempts(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(quizService.getAttemptsByQuiz(id)));
    }

    @GetMapping("/my-attempts")
    @Operation(summary = "Get current student's attempts")
    public ResponseEntity<ApiResponse<List<QuizAttemptResponse>>> getMyAttempts(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
        return ResponseEntity.ok(ApiResponse.success(quizService.getStudentAttempts(user.getId())));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete quiz")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.ok(ApiResponse.success("Quiz deleted", null));
    }
}
