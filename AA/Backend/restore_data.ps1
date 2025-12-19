# Script để khôi phục dữ liệu sách và câu lạc bộ
# Chạy: .\restore_data.ps1

Write-Host "🔄 Đang khôi phục dữ liệu..." -ForegroundColor Green
Write-Host ""

# Kích hoạt virtual environment
Write-Host "📦 Kích hoạt virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

Write-Host ""
Write-Host "📚 Bước 1: Thêm 40 cuốn sách vào database..." -ForegroundColor Cyan
python insert_40_books.py

Write-Host ""
Write-Host "👥 Bước 2: Thêm groups và challenges mẫu..." -ForegroundColor Cyan
python add_groups_challenges.py

Write-Host ""
Write-Host "✅ Hoàn tất! Dữ liệu đã được khôi phục." -ForegroundColor Green
Write-Host ""
Write-Host "💡 Lưu ý: Nếu bạn muốn thêm sách vào danh sách của user, chạy:" -ForegroundColor Yellow
Write-Host "   python add_all_books_to_users.py" -ForegroundColor Yellow
