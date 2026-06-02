package com.sahapathi.ai.service;

import com.sahapathi.ai.dto.*;
import com.sahapathi.ai.entity.*;
import com.sahapathi.ai.exception.BadRequestException;
import com.sahapathi.ai.exception.ResourceNotFoundException;
import com.sahapathi.ai.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuizAttemptRepository attemptRepository;
    private final QuizAnswerRepository answerRepository;
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;

    @Transactional
    public QuizResponse createQuiz(QuizRequest request, Long teacherId) {
        Classroom classroom = classroomRepository.findById(request.getClassroomId())
                .orElseThrow(() -> new ResourceNotFoundException("Classroom", "id", request.getClassroomId()));
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", teacherId));

        Quiz quiz = Quiz.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .classroom(classroom)
                .createdBy(teacher)
                .durationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 30)
                .build();

        if (request.getDueDate() != null) {
            quiz.setDueDate(LocalDateTime.parse(request.getDueDate()));
        }

        quiz = quizRepository.save(quiz);

        int totalMarks = 0;
        if (request.getQuestions() != null) {
            int order = 0;
            for (QuestionRequest qReq : request.getQuestions()) {
                int pts = qReq.getPoints() != null ? qReq.getPoints() : 1;
                Question question = Question.builder()
                        .quiz(quiz)
                        .questionText(qReq.getQuestionText())
                        .optionA(qReq.getOptionA())
                        .optionB(qReq.getOptionB())
                        .optionC(qReq.getOptionC())
                        .optionD(qReq.getOptionD())
                        .correctOption(qReq.getCorrectOption())
                        .points(pts)
                        .explanation(qReq.getExplanation())
                        .sortOrder(order++)
                        .build();
                questionRepository.save(question);
                totalMarks += pts;
            }
        }

        quiz.setTotalMarks(totalMarks);
        quiz = quizRepository.save(quiz);
        return mapToResponse(quiz);
    }

    public QuizResponse getQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", id));
        return mapToResponse(quiz);
    }

    public List<QuizResponse> getQuizzesByClassroom(Long classroomId, boolean publishedOnly) {
        List<Quiz> quizzes = publishedOnly
                ? quizRepository.findByClassroomIdAndIsPublishedTrue(classroomId)
                : quizRepository.findByClassroomId(classroomId);
        return quizzes.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public QuizResponse publishQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", id));
        quiz.setIsPublished(true);
        quiz = quizRepository.save(quiz);
        return mapToResponse(quiz);
    }

    @Transactional
    public QuizAttemptResponse submitAttempt(QuizAttemptRequest request, Long studentId) {
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", request.getQuizId()));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", studentId));

        if (attemptRepository.existsByStudentIdAndQuizId(studentId, quiz.getId())) {
            throw new BadRequestException("You have already attempted this quiz");
        }

        List<Question> questions = questionRepository.findByQuizIdOrderBySortOrderAsc(quiz.getId());
        int score = 0;
        int totalMarks = 0;
        List<QuizAnswer> answers = new ArrayList<>();

        QuizAttempt attempt = QuizAttempt.builder()
                .student(student)
                .quiz(quiz)
                .build();
        attempt = attemptRepository.save(attempt);

        for (Question question : questions) {
            totalMarks += question.getPoints();
            String selectedOption = request.getAnswers().get(question.getId());
            boolean isCorrect = question.getCorrectOption().equalsIgnoreCase(selectedOption);
            if (isCorrect) score += question.getPoints();

            QuizAnswer answer = QuizAnswer.builder()
                    .attempt(attempt)
                    .question(question)
                    .selectedOption(selectedOption)
                    .isCorrect(isCorrect)
                    .build();
            answers.add(answer);
        }

        answerRepository.saveAll(answers);

        double percentage = totalMarks > 0 ? ((double) score / totalMarks) * 100 : 0;
        attempt.setScore(score);
        attempt.setTotalMarks(totalMarks);
        attempt.setPercentage(percentage);
        attempt.setIsCompleted(true);
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt = attemptRepository.save(attempt);

        return mapAttemptToResponse(attempt);
    }

    public List<QuizAttemptResponse> getAttemptsByQuiz(Long quizId) {
        return attemptRepository.findByQuizId(quizId).stream()
                .map(this::mapAttemptToResponse).collect(Collectors.toList());
    }

    public List<QuizAttemptResponse> getStudentAttempts(Long studentId) {
        return attemptRepository.findByStudentId(studentId).stream()
                .map(this::mapAttemptToResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteQuiz(Long id) {
        if (!quizRepository.existsById(id)) {
            throw new ResourceNotFoundException("Quiz", "id", id);
        }
        quizRepository.deleteById(id);
    }

    private QuizResponse mapToResponse(Quiz quiz) {
        List<QuestionResponse> questionResponses = questionRepository.findByQuizIdOrderBySortOrderAsc(quiz.getId())
                .stream()
                .map(q -> QuestionResponse.builder()
                        .id(String.valueOf(q.getId()))
                        .questionText(q.getQuestionText())
                        .optionA(q.getOptionA())
                        .optionB(q.getOptionB())
                        .optionC(q.getOptionC())
                        .optionD(q.getOptionD())
                        .correctOption(q.getCorrectOption())
                        .points(q.getPoints())
                        .explanation(q.getExplanation())
                        .sortOrder(q.getSortOrder())
                        .build())
                .collect(Collectors.toList());

        Double avgScore = attemptRepository.getAverageScoreByQuiz(quiz.getId());
        int attemptCount = attemptRepository.findByQuizId(quiz.getId()).size();

        return QuizResponse.builder()
                .id(String.valueOf(quiz.getId()))
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .classroomId(String.valueOf(quiz.getClassroom().getId()))
                .classroomName(quiz.getClassroom().getName())
                .createdById(String.valueOf(quiz.getCreatedBy().getId()))
                .createdByName(quiz.getCreatedBy().getFullName())
                .durationMinutes(quiz.getDurationMinutes())
                .totalMarks(quiz.getTotalMarks())
                .isPublished(quiz.getIsPublished())
                .dueDate(quiz.getDueDate())
                .questions(questionResponses)
                .questionCount(questionResponses.size())
                .averageScore(avgScore)
                .attemptCount(attemptCount)
                .createdAt(quiz.getCreatedAt())
                .build();
    }

    private QuizAttemptResponse mapAttemptToResponse(QuizAttempt attempt) {
        return QuizAttemptResponse.builder()
                .id(String.valueOf(attempt.getId()))
                .quizId(String.valueOf(attempt.getQuiz().getId()))
                .quizTitle(attempt.getQuiz().getTitle())
                .studentId(String.valueOf(attempt.getStudent().getId()))
                .studentName(attempt.getStudent().getFullName())
                .score(attempt.getScore())
                .totalMarks(attempt.getTotalMarks())
                .percentage(attempt.getPercentage())
                .isCompleted(attempt.getIsCompleted())
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .build();
    }
}
