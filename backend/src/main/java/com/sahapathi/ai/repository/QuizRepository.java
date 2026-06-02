package com.sahapathi.ai.repository;

import com.sahapathi.ai.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByClassroomId(Long classroomId);
    List<Quiz> findByClassroomIdAndIsPublishedTrue(Long classroomId);
    long countByClassroomId(Long classroomId);
}
