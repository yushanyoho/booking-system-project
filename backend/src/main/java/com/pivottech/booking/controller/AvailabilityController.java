package com.pivottech.booking.controller;

import com.pivottech.booking.model.Availability;
import com.pivottech.booking.model.CreateAvailabilityRequest;
import com.pivottech.booking.model.User;
import com.pivottech.booking.service.BookingService;
import com.pivottech.booking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;
import java.time.Duration;
import java.time.LocalDateTime;

@RestController
@RequestMapping("{username}/availabilities")
public class AvailabilityController {

	@Autowired
	BookingService bookingService;

	@Autowired
	UserService userService;

	@GetMapping("")
	public Iterable<Availability> list(@PathVariable("username") String username,
			// @DateTimeFormat: Declares that a field or method parameter should be formatted as a date or time
			@RequestParam(name = "from") @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm") LocalDateTime from,
			@RequestParam(name = "to") @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm") LocalDateTime to) {
		User user = userService.getUserByUsername(username);
		if (user == null || user.getInstructor() == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "instructor doesn't exist");
		}
		return bookingService.findAvailabilitiesBetween(user.getInstructor(), from, to);
	}

	@PostMapping("")
	// response 403 Forbidden if rules not allowed
	@RolesAllowed({ "Instructor" }) // from javax.annotation.security 限制 Authorities (roles)
	// @Secured({ "Instructor" }) // from springframework.security.access.annotation
	public Iterable<Availability> create(@PathVariable("username") String username,
			@Valid @RequestBody CreateAvailabilityRequest request) {
		User user = userService.getUserByUsername(username);
		if (user == null || user.getInstructor() == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "instructor doesn't exist");
		}
		LocalDateTime from = request.getFromUtc();
		LocalDateTime to = request.getToUtc();
		if (from.isAfter(to)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "from must be earlier than to");
		}
		Duration duration = Duration.ofMinutes(request.getDurationMinutes());
		return bookingService.createAvailability(user.getInstructor(), from, to, duration);
	}

}
