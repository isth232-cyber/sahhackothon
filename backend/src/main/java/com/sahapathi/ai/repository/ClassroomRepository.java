package com.sahapathi.ai.repository;

import com.sahapathi.ai.entity.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, Long> {
    List<Classroom> findByTeacherIdAndIsActiveTrue(Long teacherId);
    Optional<Classroom> findByInviteCode(String inviteCode);
    long countByIsActiveTrue();
}
