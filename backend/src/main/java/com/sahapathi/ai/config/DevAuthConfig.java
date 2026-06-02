package com.sahapathi.ai.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("no-db")
public class DevAuthConfig {

    private final PasswordEncoder passwordEncoder;

    public DevAuthConfig(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public UserDetailsService userDetailsService() {
        InMemoryUserDetailsManager manager = new InMemoryUserDetailsManager();
        manager.createUser(User.withUsername("admin@sahapathi.ai")
                .password(passwordEncoder.encode("admin123"))
                .roles("ADMIN")
                .build());

        manager.createUser(User.withUsername("teacher@sahapathi.ai")
                .password(passwordEncoder.encode("teacher123"))
                .roles("TEACHER")
                .build());

        manager.createUser(User.withUsername("student@sahapathi.ai")
                .password(passwordEncoder.encode("student123"))
                .roles("STUDENT")
                .build());

        return manager;
    }
}
