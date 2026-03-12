using System.ComponentModel.DataAnnotations;

namespace MyVibeApp.Models;

public class Comment
{
    public Guid Id { get; set; }

    public Guid PostId { get; set; }

    public Post? Post { get; set; }

    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
