package com.pivottech.booking.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity(name = "Availability")
@Table(indexes = { @Index(name = "index_instructor_start_end", columnList = "utcStartTime, utcEndTime, instructor_id",
		unique = true) })
@Data // @Getter, @Setter, @RequiredArgsConstructor, @ToString, @EqualsAndHashCode, @Value
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Availability {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Setter(AccessLevel.NONE)
	Long id;

	@NotNull
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
	LocalDateTime utcStartTime;

	@NotNull
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
	LocalDateTime utcEndTime;

	@ManyToOne
	@JoinColumn(name = "instructor_id")
	@NotNull
	Instructor instructor;

	@ManyToOne
	@JoinColumn(name = "reservation_id")
	@JsonBackReference // stop the object serialization recursion here, hide this field from JSON serialization
	Reservation reservation;

	@Version
	@Setter(AccessLevel.NONE)
	Integer version;

}
