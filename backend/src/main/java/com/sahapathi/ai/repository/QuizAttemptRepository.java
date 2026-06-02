package com.sahapathi.ai.repository;

import com.sahapathi.ai.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    Optional<QuizAttempt> findByStudentIdAndQuizId(Long studentId, Long quizId);
    List<QuizAttempt> findByStudentId(Long studentId);
    List<QuizAttempt> findByQuizId(Long quizId);
    boolean existsByStudentIdAndQuizId(Long studentId, Long quizId);

    @Query("SELECT AVG(a.percentage) FROM QuizAttempt a WHERE a.quiz.id = :quizId AND a.isCompleted = true")
    Double getAverageScoreByQuiz(@Param("quizId") Long quizId);

    @Query("SELECT AVG(a.percentage) FROM QuizAttempt a WHERE a.student.id = :studentId AND a.isCompleted = true")
    Double getAverageScoreByStudent(@Param("studentId") Long studentId);
}
