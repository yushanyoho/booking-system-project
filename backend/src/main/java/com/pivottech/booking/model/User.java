package com.pivottech.booking.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.Data;
import lombok.ToString;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import javax.persistence.*;
import javax.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Models core user information retrieved by a UserDetailsService.
 */
@Data
@ToString(exclude = { "password" })
@Entity(name = "User")
@Table(name = "\"user\"", indexes = { @Index(name = "username_index", columnList = "username", unique = true) })
public class User implements UserDetails {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	Long id;

	@NotEmpty
	@Column(nullable = false)
	String username;

	@JsonIgnore()
	String password; // encoded password

	@OneToOne(mappedBy = "user") // 在 Instructor table 中通过 JOIN User table 获得
	@JsonManagedReference("user-instructor")
	Instructor instructor;

	@OneToOne(mappedBy = "user") // 在 Student table 中通过 JOIN User table 获得
	@JsonManagedReference("user-student")
	Student student;

	/**
	 * <p>Returns the authorities (roles) granted to the user. Cannot return <code>null</code>.
	 * <p>用于定义并获取 user roles
	 * @return the authorities (roles), sorted by natural key (never <code>null</code>)
	 */
	@Override
	@JsonIgnore
	public Collection<? extends GrantedAuthority> getAuthorities() {
		List<SimpleGrantedAuthority> authorities = new ArrayList<>();

		// 当配套 @RolesAllowed 使用时需要在角色名中加入前缀，而配套 @Secured 则不需要
		// @RolesAllowed({ "<role_name>" }), new SimpleGrantedAuthority("ROLE_<role_name>")
		// @Secured({ "<role_name>" }), new SimpleGrantedAuthority("<role_name>")
		if (this.instructor != null) {
			authorities.add(new SimpleGrantedAuthority("ROLE_Instructor"));
		}
		if (this.student != null) {
			authorities.add(new SimpleGrantedAuthority("ROLE_Student"));
		}
		return authorities;
	}

	@Override
	@JsonIgnore
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	@JsonIgnore
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	@JsonIgnore
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	@JsonIgnore
	public boolean isEnabled() {
		return true;
	}

}
