package com.pivottech.booking.service;

import com.pivottech.booking.model.Instructor;
import com.pivottech.booking.model.Student;
import com.pivottech.booking.model.User;
import com.pivottech.booking.repository.InstructorRepository;
import com.pivottech.booking.repository.StudentRepository;
import com.pivottech.booking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;

@Service
@Transactional
public class UserService implements UserDetailsService {

	@Autowired
	UserRepository userRepository;

	@Autowired
	StudentRepository studentRepository;

	@Autowired
	InstructorRepository instructorRepository;

	@Autowired
	PasswordEncoder passwordEncoder; // from config

	public User createUser(String username, String password) {
		User user = new User();
		user.setUsername(username);
		String encodedPassword = passwordEncoder.encode(password);
		user.setPassword(encodedPassword);
		userRepository.save(user);
		return user;
	}

	public User getUserByUsername(String username) {
		return userRepository.getByUsername(username);
	}

	public Student updateUserProfile(String username, Student student) {
		User user = getUserByUsername(username);

		// if user is not a student (has not been saved  into the student table)
		if (user.getStudent() == null) {
			student.setUser(user);
			studentRepository.save(student);
			return student;
		}

		// if user is already a student (exist in the student table)
		Student existing = user.getStudent();
		existing.setGrade(student.getGrade());
		// user table 中没有任何record更新，为什么要保存user？？？ 为什么 existing 不用保存？
		userRepository.save(user);
		return existing;
	}

	public Instructor updateUserProfile(String username, Instructor instructor) {
		User user = getUserByUsername(username);
		if (user.getInstructor() == null) {
			instructor.setUser(user);
			instructorRepository.save(instructor);
			return instructor;
		}
		Instructor existing = user.getInstructor();
		existing.setIntroduction(instructor.getIntroduction());
		userRepository.save(user);
		return existing;
	}

	/**
	 *
	 * @param username the username identifying the user whose data is required.
	 * @return An instance of a concrete class who implements the UserDetails interface.
	 * Could be a custom class model\User or the built-in class
	 * 'org.springframework.security.core.userdetails.User'
	 * @throws UsernameNotFoundException
	 */
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		User user = this.getUserByUsername(username);
		if (user == null) {
			throw new UsernameNotFoundException(username);
		}
		return user;
	}

}
