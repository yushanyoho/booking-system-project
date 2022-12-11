package com.pivottech.booking.intercepter;

import org.springframework.core.MethodParameter;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.time.LocalDate;

public class TodaysDateArgumentResolver implements HandlerMethodArgumentResolver {

	/**
	 * 用于检查某个method parameter是否需要调用当前这个resolver来resolve
	 * @param parameter the method parameter to check
	 * @return {@code true} if this resolver supports the supplied parameter;
	 * {@code false} otherwise
	 */
	@Override
	public boolean supportsParameter(MethodParameter parameter) {

		// resolve this parameter
		return parameter.getParameterType().isAssignableFrom(LocalDate.class) // if it is an instance of LocalDate
				&& parameter.hasParameterAnnotation(TodaysDate.class); // if the Annotation[] contains @TodaysDate
	}

	/**
	 *
	 * @param parameter the method parameter to resolve. This parameter must
	 * have previously been passed to {@link #supportsParameter} which must
	 * have returned {@code true}.
	 * @param mavContainer the ModelAndViewContainer for the current request
	 * @param webRequest the current request
	 * @param binderFactory a factory for creating {@link WebDataBinder} instances
	 * @return
	 * @throws Exception
	 */
	@Override
	public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
			NativeWebRequest webRequest, WebDataBinderFactory binderFactory) throws Exception {

		return LocalDate.now();
	}

}
