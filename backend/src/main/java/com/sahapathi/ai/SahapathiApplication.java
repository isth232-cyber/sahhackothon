package com.sahapathi.ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class SahapathiApplication {

    public static void main(String[] args) {
        SpringApplication.run(SahapathiApplication.class, args);
    }
}
