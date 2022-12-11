package com.pivottech.booking.model;

import lombok.Data;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

/**
 * <p>This model is intended to be used as a DTO (Data Transfer Object) in the process
 * of User Registration. The following validation criteria should be implemented:</p>
 *
 * <p>1. All required fields are filled (No empty or null fields). (Built-In Validation)</p>
 *
 * <p>2. The email address is valid (well-formed). (Custom Validation)</p>
 *
 * <p>3. The password confirmation field matches the password field. (Custom Validation)</p>
 */
@Data
public class CreateUserRequest {

	@NotEmpty // usually used on String, str.length() = 0 is not allowed
	@NotNull // should not be null
	String username;

	@NotEmpty
	@NotNull
	String password;

}
