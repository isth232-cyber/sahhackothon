package com.sahapathi.ai.repository;

import com.sahapathi.ai.entity.AIRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIRecommendationRepository extends JpaRepository<AIRecommendation, Long> {
    List<AIRecommendation> findByClassroomIdAndIsResolvedFalseOrderByCreatedAtDesc(Long classroomId);
    List<AIRecommendation> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<AIRecommendation> findByClassroomIdAndTypeOrderByCreatedAtDesc(Long classroomId, String type);
    long countByClassroomIdAndIsResolvedFalse(Long classroomId);
}
