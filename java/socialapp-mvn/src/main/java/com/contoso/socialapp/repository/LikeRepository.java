package com.contoso.socialapp.repository;

import com.contoso.socialapp.model.Like;
import com.contoso.socialapp.model.LikeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, LikeId> {

	@Query("SELECT l FROM Like l WHERE l.id.postId = :postId AND l.id.username = :username")
	Optional<Like> findByPostIdAndUsername(@Param("postId") String postId, @Param("username") String username);
}
