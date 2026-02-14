import os
import yaml
import aiosqlite
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from starlette.responses import Response

OPENAPI_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'openapi.yaml')
DB_PATH = os.path.join(os.path.dirname(__file__), 'sns_api.db')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"]
)

# Always initialize DB
async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            content TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL,
            likeCount INTEGER NOT NULL,
            commentCount INTEGER NOT NULL
        );
        """)
        await db.execute("""
        CREATE TABLE IF NOT EXISTS comments (
            id TEXT PRIMARY KEY,
            postId TEXT NOT NULL,
            username TEXT NOT NULL,
            content TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
        );
        """)
        await db.execute("""
        CREATE TABLE IF NOT EXISTS likes (
            postId TEXT NOT NULL,
            username TEXT NOT NULL,
            PRIMARY KEY (postId, username)
        );
        """)
        await db.commit()

@app.on_event("startup")
async def startup():
    await init_db()

# Render Swagger UI (uses runtime OpenAPI JSON so "Try it out" works on any host)
@app.get("/", include_in_schema=False)
def swagger_ui():
    return get_swagger_ui_html(openapi_url="/openapi-runtime.json", title="Simple Social Media Application API")

# Serve original OpenAPI YAML (untouched)
@app.get("/openapi.yaml", include_in_schema=False)
def serve_openapi():
    with open(OPENAPI_PATH, 'r') as f:
        yaml_content = f.read()
    return Response(content=yaml_content, media_type="application/yaml")

# Serve runtime OpenAPI JSON – adapts server URL to the actual request host
@app.get("/openapi-runtime.json", include_in_schema=False)
def serve_openapi_runtime(request: Request):
    import json, copy
    with open(OPENAPI_PATH, 'r') as f:
        spec = yaml.safe_load(f)
    spec = copy.deepcopy(spec)
    # Replace server URL with the actual runtime URL so Swagger "Try it out" works
    base_url = str(request.base_url).rstrip("/")
    spec["servers"] = [{"url": base_url}]
    return JSONResponse(content=spec)

# --- API endpoints ---

# --- Post Management ---
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime

class Post(BaseModel):
    id: str
    username: str
    content: str
    createdAt: str
    updatedAt: str
    likeCount: int
    commentCount: int

class PostCreateRequest(BaseModel):
    username: str
    content: str

class PostUpdateRequest(BaseModel):
    username: str
    content: str

class Comment(BaseModel):
    id: str
    postId: str
    username: str
    content: str
    createdAt: str
    updatedAt: str

class CommentCreateRequest(BaseModel):
    username: str
    content: str

class CommentUpdateRequest(BaseModel):
    username: str
    content: str

class LikeRequest(BaseModel):
    username: str

# --- Posts ---
@app.get("/posts", response_model=List[Post])
async def list_posts():
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT * FROM posts")
        rows = await cursor.fetchall()
        posts = [Post(**dict(zip([column[0] for column in cursor.description], row))) for row in rows]
        return posts

@app.post("/posts", response_model=Post, status_code=201)
async def create_post(req: PostCreateRequest):
    post_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    post = Post(
        id=post_id,
        username=req.username,
        content=req.content,
        createdAt=now,
        updatedAt=now,
        likeCount=0,
        commentCount=0
    )
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO posts (id, username, content, createdAt, updatedAt, likeCount, commentCount) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (post.id, post.username, post.content, post.createdAt, post.updatedAt, post.likeCount, post.commentCount)
        )
        await db.commit()
    return post

@app.get("/posts/{postId}", response_model=Post)
async def get_post(postId: str):
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT * FROM posts WHERE id = ?", (postId,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Post not found")
        return Post(**dict(zip([column[0] for column in cursor.description], row)))

@app.patch("/posts/{postId}", response_model=Post)
async def update_post(postId: str, req: PostUpdateRequest):
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT * FROM posts WHERE id = ?", (postId,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Post not found")
        now = datetime.utcnow().isoformat()
        await db.execute(
            "UPDATE posts SET username = ?, content = ?, updatedAt = ? WHERE id = ?",
            (req.username, req.content, now, postId)
        )
        await db.commit()
        cursor = await db.execute("SELECT * FROM posts WHERE id = ?", (postId,))
        row = await cursor.fetchone()
        return Post(**dict(zip([column[0] for column in cursor.description], row)))

@app.delete("/posts/{postId}", status_code=204)
async def delete_post(postId: str):
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT * FROM posts WHERE id = ?", (postId,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Post not found")
        await db.execute("DELETE FROM posts WHERE id = ?", (postId,))
        await db.commit()
    return Response(status_code=204)

# --- Comments ---
@app.get("/posts/{postId}/comments", response_model=List[Comment])
async def list_comments(postId: str):
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT * FROM comments WHERE postId = ?", (postId,))
        rows = await cursor.fetchall()
        if not rows:
            cursor_post = await db.execute("SELECT * FROM posts WHERE id = ?", (postId,))
            post_row = await cursor_post.fetchone()
            if not post_row:
                raise HTTPException(status_code=404, detail="Post not found")
        comments = [Comment(**dict(zip([column[0] for column in cursor.description], row))) for row in rows]
        return comments

@app.post("/posts/{postId}/comments", response_model=Comment, status_code=201)
async def create_comment(postId: str, req: CommentCreateRequest):
    comment_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    async with aiosqlite.connect(DB_PATH) as db:
        cursor_post = await db.execute("SELECT * FROM posts WHERE id = ?", (postId,))
        post_row = await cursor_post.fetchone()
        if not post_row:
            raise HTTPException(status_code=404, detail="Post not found")
        await db.execute(
            "INSERT INTO comments (id, postId, username, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)",
            (comment_id, postId, req.username, req.content, now, now)
        )
        await db.execute(
            "UPDATE posts SET commentCount = commentCount + 1 WHERE id = ?",
            (postId,)
        )
        await db.commit()
        cursor = await db.execute("SELECT * FROM comments WHERE id = ?", (comment_id,))
        row = await cursor.fetchone()
        return Comment(**dict(zip([column[0] for column in cursor.description], row)))

@app.get("/posts/{postId}/comments/{commentId}", response_model=Comment)
async def get_comment(postId: str, commentId: str):
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT * FROM comments WHERE id = ? AND postId = ?", (commentId, postId))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Comment not found")
        return Comment(**dict(zip([column[0] for column in cursor.description], row)))

@app.patch("/posts/{postId}/comments/{commentId}", response_model=Comment)
async def update_comment(postId: str, commentId: str, req: CommentUpdateRequest):
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT * FROM comments WHERE id = ? AND postId = ?", (commentId, postId))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Comment not found")
        now = datetime.utcnow().isoformat()
        await db.execute(
            "UPDATE comments SET username = ?, content = ?, updatedAt = ? WHERE id = ? AND postId = ?",
            (req.username, req.content, now, commentId, postId)
        )
        await db.commit()
        cursor = await db.execute("SELECT * FROM comments WHERE id = ? AND postId = ?", (commentId, postId))
        row = await cursor.fetchone()
        return Comment(**dict(zip([column[0] for column in cursor.description], row)))

@app.delete("/posts/{postId}/comments/{commentId}", status_code=204)
async def delete_comment(postId: str, commentId: str):
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT * FROM comments WHERE id = ? AND postId = ?", (commentId, postId))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Comment not found")
        await db.execute("DELETE FROM comments WHERE id = ? AND postId = ?", (commentId, postId))
        await db.execute("UPDATE posts SET commentCount = commentCount - 1 WHERE id = ?", (postId,))
        await db.commit()
    return Response(status_code=204)

# --- Likes ---
@app.post("/posts/{postId}/likes", status_code=201)
async def like_post(postId: str, req: LikeRequest):
    async with aiosqlite.connect(DB_PATH) as db:
        cursor_post = await db.execute("SELECT * FROM posts WHERE id = ?", (postId,))
        post_row = await cursor_post.fetchone()
        if not post_row:
            raise HTTPException(status_code=404, detail="Post not found")
        cursor_like = await db.execute("SELECT * FROM likes WHERE postId = ? AND username = ?", (postId, req.username))
        like_row = await cursor_like.fetchone()
        if like_row:
            raise HTTPException(status_code=400, detail="Already liked")
        await db.execute("INSERT INTO likes (postId, username) VALUES (?, ?)", (postId, req.username))
        await db.execute("UPDATE posts SET likeCount = likeCount + 1 WHERE id = ?", (postId,))
        await db.commit()
    return Response(status_code=201)

@app.delete("/posts/{postId}/likes", status_code=204)
async def unlike_post(postId: str, req: LikeRequest):
    async with aiosqlite.connect(DB_PATH) as db:
        cursor_post = await db.execute("SELECT * FROM posts WHERE id = ?", (postId,))
        post_row = await cursor_post.fetchone()
        if not post_row:
            raise HTTPException(status_code=404, detail="Post not found")
        cursor_like = await db.execute("SELECT * FROM likes WHERE postId = ? AND username = ?", (postId, req.username))
        like_row = await cursor_like.fetchone()
        if not like_row:
            raise HTTPException(status_code=404, detail="Like not found")
        await db.execute("DELETE FROM likes WHERE postId = ? AND username = ?", (postId, req.username))
        await db.execute("UPDATE posts SET likeCount = likeCount - 1 WHERE id = ?", (postId,))
        await db.commit()
    return Response(status_code=204)

# Chạy app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
