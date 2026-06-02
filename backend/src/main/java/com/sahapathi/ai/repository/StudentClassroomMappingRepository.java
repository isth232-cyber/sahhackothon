package com.sahapathi.ai.repository;

import com.sahapathi.ai.entity.StudentClassroomMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentClassroomMappingRepository extends JpaRepository<StudentClassroomMapping, Long> {
    List<StudentClassroomMapping> findByStudentIdAndIsActiveTrue(Long studentId);
    List<StudentClassroomMapping> findByClassroomIdAndIsActiveTrue(Long classroomId);
    Optional<StudentClassroomMapping> findByStudentIdAndClassroomId(Long studentId, Long classroomId);
    boolean existsByStudentIdAndClassroomId(Long studentId, Long classroomId);
    long countByClassroomIdAndIsActiveTrue(Long classroomId);
}
