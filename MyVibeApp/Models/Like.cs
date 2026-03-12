using System.ComponentModel.DataAnnotations;

namespace MyVibeApp.Models;

public class Like
{
    public Guid PostId { get; set; }

    public Post? Post { get; set; }

    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    public DateTime LikedAt { get; set; } = DateTime.UtcNow;
}
