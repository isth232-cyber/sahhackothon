package com.sahapathi.ai.service;

import com.sahapathi.ai.dto.AttendanceRequest;
import com.sahapathi.ai.dto.AttendanceResponse;
import com.sahapathi.ai.dto.AttendanceStatsResponse;
import com.sahapathi.ai.entity.Attendance;
import com.sahapathi.ai.entity.Classroom;
import com.sahapathi.ai.entity.User;
import com.sahapathi.ai.enums.AttendanceStatus;
import com.sahapathi.ai.exception.ResourceNotFoundException;
import com.sahapathi.ai.repository.AttendanceRepository;
import com.sahapathi.ai.repository.ClassroomRepository;
import com.sahapathi.ai.repository.StudentClassroomMappingRepository;
import com.sahapathi.ai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;
    private final StudentClassroomMappingRepository mappingRepository;

    @Transactional
    public List<AttendanceResponse> markAttendance(AttendanceRequest request, Long teacherId) {
        Classroom classroom = classroomRepository.findById(request.getClassroomId())
                .orElseThrow(() -> new ResourceNotFoundException("Classroom", "id", request.getClassroomId()));
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", teacherId));

        LocalDate date = request.getDate() != null ? LocalDate.parse(request.getDate()) : LocalDate.now();
        List<AttendanceResponse> responses = new ArrayList<>();

        for (AttendanceRequest.StudentAttendance record : request.getRecords()) {
            User student = userRepository.findById(record.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", record.getStudentId()));

            Attendance attendance = attendanceRepository
                    .findByStudentIdAndClassroomIdAndDate(student.getId(), classroom.getId(), date)
                    .orElse(Attendance.builder()
                            .student(student)
                            .classroom(classroom)
                            .date(date)
                            .markedBy(teacher)
                            .build());

            attendance.setStatus(AttendanceStatus.valueOf(record.getStatus()));
            attendance.setRemarks(record.getRemarks());
            attendance = attendanceRepository.save(attendance);

            responses.add(mapToResponse(attendance));
        }

        return responses;
    }

    public List<AttendanceResponse> getAttendanceByDate(Long classroomId, LocalDate date) {
        return attendanceRepository.findByClassroomIdAndDate(classroomId, date)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public AttendanceStatsResponse getStudentStats(Long studentId, Long classroomId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", studentId));

        long total = attendanceRepository.countByStudentIdAndClassroomId(studentId, classroomId);
        long present = attendanceRepository.countByStudentIdAndClassroomIdAndStatus(studentId, classroomId, AttendanceStatus.PRESENT);
        long absent = attendanceRepository.countByStudentIdAndClassroomIdAndStatus(studentId, classroomId, AttendanceStatus.ABSENT);
        long late = attendanceRepository.countByStudentIdAndClassroomIdAndStatus(studentId, classroomId, AttendanceStatus.LATE);
        double percentage = total > 0 ? ((double) (present + late) / total) * 100 : 0;

        return AttendanceStatsResponse.builder()
                .studentId(String.valueOf(studentId))
                .studentName(student.getFullName())
                .classroomId(String.valueOf(classroomId))
                .totalDays(String.valueOf(total))
                .presentDays(String.valueOf(present))
                .absentDays(String.valueOf(absent))
                .lateDays(String.valueOf(late))
                .attendancePercentage(Math.round(percentage * 100.0) / 100.0)
                .build();
    }

    public List<AttendanceResponse> getMonthlyReport(Long classroomId, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        return attendanceRepository.findByClassroomIdAndDateBetweenOrderByDateAsc(classroomId, startDate, endDate)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private AttendanceResponse mapToResponse(Attendance attendance) {
        return AttendanceResponse.builder()
                .id(String.valueOf(attendance.getId()))
                .studentId(String.valueOf(attendance.getStudent().getId()))
                .studentName(attendance.getStudent().getFullName())
                .classroomId(String.valueOf(attendance.getClassroom().getId()))
                .date(attendance.getDate())
                .status(attendance.getStatus().name())
                .remarks(attendance.getRemarks())
                .build();
    }
}
