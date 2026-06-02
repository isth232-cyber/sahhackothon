package com.sahapathi.ai.repository;

import com.sahapathi.ai.entity.Participation;
import com.sahapathi.ai.enums.ParticipationEventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ParticipationRepository extends JpaRepository<Participation, Long> {
    List<Participation> findByStudentIdAndClassroomId(Long studentId, Long classroomId);

    @Query("SELECT COALESCE(SUM(p.score), 0) FROM Participation p WHERE p.student.id = :studentId AND p.classroom.id = :classroomId")
    Long getTotalScoreByStudentAndClassroom(@Param("studentId") Long studentId, @Param("classroomId") Long classroomId);

    List<Participation> findByClassroomIdAndEventDateBetweenOrderByEventDateAsc(Long classroomId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT p.eventType, COUNT(p) FROM Participation p WHERE p.student.id = :studentId AND p.classroom.id = :classroomId GROUP BY p.eventType")
    List<Object[]> countByEventType(@Param("studentId") Long studentId, @Param("classroomId") Long classroomId);

    @Query("SELECT p.eventDate, SUM(p.score) FROM Participation p WHERE p.classroom.id = :classroomId AND p.eventDate BETWEEN :startDate AND :endDate GROUP BY p.eventDate ORDER BY p.eventDate ASC")
    List<Object[]> getDailyScores(@Param("classroomId") Long classroomId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    long countByStudentIdAndClassroomIdAndEventType(Long studentId, Long classroomId, ParticipationEventType eventType);
}
