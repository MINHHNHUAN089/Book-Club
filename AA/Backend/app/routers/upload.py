from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import JSONResponse, FileResponse, Response
from app.auth import get_current_active_user
from app.models import User
import os
import shutil
from pathlib import Path
from typing import Optional

router = APIRouter(prefix="/api/upload", tags=["upload"])

# Tạo thư mục static/images/books nếu chưa có
UPLOAD_DIR = Path(__file__).parent.parent.parent / "static" / "images" / "books"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Tạo thư mục static/files/books nếu chưa có
FILES_DIR = Path(__file__).parent.parent.parent / "static" / "files" / "books"
FILES_DIR.mkdir(parents=True, exist_ok=True)

# Base URL cho ảnh và file
BASE_URL = "http://localhost:8000"


@router.post("/book-cover")
async def upload_book_cover(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload ảnh bìa sách
    
    - **file**: File ảnh (jpg, png, webp)
    - Trả về URL của ảnh đã upload
    """
    # Kiểm tra định dạng file
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Định dạng file không hợp lệ. Chỉ chấp nhận: {', '.join(allowed_extensions)}"
        )
    
    # Kiểm tra kích thước file (tối đa 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(
            status_code=400,
            detail="File quá lớn. Kích thước tối đa: 5MB"
        )
    
    # Tạo tên file unique
    import uuid
    file_id = str(uuid.uuid4())
    file_name = f"{file_id}{file_ext}"
    file_path = UPLOAD_DIR / file_name
    
    # Lưu file
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
        
        # Tạo URL
        image_url = f"{BASE_URL}/static/images/books/{file_name}"
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Upload thành công",
                "url": image_url,
                "filename": file_name
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi lưu file: {str(e)}"
        )


@router.post("/book-file")
async def upload_book_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload file sách (PDF, EPUB, etc.)
    
    - **file**: File sách (pdf, epub, mobi, txt)
    - Trả về URL của file đã upload
    """
    # Kiểm tra định dạng file
    allowed_extensions = {".pdf", ".epub", ".mobi", ".txt", ".doc", ".docx"}
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Định dạng file không hợp lệ. Chỉ chấp nhận: {', '.join(allowed_extensions)}"
        )
    
    # Kiểm tra kích thước file (tối đa 50MB)
    contents = await file.read()
    if len(contents) > 50 * 1024 * 1024:  # 50MB
        raise HTTPException(
            status_code=400,
            detail="File quá lớn. Kích thước tối đa: 50MB"
        )
    
    # Tạo tên file unique
    import uuid
    file_id = str(uuid.uuid4())
    file_name = f"{file_id}{file_ext}"
    file_path = FILES_DIR / file_name
    
    # Lưu file
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
        
        # Tạo URL
        file_url = f"{BASE_URL}/static/files/books/{file_name}"
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Upload file thành công",
                "url": file_url,
                "filename": file_name
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi lưu file: {str(e)}"
        )


@router.get("/book-covers")
async def list_book_covers():
    """
    Liệt kê tất cả ảnh bìa sách đã upload
    """
    try:
        images = []
        for file_path in UPLOAD_DIR.glob("*"):
            if file_path.is_file() and file_path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
                images.append({
                    "filename": file_path.name,
                    "url": f"{BASE_URL}/static/images/books/{file_path.name}",
                    "size": file_path.stat().st_size
                })
        
        return {
            "total": len(images),
            "images": images
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi đọc danh sách ảnh: {str(e)}"
        )


@router.get("/pdf/{filename}")
async def get_pdf_file(filename: str):
    """
    Serve PDF file với CORS headers cho PDF.js
    """
    file_path = FILES_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File không tồn tại")
    
    if not file_path.suffix.lower() == ".pdf":
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ file PDF")
    
    # Read file and return with CORS headers
    with open(file_path, "rb") as f:
        content = f.read()
    
    return Response(
        content=content,
        media_type="application/pdf",
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Content-Disposition": f"inline; filename={filename}",
            "Cache-Control": "public, max-age=86400"
        }
    )

