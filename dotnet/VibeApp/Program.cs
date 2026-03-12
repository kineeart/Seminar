using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Built-in OpenAPI (ASP.NET Core 10)
builder.Services.AddOpenApi();

// In-memory storage
var posts = new List<Post>();
var comments = new List<Comment>();
var likes = new List<Like>();

var app = builder.Build();

// Expose OpenAPI JSON cho Swagger UI (tĩnh)
app.MapOpenApi(); // /openapi/v1.json mặc định
app.MapOpenApi("/swagger/{documentName}/swagger.json"); // /swagger/v1/swagger.json

app.UseStaticFiles();
app.UseHttpsRedirection();

var api = app.MapGroup("/api");

// Posts
api.MapGet("/posts", () =>
{
	var result = posts.Select(p => p.WithCounts(comments, likes));
	return Results.Ok(result);
});

api.MapPost("/posts", (NewPostRequest request) =>
{
	if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Content))
	{
		return Results.BadRequest(Error.Validation("The request body is invalid", new[] { "username and content are required" }));
	}

	var now = DateTime.UtcNow;
	var post = new Post
	{
		Id = Guid.NewGuid(),
		Username = request.Username!,
		Content = request.Content!,
		CreatedAt = now,
		UpdatedAt = now
	};

	posts.Add(post);

	return Results.Created($"/api/posts/{post.Id}", post.WithCounts(comments, likes));
});

api.MapGet("/posts/{postId:guid}", (Guid postId) =>
{
	var post = posts.FirstOrDefault(p => p.Id == postId);
	if (post is null)
	{
		return Results.NotFound(Error.NotFound("The requested resource was not found"));
	}

	return Results.Ok(post.WithCounts(comments, likes));
});

api.MapPatch("/posts/{postId:guid}", (Guid postId, UpdatePostRequest request) =>
{
	if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Content))
	{
		return Results.BadRequest(Error.Validation("The request body is invalid", new[] { "username and content are required" }));
	}

	var post = posts.FirstOrDefault(p => p.Id == postId);
	if (post is null)
	{
		return Results.NotFound(Error.NotFound("The requested resource was not found"));
	}

	// Simple validation: username must match the author
	if (!string.Equals(post.Username, request.Username, StringComparison.Ordinal))
	{
		return Results.BadRequest(Error.Validation("The request body is invalid", new[] { "username does not match post author" }));
	}

	post.Content = request.Content!;
	post.UpdatedAt = DateTime.UtcNow;

	return Results.Ok(post.WithCounts(comments, likes));
});

api.MapDelete("/posts/{postId:guid}", (Guid postId) =>
{
	var post = posts.FirstOrDefault(p => p.Id == postId);
	if (post is null)
	{
		return Results.NotFound(Error.NotFound("The requested resource was not found"));
	}

	posts.Remove(post);
	comments.RemoveAll(c => c.PostId == postId);
	likes.RemoveAll(l => l.PostId == postId);

	return Results.NoContent();
});

// Comments
api.MapGet("/posts/{postId:guid}/comments", (Guid postId) =>
{
	var post = posts.FirstOrDefault(p => p.Id == postId);
	if (post is null)
	{
		return Results.NotFound(Error.NotFound("The requested resource was not found"));
	}

	var postComments = comments.Where(c => c.PostId == postId);
	return Results.Ok(postComments);
});

api.MapPost("/posts/{postId:guid}/comments", (Guid postId, NewCommentRequest request) =>
{
	if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Content))
	{
		return Results.BadRequest(Error.Validation("The request body is invalid", new[] { "username and content are required" }));
	}

	var post = posts.FirstOrDefault(p => p.Id == postId);
	if (post is null)
	{
		return Results.NotFound(Error.NotFound("The requested resource was not found"));
	}

	var now = DateTime.UtcNow;
	var comment = new Comment
	{
		Id = Guid.NewGuid(),
		PostId = postId,
		Username = request.Username!,
		Content = request.Content!,
		CreatedAt = now,
		UpdatedAt = now
	};

	comments.Add(comment);

	return Results.Created($"/api/posts/{postId}/comments/{comment.Id}", comment);
});

api.MapGet("/posts/{postId:guid}/comments/{commentId:guid}", (Guid postId, Guid commentId) =>
{
	var post = posts.FirstOrDefault(p => p.Id == postId);
	if (post is null)
	{
		return Results.NotFound(Error.NotFound("The requested resource was not found"));
	}

	var comment = comments.FirstOrDefault(c => c.PostId == postId && c.Id == commentId);
	if (comment is null)
	{
		return Results.NotFound(Error.NotFound("The requested resource was not found"));
	}

	return Results.Ok(comment);
});

api.MapPatch("/posts/{postId:guid}/comments/{commentId:guid}", (Guid postId, Guid commentId, UpdateCommentRequest request) =>
{
	if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Content))
	{
		return Results.BadRequest(Error.Validation("The request body is invalid", new[] { "username and content are required" }));
	}

	var post = posts.FirstOrDefault(p => p.Id == postId);
	if (post is null)
	{
		return Results.NotFound(Error.NotFound("The requested resource was not found"));
	}

	var comment = comments.FirstOrDefault(c => c.PostId == postId && c.Id == commentId);
	if (comment is null)
	{
		return Results.NotFound(Error.NotFound("The requested resource was not found"));
	}

	if (!string.Equals(comment.Username, request.Username, StringComparison.Ordinal))
	{
		return Results.BadRequest(Error.Validation("The request body is invalid", new[] { "username does not match comment author" }));
	}

	comment.Content = request.Content!;
	comment.UpdatedAt = DateTime.UtcNow;

	return Results.Ok(comment);
});

api.MapDelete("/posts/{postId:guid}/comments/{commentId:guid}", (Guid postId, Guid commentId) =>
{
	var post = posts.FirstOrDefault(p => p.Id == postId);
	if (post is null)
	{
		return Results.NotFound(Error.NotFound("The requested resource was not found"));
	}

	var comment = comments.FirstOrDefault(c => c.PostId == postId && c.Id == commentId);
	if (comment is null)
	{
		return Results.NotFound(Error.NotFound("The requested resource was not found"));
	}

	comments.Remove(comment);
	return Results.NoContent();
});

// Likes
api.MapPost("/posts/{postId:guid}/likes", (Guid postId, LikeRequest request) =>
{
	if (string.IsNullOrWhiteSpace(request.Username))
	{
		return Results.BadRequest(Error.Validation("The request body is invalid", new[] { "username is required" }));
	}

	var post = posts.FirstOrDefault(p => p.Id == postId);
	if (post is null)
	{
		return Results.NotFound(Error.NotFound("The requested resource was not found"));
	}

	var existing = likes.FirstOrDefault(l => l.PostId == postId && l.Username == request.Username);
	if (existing is not null)
	{
		// Idempotent like: return current like response
		return Results.Created($"/api/posts/{postId}/likes", new LikeResponse
		{
			PostId = postId,
			Username = existing.Username,
			LikedAt = existing.LikedAt
		});
	}

	var like = new Like
	{
		PostId = postId,
		Username = request.Username!,
		LikedAt = DateTime.UtcNow
	};

	likes.Add(like);

	var response = new LikeResponse
	{
		PostId = postId,
		Username = like.Username,
		LikedAt = like.LikedAt
	};

	return Results.Created($"/api/posts/{postId}/likes", response);
});

api.MapDelete("/posts/{postId:guid}/likes", (Guid postId) =>
{
	var post = posts.FirstOrDefault(p => p.Id == postId);
	if (post is null)
	{
		return Results.NotFound(Error.NotFound("The requested resource was not found"));
	}

	// No username in contract: remove all likes for this post (idempotent for clients)
	likes.RemoveAll(l => l.PostId == postId);
	return Results.NoContent();
});

app.Run();

// Models matching OpenAPI schemas (PascalCase)

public class Post
{
	public Guid Id { get; set; }

	[Required]
	[MaxLength(50)]
	public string Username { get; set; } = string.Empty;

	[Required]
	[MaxLength(2000)]
	public string Content { get; set; } = string.Empty;

	public DateTime CreatedAt { get; set; }

	public DateTime UpdatedAt { get; set; }

	public int LikesCount { get; set; }

	public int CommentsCount { get; set; }
}

public class Comment
{
	public Guid Id { get; set; }

	public Guid PostId { get; set; }

	[Required]
	[MaxLength(50)]
	public string Username { get; set; } = string.Empty;

	[Required]
	[MaxLength(1000)]
	public string Content { get; set; } = string.Empty;

	public DateTime CreatedAt { get; set; }

	public DateTime UpdatedAt { get; set; }
}

public class NewPostRequest
{
	public string? Username { get; set; }

	public string? Content { get; set; }
}

public class UpdatePostRequest
{
	public string? Username { get; set; }

	public string? Content { get; set; }
}

public class NewCommentRequest
{
	public string? Username { get; set; }

	public string? Content { get; set; }
}

public class UpdateCommentRequest
{
	public string? Username { get; set; }

	public string? Content { get; set; }
}

public class Like
{
	public Guid PostId { get; set; }

	public string Username { get; set; } = string.Empty;

	public DateTime LikedAt { get; set; }
}

public class LikeRequest
{
	public string? Username { get; set; }
}

public class LikeResponse
{
	public Guid PostId { get; set; }

	public string Username { get; set; } = string.Empty;

	public DateTime LikedAt { get; set; }
}

public class Error
{
	[JsonPropertyName("error")]
	public string ErrorCode { get; set; } = string.Empty;

	public string Message { get; set; } = string.Empty;

	public List<string>? Details { get; set; }

	public static Error Validation(string message, IEnumerable<string>? details = null) =>
		new()
		{
			ErrorCode = "VALIDATION_ERROR",
			Message = message,
			Details = details?.ToList()
		};

	public static Error NotFound(string message) =>
		new()
		{
			ErrorCode = "NOT_FOUND",
			Message = message
		};

	public static Error Internal(string message) =>
		new()
		{
			ErrorCode = "INTERNAL_ERROR",
			Message = message
		};
}

public static class PostExtensions
{
	public static Post WithCounts(this Post post, IEnumerable<Comment> allComments, IEnumerable<Like> allLikes)
	{
		post.CommentsCount = allComments.Count(c => c.PostId == post.Id);
		post.LikesCount = allLikes.Count(l => l.PostId == post.Id);
		return post;
	}
}

