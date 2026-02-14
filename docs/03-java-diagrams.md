# PlantUML Diagrams - Java Migration Report
## Sử dụng: Copy code và paste vào https://www.planttext.com/ để render

---

## DIAGRAM 1: ARCHITECTURE - UML Component Diagram
```plantuml
@startuml architecture
!include <C4/C4_Component>

skinparam linetype ortho
title Java Spring Boot Architecture - Social App

Component(client, "Client\n(Browser/API Client)", "HTTP") 
Component(swagger, "Swagger UI\n(OpenAPI Doc)", "Web Interface")

rectangle "Spring Boot Application" {
  Component(controller, "Controllers", "REST Layer")
  Component(service, "Services", "Business Logic")
  Component(repo, "Repositories", "Data Access")
}

Component(db, "SQLite Database\n(sns_api.db)", "Persistence")

client --|> controller
client --|> swagger
swagger --|> controller
controller --> service
service --> repo
repo --> db

@enduml
```

---

## DIAGRAM 2: ENTITY RELATIONSHIP DIAGRAM (ERD)
```plantuml
@startuml erd
!define COLUMN(x) <color:#035><b>x</b></color>
!define TABLE(x) <color:#3d0><b>x</b></color>

entity "TABLE(Post)" {
    COLUMN(id) : Long << generated >>
    COLUMN(content) : String
    COLUMN(username) : String
    COLUMN(created_at) : LocalDateTime
    COLUMN(updated_at) : LocalDateTime
}

entity "TABLE(Comment)" {
    COLUMN(id) : Long << generated >>
    COLUMN(post_id) : Long << FK >>
    COLUMN(content) : String
    COLUMN(username) : String
    COLUMN(created_at) : LocalDateTime
    COLUMN(updated_at) : LocalDateTime
}

entity "TABLE(Like)" {
    COLUMN(id) : Long << generated >>
    COLUMN(post_id) : Long << FK >>
    COLUMN(username) : String
    COLUMN(created_at) : LocalDateTime
}

TABLE(Post) ||--o{ TABLE(Comment): has
TABLE(Post) ||--o{ TABLE(Like): receives

@enduml
```

---

## DIAGRAM 3: SEQUENCE DIAGRAM - USE CASE TAO POST CO COMMENT
```plantuml
@startuml sequence_post_comment
actor User
participant "Browser" as B
participant "PostController" as PC
participant "PostService" as PS
participant "CommentService" as CS
participant "Repository" as R
participant "SQLite DB" as DB

User->>B: POST /api/posts (content, username)
activate B
B->>PC: HTTP POST
activate PC
PC->>PS: createPost(request)
activate PS
PS->>R: postRepository.save(entity)
activate R
R->>DB: INSERT INTO post
activate DB
DB-->>R: post inserted (id=1)
deactivate DB
R-->>PS: Post entity with id=1
deactivate R
PS-->>PC: PostResponse
deactivate PS
PC-->>B: 201 Created, PostResponse
deactivate PC

User->>B: GET /api/posts/1/comments
B->>PC: HTTP GET
activate PC
PC->>PS: getPost(1)
activate PS
PS->>R: postRepository.findById(1)
R->>DB: SELECT * FROM post WHERE id=1
DB-->>R: Post
R-->>PS: Post
PS-->>PC: PostResponse with comments
deactivate PS
PC-->>B: 200 OK, PostResponse + comments
deactivate PC

@enduml
```

---

## DIAGRAM 4: CLASS DIAGRAM - LAYER & RELATIONSHIP
```plantuml
@startuml class_diagram
!theme plain
skinparam backgroundColor #FEFEFE

package "com.contoso.socialapp.model" {
    class Post {
        -id: Long
        -content: String
        -username: String
        -createdAt: LocalDateTime
        -updatedAt: LocalDateTime
        -comments: List<Comment>
        -likes: List<Like>
        +Post()
        +getters/setters()
    }
    
    class Comment {
        -id: Long
        -content: String
        -username: String
        -createdAt: LocalDateTime
        -updatedAt: LocalDateTime
        -post: Post
        +getters/setters()
    }
    
    class Like {
        -id: Long
        -username: String
        -createdAt: LocalDateTime
        -post: Post
        +getters/setters()
    }
}

package "com.contoso.socialapp.dto" {
    class PostResponse {
        +id: Long
        +content: String
        +username: String
        +comments: List<CommentResponse>
        +likeCount: Long
        +createdAt: LocalDateTime
    }
    
    class NewPostRequest {
        +content: String
        +username: String
    }
}

package "com.contoso.socialapp.service" {
    class PostService {
        -postRepository: PostRepository
        +getAllPosts(): List<PostResponse>
        +getPostById(id): PostResponse
        +createPost(req): PostResponse
        +updatePost(id, req): PostResponse
        +deletePost(id): void
    }
    
    class CommentService {
        -commentRepository: CommentRepository
        +getCommentsByPostId(postId)
        +createComment(postId, req)
        +updateComment(postId, commentId, req)
        +deleteComment(postId, commentId)
    }
}

package "com.contoso.socialapp.controller" {
    class PostController {
        -postService: PostService
        +getAllPosts()
        +getPostById(id)
        +createPost(req)
        +updatePost(id, req)
        +deletePost(id)
    }
    
    class CommentController {
        -commentService: CommentService
        +getCommentsByPostId(postId)
        +createComment(postId, req)
        +updateComment(postId, commentId, req)
        +deleteComment(postId, commentId)
    }
}

Post "1" -- "*" Comment: has
Post "1" -- "*" Like: receives
PostService --> Post: uses
PostService --> PostResponse: returns
CommentService --> Comment: uses
PostController --> PostService: uses
CommentController --> CommentService: uses
PostController --> NewPostRequest: receives
PostController --> PostResponse: returns

@enduml
```

---

## DIAGRAM 5: DEPLOYMENT DIAGRAM - RUNTIME ENVIRONMENT
```plantuml
@startuml deployment
!theme plain

node "Developer Workstation" {
    component "VS Code / IDE" {
        component "Java Source Code"
    }
    component "Terminal" {
        component "Maven Wrapper (mvnw)"
    }
}

node "Runtime Environment" {
    component "JVM (Java 11+)" {
        component "Spring Boot Runtime" {
            component "Tomcat Server (Port 8080)"
            component "Application Context"
        }
    }
    component "SQLite Engine" {
        database "sns_api.db"
    }
}

node "Client" {
    component "Browser" {
        component "Swagger UI"
        component "REST Client"
    }
}

"Java Source Code" -.->|mvn compile| "JVM (Java 11+)"
"Maven Wrapper (mvnw)" -.->|spring-boot:run| "Tomcat Server (Port 8080)"
"Browser" -->|HTTP Request| "Tomcat Server (Port 8080)"
"Tomcat Server (Port 8080)" -->|JDBC| "sns_api.db"
"Application Context" -->|manages| "SQLite Engine"

@enduml
```

---

## DIAGRAM 6: STATE DIAGRAM - POST LIFECYCLE
```plantuml
@startuml state_post
[*] --> Created: POST /api/posts

Created --> Updated: PATCH /api/posts/{id}\n(content update)
Created --> Liked: POST /api/posts/{id}/likes\n(add like)
Created --> Commented: POST /api/posts/{id}/comments\n(add comment)

Updated --> Updated: PATCH /api/posts/{id}
Updated --> Liked: POST /api/posts/{id}/likes
Updated --> Commented: POST /api/posts/{id}/comments

Liked --> Updated: PATCH /api/posts/{id}
Liked --> Commented: POST /api/posts/{id}/comments

Commented --> Updated: PATCH /api/posts/{id}
Commented --> Liked: POST /api/posts/{id}/likes

Created --> Deleted: DELETE /api/posts/{id}
Updated --> Deleted: DELETE /api/posts/{id}
Liked --> Deleted: DELETE /api/posts/{id}
Commented --> Deleted: DELETE /api/posts/{id}

Deleted --> [*]

@enduml
```

---

## DIAGRAM 7: MIGRATION PROCESS FLOW (Mermaid)
```mermaid
flowchart TD
    A[Phân tích FastAPI + OpenAPI] --> B[Scaffold Spring Boot Maven]
    B --> C[Map DTO + Entity]
    C --> D[Service + Repository]
    D --> E[Controller + Validation]
    E --> F[Database + CORS + Swagger]
    F --> G[Build TestRun]
    G --> H{Tests Pass?}
    H -->|Yes| I[✅ Migration Success]
    H -->|No| J[Fix & Retry]
    J --> G
```

---

## DIAGRAM 8: CONTROLLER REQUEST FLOW (Mermaid)
```mermaid
flowchart LR
    subgraph Frontend["Frontend/Client"]
        A["HTTP Request<br/>POST /api/posts"]
    end
    
    subgraph Spring["Spring Application"]
        B["PostController.createPost()"]
        C["@Validated @RequestBody<br/>NewPostRequest"]
        D["PostService.createPost()"]
        E["PostRepository.save()"]
    end
    
    subgraph Database["SQLite DB"]
        F["INSERT INTO post<br/>(content, username)"]
    end
    
    A -->|JSON| B
    B --> C
    C -->|if valid| D
    D --> E
    E --> F
    F -->|return| E
    E -->|PostResponse| B
    B -->|201 + JSON| A
```

---

## Hướng dẫn sử dụng

1. **Copy từng block code** (giữa ```plantuml ... ``` hoặc ```mermaid ... ```)
2. **Truy cập:** https://www.planttext.com/ (cho PlantUML)
3. **Paste code** vào editor
4. **Render ra PNG/SVG**
5. **Download và lưu** vào `docs/images/03-java/`

### Danh sách file hình ảnh cần lưu
- `diagram-1-architecture.png` - Component architecture
- `diagram-2-erd.png` - Entity relationship
- `diagram-3-sequence.png` - Create post with comments sequence
- `diagram-4-class.png` - All classes and relationships
- `diagram-5-deployment.png` - Runtime deployment
- `diagram-6-state.png` - Post lifecycle states
- `diagram-7-process.png` - Migration process flow
- `diagram-8-controller-flow.png` - Request flow trong controller

---

**Ghi chú:** Nếu muốn render Mermaid diagram, có thể sử dụng https://mermaid.live/ hoặc GitHub markdown preview.
