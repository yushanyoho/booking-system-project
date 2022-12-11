package com.pivottech.booking.intercepter;

import lombok.extern.log4j.Log4j2;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Log4j2
public class LogInterceptor implements HandlerInterceptor {

	/**
	 * Interception point before the execution of a handler. (before the web request hits the APIs on controllers)
	 * @param request current HTTP request
	 * @param response current HTTP response
	 * @param handler chosen handler to execute, for type and/or instance evaluation (controller methods)
	 * @return {@code true} if the execution chain should proceed with the
	 * next interceptor or the handler itself. Else, DispatcherServlet assumes
	 * that this interceptor has already dealt with the response itself.
	 * @throws Exception
	 */
	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {

		/**
		 * log the type of HttpServletRequest (REQUEST / ERROR)
		 */
		log.info("preHandle. request type: {}", request.getDispatcherType());

		/**
		 * If the given handler is an instance of HandlerMethod
		 */
		if (handler instanceof HandlerMethod) {

			/**
			 * Convert it to the HandlerMethod class
			 */
			HandlerMethod handlerMethod = (HandlerMethod) handler;

			/**
			 * Get the class name of the given handler (HelloWorldController)
			 */
			String methodClass = handlerMethod.getMethod().getDeclaringClass().getName();

			/**
			 * Get the method name of the given handler (index, todaysDate, etc...)
			 */
			String methodName = handlerMethod.getMethod().getName();

			/**
			 * log the class name and method name of the given handler
			 */
			log.info("handler: {}, {}", methodClass, methodName);
		}
		return true;
	}

	/**
	 * Interception point after successful execution of a handler.
	 * @param request current HTTP request
	 * @param response current HTTP response
	 * @param handler the handler (or {@link HandlerMethod}) that started asynchronous
	 * execution, for type and/or instance examination
	 * @param modelAndView the {@code ModelAndView} that the handler returned
	 * (can also be {@code null})
	 * @throws Exception
	 */
	@Override
	public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
			ModelAndView modelAndView) throws Exception {

		/**
		 * log info after successful execution of a handler.
		 */
		log.info("postHandle");
	}

	/**
	 * Callback after completion of request processing, that is, after rendering the view.
	 * @param request current HTTP request
	 * @param response current HTTP response
	 * @param handler the handler (or {@link HandlerMethod}) that started asynchronous
	 * execution, for type and/or instance examination
	 * @param ex any exception thrown on handler execution, if any; this does not
	 * include exceptions that have been handled through an exception resolver
	 * @throws Exception
	 */
	@Override
	public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)
			throws Exception {

		/**
		 * log info after rendering the view
		 */
		log.info("afterCompletion");
	}

}
