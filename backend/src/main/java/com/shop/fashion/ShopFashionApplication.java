package com.shop.fashion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ShopFashionApplication {

	public static void main(String[] args) {
		SpringApplication.run(ShopFashionApplication.class, args);
	}

}
