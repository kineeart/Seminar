package com.contoso.socialapp.controller;

import com.contoso.socialapp.dto.LikeRequest;
import com.contoso.socialapp.dto.LikeResponse;
import com.contoso.socialapp.service.LikeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts/{postId}/likes")
@RequiredArgsConstructor
@Slf4j
public class LikeController {

	private final LikeService likeService;

	@PostMapping
	public ResponseEntity<LikeResponse> addLike(@PathVariable String postId, @Valid @RequestBody LikeRequest request) {
		LikeResponse response = likeService.addLike(postId, request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@DeleteMapping
	public ResponseEntity<Void> removeLike(@PathVariable String postId, @RequestParam String username) {
		likeService.removeLike(postId, username);
		return ResponseEntity.noContent().build();
	}
}
