package com.veristay;

import jakarta.servlet.MultipartConfigElement;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class Veristay1Application {

    public static void main(String[] args) {
        SpringApplication.run(Veristay1Application.class, args);
    }

    // Pure Core Java method to override the 1MB limit unconditionally
    @Bean
    public MultipartConfigElement multipartConfigElement() {
        return new MultipartConfigElement("", 209715200L, 209715200L, 0);
    }
}