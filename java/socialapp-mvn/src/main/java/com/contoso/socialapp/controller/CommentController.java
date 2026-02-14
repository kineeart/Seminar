package com.contoso.socialapp.controller;

import com.contoso.socialapp.dto.CommentResponse;
import com.contoso.socialapp.dto.NewCommentRequest;
import com.contoso.socialapp.dto.UpdateCommentRequest;
import com.contoso.socialapp.exception.ApiException;
import com.contoso.socialapp.service.CommentService;
import com.contoso.socialapp.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
@Slf4j
public class CommentController {

	private final CommentService commentService;
	private final PostService postService;

	@GetMapping
	public ResponseEntity<List<CommentResponse>> getCommentsByPostId(@PathVariable String postId) {
		if (!postService.postExists(postId)) {
			throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Post not found");
		}

		List<CommentResponse> comments = commentService.getCommentsByPostId(postId);
		return ResponseEntity.ok(comments);
	}

	@PostMapping
	public ResponseEntity<CommentResponse> createComment(@PathVariable String postId, @Valid @RequestBody NewCommentRequest request) {
		CommentResponse comment = commentService.createComment(postId, request);
		return ResponseEntity.status(HttpStatus.CREATED).body(comment);
	}

	@GetMapping("/{commentId}")
	public ResponseEntity<CommentResponse> getCommentById(@PathVariable String postId, @PathVariable String commentId) {
		return commentService.getCommentById(postId, commentId)
				.map(ResponseEntity::ok)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Comment not found"));
	}

	@PatchMapping("/{commentId}")
	public ResponseEntity<CommentResponse> updateComment(@PathVariable String postId, @PathVariable String commentId, @Valid @RequestBody UpdateCommentRequest request) {
		return commentService.updateComment(postId, commentId, request)
				.map(ResponseEntity::ok)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Comment not found or you don't have permission to update it"));
	}

	@DeleteMapping("/{commentId}")
	public ResponseEntity<Void> deleteComment(@PathVariable String postId, @PathVariable String commentId) {
		commentService.deleteComment(postId, commentId);
		return ResponseEntity.noContent().build();
	}
}
