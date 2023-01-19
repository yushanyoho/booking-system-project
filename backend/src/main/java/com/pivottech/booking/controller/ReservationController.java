package com.pivottech.booking.controller;

import com.pivottech.booking.model.Availability;
import com.pivottech.booking.model.MakeReservationRequest;
import com.pivottech.booking.model.Reservation;
import com.pivottech.booking.model.User;
import com.pivottech.booking.service.BookingService;
import com.pivottech.booking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("{username}/reservations")
public class ReservationController {

	final static int DEFAULT_PAGE_SIZE = 50;

	final BookingService bookingService;

	final UserService userService;

	@Autowired
	public ReservationController(BookingService bookingService, UserService userService) {
		this.bookingService = bookingService;
		this.userService = userService;
	}

	@GetMapping("")
	// 能不能 redirect 到 "/login"? 能不能附带message？
	@PreAuthorize("#username == authentication.principal.username")
	public List<Reservation> list(@PathVariable("username") final String username,
			@RequestParam(name = "from") @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm") LocalDateTime from,
			@RequestParam(name = "to") @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm") LocalDateTime to) {
		final User user = userService.getUserByUsername(username);
		if (user == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "student doesn't exist");
		}

		// 如果是student，查看reservation中有哪些符合student_id, from, to
		if (user.getStudent() != null) {
			return bookingService.getStudentReservationsBetween(user.getStudent(), from, to);
		}

		// 如果是instructor，查看availability中有哪些符合instructor_id, 并且availability.reservation 符合 from, to
		if (user.getInstructor() != null) {
			return bookingService.getInstructorReservationsBetween(user.getInstructor(), from, to);
		}
		return new ArrayList<>();
	}

	@GetMapping("/{id}")
	public Reservation getById(@PathVariable("id") long id) {
		Reservation resv = this.bookingService.getReservationById(id);
		if (resv == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND);
		}
		return resv;
	}

	@PostMapping("")
	// 能不能 redirect 到 "/login"? 能不能附带message？
	@PreAuthorize("#username == authentication.principal.username")
	public Reservation create(@PathVariable("username") final String username,
			@Valid @RequestBody final MakeReservationRequest request) {

		final User user = userService.getUserByUsername(username);

		// 能否改成instructor也可以make reservation？
		if (user == null || user.getStudent() == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "student doesn't exist");
		}

		// if provided with an already reserved Availability
		final Availability availability = bookingService.getAvailabilityById(request.getAvailabilityId());
		if (availability == null || availability.getReservation() != null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "not available");
		}
		Reservation saved = this.bookingService.createReservation(user.getStudent(), availability,
				request.getDescription());
		return saved;
	}

}