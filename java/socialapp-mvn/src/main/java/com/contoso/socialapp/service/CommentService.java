package com.contoso.socialapp.service;

import com.contoso.socialapp.dto.CommentResponse;
import com.contoso.socialapp.dto.NewCommentRequest;
import com.contoso.socialapp.dto.UpdateCommentRequest;
import com.contoso.socialapp.exception.ApiException;
import com.contoso.socialapp.model.Comment;
import com.contoso.socialapp.model.Post;
import com.contoso.socialapp.repository.CommentRepository;
import com.contoso.socialapp.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CommentService {

	private final CommentRepository commentRepository;
	private final PostRepository postRepository;

	@Transactional(readOnly = true)
	public List<CommentResponse> getCommentsByPostId(String postId) {
		log.info("Retrieving comments for post ID: {}", postId);
		return commentRepository.findByPostIdOrderByCreatedAtAsc(postId)
				.stream()
				.map(this::toResponse)
				.collect(Collectors.toList());
	}

	public CommentResponse createComment(String postId, NewCommentRequest request) {
		log.info("Creating new comment for post ID: {} by user: {}", postId, request.getUsername());

		Post post = postRepository.findById(postId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Post not found"));

		Comment comment = new Comment();
		comment.setPost(post);
		comment.setUsername(request.getUsername());
		comment.setContent(request.getContent());

		Comment savedComment = commentRepository.save(comment);
		log.info("Created comment with ID: {} for post ID: {}", savedComment.getId(), postId);

		return toResponse(savedComment);
	}

	@Transactional(readOnly = true)
	public Optional<CommentResponse> getCommentById(String postId, String commentId) {
		log.info("Retrieving comment with ID: {} for post ID: {}", commentId, postId);
		return commentRepository.findByIdAndPostId(commentId, postId)
				.map(this::toResponse);
	}

	public Optional<CommentResponse> updateComment(String postId, String commentId, UpdateCommentRequest request) {
		log.info("Updating comment with ID: {} for post ID: {} by user: {}", commentId, postId, request.getUsername());

		return commentRepository.findByIdAndPostId(commentId, postId)
				.filter(comment -> comment.getUsername().equals(request.getUsername()))
				.map(comment -> {
					comment.setContent(request.getContent());
					Comment savedComment = commentRepository.save(comment);
					log.info("Updated comment with ID: {} for post ID: {}", savedComment.getId(), postId);
					return toResponse(savedComment);
				});
	}

	public void deleteComment(String postId, String commentId) {
		log.info("Deleting comment with ID: {} for post ID: {}", commentId, postId);

		Optional<Comment> comment = commentRepository.findByIdAndPostId(commentId, postId);
		if (comment.isEmpty()) {
			throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Comment not found");
		}

		commentRepository.delete(comment.get());
		log.info("Deleted comment with ID: {} for post ID: {}", commentId, postId);
	}

	private CommentResponse toResponse(Comment comment) {
		return new CommentResponse(
				comment.getId(),
				comment.getPostId(),
				comment.getUsername(),
				comment.getContent(),
				comment.getCreatedAt(),
				comment.getUpdatedAt()
		);
	}
}
