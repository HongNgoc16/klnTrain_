package com.klntrain;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class KlnTrainApplication {
    public static void main(String[] args) {
        SpringApplication.run(KlnTrainApplication.class, args);
    }
}
