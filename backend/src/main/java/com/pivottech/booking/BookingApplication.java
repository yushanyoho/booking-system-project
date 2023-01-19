package com.pivottech.booking;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.pivottech.booking.handler.LoginSuccessHandler;
import com.pivottech.booking.intercepter.LogInterceptor;
import com.pivottech.booking.intercepter.TodaysDateArgumentResolver;
import com.pivottech.booking.service.*;
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
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@SpringBootApplication
public class BookingApplication {

	/**
	 * Configure the serialization and deserialization options.
	 */
	@Service
	public class CustomObjectMapper extends ObjectMapper {

		public CustomObjectMapper() {
			// 具体起了什么作用？？写了这个是否还需要在model中相应field上写 @DateTimeFormat / @JsonFormat？
			// default serialization: "yyyy-MM-dd'T'HH:mm:ss.SSSX"
			this.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
			this.registerModule(new JavaTimeModule());
		}

	}

	@Configuration
	@EnableWebMvc
	public class WebMVCConfig implements WebMvcConfigurer {

		/**
		 * Add Spring MVC lifecycle interceptors for pre- and post-processing of
		 * controller method invocations and resource handler requests.
		 */
		@Override
		public void addInterceptors(InterceptorRegistry registry) {
			registry.addInterceptor(new LogInterceptor());
		}

		/**
		 * Add resolvers to support custom controller method argument types.
		 * @param resolvers initially an empty list
		 */
		@Override
		public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
			resolvers.add(new TodaysDateArgumentResolver());
		}

	}

	/**
	 * <p><code>@EnableWebSecurity</code> ({@link EnableWebSecurity}): 实现Application层面的security，规定谁可以登录。
	 * will search for an implementation of UserDetailsService (UserService)
	 * to check if the password matches the username
	 * <p></p>
	 * <p><code>@EnableGlobalMethodSecurity</code> ({@link EnableGlobalMethodSecurity}): 实现Method层面的security，
	 * 规定谁可以访问哪个api
	 * <p><code>prePostEnabled = true</code>: Use <code>@PreAuthorize</code> on controller methods
	 * 规定哪个 username 可以访问当前api
	 * <p>securedEnabled = true: Use <code>@Secured</code> on controller methods
	 * 规定哪些角色(Authorities)(roles)可以访问当前api
	 * <p>jsr250Enabled = true: Use <code>@RolesAllowed</code> on controller methods
	 * 规定哪些角色(Authorities)(roles)可以访问当前api
	 */
	@Configuration
	@EnableWebSecurity
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
				// React ./logout -> 自动跳转到 "/api/logout"
				.logout().permitAll();
			// @formatter:on
		}

	}

	@Bean
	public javax.validation.Validator localValidatorFactoryBean() {
		return new LocalValidatorFactoryBean();
	}

	/**
	 *
	 * @return A singleton instance of BCryptPasswordEncoder for use in {@link UserService} to
	 * encode password for new user
	 */
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
