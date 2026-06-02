package com.sahapathi.ai.repository;

import com.sahapathi.ai.entity.Attendance;
import com.sahapathi.ai.enums.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByClassroomIdAndDate(Long classroomId, LocalDate date);
    List<Attendance> findByStudentIdAndClassroomId(Long studentId, Long classroomId);
    Optional<Attendance> findByStudentIdAndClassroomIdAndDate(Long studentId, Long classroomId, LocalDate date);
    long countByStudentIdAndClassroomIdAndStatus(Long studentId, Long classroomId, AttendanceStatus status);
    long countByStudentIdAndClassroomId(Long studentId, Long classroomId);
    List<Attendance> findByClassroomIdAndDateBetweenOrderByDateAsc(Long classroomId, LocalDate startDate, LocalDate endDate);
}
