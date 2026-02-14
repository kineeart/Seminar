package com.contoso.socialapp.controller;

import com.contoso.socialapp.dto.NewPostRequest;
import com.contoso.socialapp.dto.PostResponse;
import com.contoso.socialapp.dto.UpdatePostRequest;
import com.contoso.socialapp.exception.ApiException;
import com.contoso.socialapp.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Slf4j
public class PostController {

	private final PostService postService;

	@GetMapping
	public ResponseEntity<List<PostResponse>> getAllPosts() {
		List<PostResponse> posts = postService.getAllPosts();
		return ResponseEntity.ok(posts);
	}

	@PostMapping
	public ResponseEntity<PostResponse> createPost(@Valid @RequestBody NewPostRequest request) {
		PostResponse post = postService.createPost(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(post);
	}

	@GetMapping("/{postId}")
	public ResponseEntity<PostResponse> getPostById(@PathVariable String postId) {
		return postService.getPostById(postId)
				.map(ResponseEntity::ok)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Post not found"));
	}

	@PatchMapping("/{postId}")
	public ResponseEntity<PostResponse> updatePost(@PathVariable String postId, @Valid @RequestBody UpdatePostRequest request) {
		return postService.updatePost(postId, request)
				.map(ResponseEntity::ok)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Post not found or you don't have permission to update it"));
	}

	@DeleteMapping("/{postId}")
	public ResponseEntity<Void> deletePost(@PathVariable String postId) {
		postService.deletePost(postId);
		return ResponseEntity.noContent().build();
	}
}
