package com.sahapathi.ai.config;

import org.springframework.security.core.userdetails.UserDetailsService;
import com.sahapathi.ai.security.JwtAuthEntryPoint;
import com.sahapathi.ai.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JwtAuthEntryPoint authEntryPoint;
    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/**") // stateless JWT API — CSRF not applicable
            )
            .exceptionHandling(ex -> ex.authenticationEntryPoint(authEntryPoint))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/api-docs/**", "/swagger-ui.html").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Admin endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Teacher endpoints
                .requestMatchers(HttpMethod.POST, "/api/classrooms/join").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/classrooms/**").hasRole("TEACHER")
                .requestMatchers(HttpMethod.PUT, "/api/classrooms/**").hasRole("TEACHER")
                .requestMatchers(HttpMethod.DELETE, "/api/classrooms/**").hasRole("TEACHER")
                .requestMatchers("/api/attendance/mark").hasRole("TEACHER")
                .requestMatchers(HttpMethod.POST, "/api/quizzes/attempt").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/quizzes/**").hasRole("TEACHER")
                .requestMatchers(HttpMethod.PUT, "/api/quizzes/**").hasRole("TEACHER")
                .requestMatchers(HttpMethod.DELETE, "/api/quizzes/**").hasRole("TEACHER")
                .requestMatchers(HttpMethod.POST, "/api/lessons/**").hasRole("TEACHER")
                .requestMatchers(HttpMethod.PUT, "/api/lessons/**").hasRole("TEACHER")
                .requestMatchers(HttpMethod.DELETE, "/api/lessons/**").hasRole("TEACHER")
                // All authenticated users
                .anyRequest().authenticated()
            );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
