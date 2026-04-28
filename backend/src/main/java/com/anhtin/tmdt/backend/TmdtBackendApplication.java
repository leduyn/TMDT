package com.anhtin.tmdt.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TmdtBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(TmdtBackendApplication.class, args);
	}

}
