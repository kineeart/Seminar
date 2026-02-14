package com.contoso.socialapp.service;

import com.contoso.socialapp.dto.LikeRequest;
import com.contoso.socialapp.dto.LikeResponse;
import com.contoso.socialapp.exception.ApiException;
import com.contoso.socialapp.model.Like;
import com.contoso.socialapp.model.LikeId;
import com.contoso.socialapp.model.Post;
import com.contoso.socialapp.repository.LikeRepository;
import com.contoso.socialapp.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LikeService {

	private final LikeRepository likeRepository;
	private final PostRepository postRepository;

	public LikeResponse addLike(String postId, LikeRequest request) {
		log.info("Adding like to post ID: {} by user: {}", postId, request.getUsername());

		Post post = postRepository.findById(postId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Post not found"));

		Optional<Like> existingLike = likeRepository.findByPostIdAndUsername(postId, request.getUsername());
		if (existingLike.isPresent()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Post already liked by this user");
		}

		Like like = new Like();
		like.setPost(post);
		like.setId(new LikeId(postId, request.getUsername()));

		Like savedLike = likeRepository.save(like);
		log.info("Added like to post ID: {} by user: {}", postId, request.getUsername());

		return new LikeResponse(savedLike.getPostId(), savedLike.getUsername(), savedLike.getLikedAt());
	}

	public void removeLike(String postId, String username) {
		log.info("Removing like from post ID: {} by user: {}", postId, username);

		Optional<Like> like = likeRepository.findByPostIdAndUsername(postId, username);
		if (like.isEmpty()) {
			throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Like not found");
		}

		likeRepository.delete(like.get());
		log.info("Removed like from post ID: {} by user: {}", postId, username);
	}
}
