package com.eden.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class EdenApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(EdenApiApplication.class, args);
    }

}
