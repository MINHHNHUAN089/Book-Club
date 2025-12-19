import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer style={{
      backgroundColor: "#141926",
      color: "#e2e8f0",
      padding: "60px 24px 24px",
      marginTop: "80px"
    }}>
      {/* Top Section - 4 Columns */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "40px",
        marginBottom: "40px",
        maxWidth: "1200px",
        margin: "0 auto 40px"
      }}>
        {/* Column 1: Mê Tải Sách */}
        <div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              background: "linear-gradient(135deg, #13a4ec 0%, #3b82f6 100%)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px"
            }}>
              📘
            </div>
            <h3 style={{
              color: "#e2e8f0",
              fontSize: "20px",
              fontWeight: 700,
              margin: 0
            }}>
              Mê Tải Sách
            </h3>
          </div>
          <p style={{
            color: "#94a3b8",
            fontSize: "14px",
            lineHeight: "1.6",
            margin: 0
          }}>
            Mê Tải Sách là thư viện sách online cho phép người dùng tải sách miễn phí, tải sách hay, download sách miễn phí, download sách hay, đọc sách online. Chúng tôi có rất nhiều sách thuộc nhiều thể loại với những định dạng Ebook phổ biến cho điện thoại và máy tính. Bạn đọc có thể xem online hoặc download về máy để tiện theo dõi.
          </p>
        </div>

        {/* Column 2: Về chúng tôi */}
        <div>
          <h3 style={{
            color: "#e2e8f0",
            fontSize: "18px",
            fontWeight: 700,
            marginBottom: "20px"
          }}>
            Về chúng tôi
          </h3>
          <ul style={{
            listStyle: "none",
            padding: 0,
            margin: 0
          }}>
            <li style={{ marginBottom: "12px" }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // Navigate to about page if exists
                }}
                style={{
                  color: "#94a3b8",
                  fontSize: "14px",
                  textDecoration: "none",
                  transition: "color 0.2s",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#13a4ec"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
              >
                Giới thiệu
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Hỗ trợ */}
        <div>
          <h3 style={{
            color: "#e2e8f0",
            fontSize: "18px",
            fontWeight: 700,
            marginBottom: "20px"
          }}>
            Hỗ trợ
          </h3>
          <ul style={{
            listStyle: "none",
            padding: 0,
            margin: 0
          }}>
            {[
              "Câu hỏi thường gặp",
              "Bản quyền nội dung",
              "Quy định sử dụng",
              "Chính sách bảo mật"
            ].map((item, index) => (
              <li key={index} style={{ marginBottom: "12px" }}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    // Navigate to support pages if exists
                  }}
                  style={{
                    color: "#94a3b8",
                    fontSize: "14px",
                    textDecoration: "none",
                    transition: "color 0.2s",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#13a4ec"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Thông báo */}
        <div>
          <h3 style={{
            color: "#e2e8f0",
            fontSize: "18px",
            fontWeight: 700,
            marginBottom: "20px"
          }}>
            Thông báo
          </h3>
          <p style={{
            color: "#94a3b8",
            fontSize: "14px",
            lineHeight: "1.6",
            marginBottom: "16px"
          }}>
            Mọi thông tin và hình ảnh trên website đều được sưu tầm trên Internet. Chúng tôi không sở hữu hay chịu trách nhiệm bất kỳ thông tin nào trên web này. Nếu làm ảnh hưởng đến cá nhân hay tổ chức nào, khi được yêu cầu, chúng tôi sẽ xem xét và gỡ bỏ ngay lập tức.
          </p>
          <div style={{
            fontSize: "14px",
            color: "#94a3b8"
          }}>
            Email phản hồi:{" "}
            <a
              href="mailto:Metaisach@gmail.com"
              style={{
                color: "#22c55e",
                textDecoration: "none",
                fontWeight: 600
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
            >
              Metaisach@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Section - Copyright */}
      <div style={{
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        paddingTop: "24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {/* Copyright - Centered */}
        <div style={{
          color: "#94a3b8",
          fontSize: "14px",
          textAlign: "center"
        }}>
          Copyright © 2024. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
