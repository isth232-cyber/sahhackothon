package com.sahapathi.ai.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempts", uniqueConstraints = {
    @UniqueConstraint(name = "idx_attempt_unique", columnNames = {"student_id", "quiz_id"})
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    private Integer score;

    private Integer totalMarks;

    private Double percentage;

    @Builder.Default
    private Boolean isCompleted = false;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime startedAt;

    private LocalDateTime submittedAt;
}
