package com.sahapathi.ai.repository;

import com.sahapathi.ai.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByClassroomIdAndIsPublishedTrue(Long classroomId);
    List<Lesson> findByClassroomId(Long classroomId);
    long countByClassroomId(Long classroomId);
}
