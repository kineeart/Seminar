package com.contoso.socialapp.exception;

import org.springframework.http.HttpStatus;

import java.util.List;

public class ApiException extends RuntimeException {

	private final HttpStatus status;
	private final String error;
	private final List<String> details;

	public ApiException(HttpStatus status, String error, String message) {
		super(message);
		this.status = status;
		this.error = error;
		this.details = null;
	}

	public ApiException(HttpStatus status, String error, String message, List<String> details) {
		super(message);
		this.status = status;
		this.error = error;
		this.details = details;
	}

	public HttpStatus getStatus() {
		return status;
	}

	public String getError() {
		return error;
	}

	public List<String> getDetails() {
		return details;
	}
}
