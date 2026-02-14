package com.contoso.socialapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {

	private String id;
	private String username;
	private String content;
	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;
	private int likesCount;
	private int commentsCount;
}
