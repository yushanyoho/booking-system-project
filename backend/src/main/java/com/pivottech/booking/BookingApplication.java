package com.pivottech.booking;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.pivottech.booking.handler.LoginSuccessHandler;
import com.pivottech.booking.intercepter.LogInterceptor;
import com.pivottech.booking.intercepter.TodaysDateArgumentResolver;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.stereotype.Service;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@SpringBootApplication
public class BookingApplication {

	@Service
	public class CustomObjectMapper extends ObjectMapper {

		public CustomObjectMapper() {
			this.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
			this.registerModule(new JavaTimeModule());
		}

	}

	@Configuration
	public class WebMVCConfig implements WebMvcConfigurer {

		@Override
		public void addInterceptors(InterceptorRegistry registry) {
			registry.addInterceptor(new LogInterceptor());
		}

		@Override
		public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
			resolvers.add(new TodaysDateArgumentResolver());
		}

	}

	@Configuration
	// Application层面的security，规定谁可以登录
	// @EnableWebSecurity will search for an implementation of UserDetailsService (UserService) to check if the password matches the username
	@EnableWebSecurity
	// Method层面的security，规定谁可以访问哪个api
	// prePostEnabled -> @PreAuthorize 规定哪个 username 可以访问当前api
	// securedEnabled -> @Secured, jsr250Enabled -> @RolesAllowed 规定哪些角色(Authorities)(roles)可以访问当前api
	@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
	public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

		@Override
		protected void configure(HttpSecurity http) throws Exception {
			// @formatter:off
			http.csrf().disable()
				.authorizeRequests()
					// 任何 request 都可以访问 "localhost:8081/api/"
					.antMatchers("/").permitAll()
					// 任何 request 都可以访问 “localhost:8081/api/users”
					.antMatchers(HttpMethod.POST, "/users").permitAll()
					// 除以上两个 patterns 以外，其他 request 都需要 authentication (privilege)，包括 "localhost:8081/api/todaysDate"
					.anyRequest().authenticated()
					.and()
				// 如果在验证 authentication 的过程中出错，报 UNAUTHORIZED??????
				.exceptionHandling()
					.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
					.and()
				// @EnableWebSecurity will search for an implementation of UserDetailsService (UserService) to check password
				.formLogin()
					.loginPage("/login").permitAll()
					.successHandler(loginSuccessHandler())
					.and()
				.logout().permitAll();
			// @formatter:on
		}

	}

	@Bean
	public javax.validation.Validator localValidatorFactoryBean() {
		return new LocalValidatorFactoryBean();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public LoginSuccessHandler loginSuccessHandler() {
		return new LoginSuccessHandler();
	}

	public static void main(String[] args) {
		SpringApplication.run(BookingApplication.class, args);
	}

}
