package com.pivottech.booking.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.*;

import javax.persistence.*;
import java.io.Serializable;

@Entity(name = "Student")
@Data
@ToString(exclude = { "user" }) // 否则调用toString()时会发生死循环
@EqualsAndHashCode(exclude = { "user" }) // 否则生成hashcode时会发生死循环
public class Student implements Serializable {

	@Id
	@Setter(AccessLevel.NONE)
	Long id;

	@OneToOne(cascade = { CascadeType.ALL })
	@JoinColumn(name = "user_id")
	@MapsId
	@JsonBackReference("user-student")
	User user;

	String grade;

}
