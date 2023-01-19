package com.pivottech.booking.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import javax.validation.constraints.Future;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
public class CreateAvailabilityRequest {

	@NotNull
	@Future
	// @JsonFormat to control the output format of Date and Calendar types. 用于规范 field
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
	LocalDateTime fromUtc;

	@NotNull
	@Future
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
	LocalDateTime toUtc;

	@NotNull
	@Min(0)
	@Max(120)
	Integer durationMinutes;

}
