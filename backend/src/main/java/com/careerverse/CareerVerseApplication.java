package com.careerverse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CareerVerseApplication {

    public static void main(String[] args) {
        SpringApplication.run(CareerVerseApplication.class, args);
        System.out.println("CareerVerse Backend API is running on port 8080! 🚀");
    }
}
