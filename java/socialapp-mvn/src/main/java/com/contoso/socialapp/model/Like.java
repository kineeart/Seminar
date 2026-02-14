package com.contoso.socialapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "likes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Like {

	@EmbeddedId
	private LikeId id;

	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("postId")
	@JoinColumn(name = "post_id", nullable = false)
	private Post post;

	@Column(name = "liked_at", nullable = false)
	private OffsetDateTime likedAt;

	@PrePersist
	protected void onCreate() {
		likedAt = OffsetDateTime.now(ZoneOffset.UTC);
	}

	public String getPostId() {
		return id != null ? id.getPostId() : null;
	}

	public String getUsername() {
		return id != null ? id.getUsername() : null;
	}
}
