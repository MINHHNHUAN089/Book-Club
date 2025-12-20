"""
Script để cập nhật mô tả sách với nội dung dài và chi tiết hơn
Chạy: python update_book_descriptions.py
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from app.database import SessionLocal
from app.models import Book

# Mô tả chi tiết cho từng cuốn sách (dạng review dài)
BOOK_DESCRIPTIONS = {
    "Dune": """
"Dune" của Frank Herbert là một kiệt tác khoa học viễn tưởng vượt thời gian, được xuất bản lần đầu năm 1965 và vẫn giữ nguyên sức hấp dẫn cho đến ngày nay. Cuốn sách đưa người đọc đến hành tinh sa mạc Arrakis - nơi duy nhất trong vũ trụ sản xuất được "gia vị" melange, chất liệu quý giá nhất có thể kéo dài tuổi thọ và cho phép du hành không gian.

Câu chuyện xoay quanh Paul Atreides, người thừa kế của Gia tộc Atreides khi gia đình anh được hoàng đế giao quyền cai quản Arrakis. Tuy nhiên, đây là một âm mưu chính trị phức tạp nhằm tiêu diệt họ. Sau khi cha bị phản bội và giết hại, Paul và mẹ phải chạy trốn vào sa mạc, nơi họ được người Fremen - cư dân bản địa của Arrakis - cưu mang.

Herbert đã xây dựng một thế giới với chiều sâu văn hóa, chính trị và sinh thái đáng kinh ngạc. Từ hệ thống phong kiến liên hành tinh, các âm mưu của các gia tộc lớn, cho đến văn hóa sa mạc của người Fremen với những con giun cát khổng lồ - mọi chi tiết đều được chăm chút tỉ mỉ.

Cuốn sách không chỉ là một câu chuyện phiêu lưu mà còn là một bài học sâu sắc về sinh thái học, tôn giáo, và quyền lực. Herbert cảnh báo về sự phụ thuộc vào tài nguyên thiên nhiên và hậu quả của việc lạm dụng nó - một thông điệp vẫn còn nguyên giá trị trong thời đại ngày nay.

Phong cách viết của Herbert đậm chất triết học với những đoạn nội tâm sâu sắc. Người đọc sẽ được chứng kiến sự trưởng thành của Paul từ một cậu thiếu niên thành một nhà lãnh đạo, đồng thời cũng thấy được những mặt tối của định mệnh và tham vọng. Đây là cuốn sách dành cho những ai yêu thích khoa học viễn tưởng với nội dung phức tạp và ý nghĩa.
""",

    "1984": """
"1984" của George Orwell là một trong những tác phẩm văn học quan trọng nhất của thế kỷ 20, một cuốn tiểu thuyết phản địa đàng đã định nghĩa lại cách chúng ta nghĩ về quyền lực, tự do và sự thật. Xuất bản năm 1949, cuốn sách vẫn gây sốc và khiến người đọc phải suy ngẫm cho đến tận ngày nay.

Câu chuyện diễn ra tại Oceania, một siêu quốc gia toàn trị dưới sự cai trị của Đảng và Big Brother bí ẩn. Winston Smith, nhân vật chính, làm việc tại Bộ Sự Thật, nơi công việc của anh là sửa đổi lịch sử để phù hợp với đường lối hiện tại của Đảng. Trong một thế giới mà "Chiến tranh là Hòa bình, Tự do là Nô lệ, Ngu dốt là Sức mạnh", Winston bắt đầu nghi ngờ mọi thứ.

Orwell đã tạo ra những khái niệm đã trở thành một phần của ngôn ngữ hiện đại: "Big Brother", "doublethink" (nghĩ đôi), "thoughtcrime" (tội tư tưởng), và "Newspeak" (Ngôn ngữ Mới). Mỗi khái niệm đều phản ánh sâu sắc cách mà quyền lực có thể kiểm soát không chỉ hành động mà cả suy nghĩ của con người.

Mối tình giữa Winston và Julia là tia sáng nhỏ nhoi của nhân tính trong thế giới u ám này. Nhưng ngay cả tình yêu cũng không thể thoát khỏi tầm mắt của Đảng. Phần kết của cuốn sách là một trong những đoạn văn đen tối và ám ảnh nhất trong lịch sử văn học.

Đọc "1984" ngày nay, trong thời đại của camera giám sát, thu thập dữ liệu cá nhân, và thông tin sai lệch tràn lan, chúng ta không thể không rùng mình trước tầm nhìn xa của Orwell. Đây là cuốn sách bắt buộc phải đọc cho mọi người quan tâm đến tự do, sự thật, và tương lai của nhân loại.
""",

    "Pride and Prejudice": """
"Pride and Prejudice" (Kiêu hãnh và Định kiến) của Jane Austen là một trong những tiểu thuyết lãng mạn được yêu thích nhất trong lịch sử văn học Anh. Xuất bản năm 1813, tác phẩm này vẫn khiến độc giả trên khắp thế giới say mê với sự kết hợp hoàn hảo giữa tình yêu, hài hước và phê phán xã hội.

Câu chuyện theo chân Elizabeth Bennet, con gái thứ hai trong một gia đình có năm chị em gái. Khi ông Bingley giàu có và người bạn kiêu ngạo Mr. Darcy chuyển đến vùng quê, cuộc sống của gia đình Bennet bắt đầu xáo trộn. Elizabeth, với trí thông minh sắc bén và tinh thần độc lập, ban đầu ghét cay ghét đắng Darcy vì thái độ kiêu căng của anh.

Austen đã tạo ra những nhân vật sống động và đáng nhớ: từ bà Bennet lo lắng về việc gả chồng cho con gái, đến Mr. Collins xu nịnh và lố bịch, hay Lydia Bennet nông nổi và liều lĩnh. Mỗi nhân vật đều phản ánh một khía cạnh của xã hội Anh thế kỷ 19.

Điểm độc đáo của tác phẩm nằm ở cách Austen phê phán xã hội thông qua sự hài hước và châm biếm. Bà chế giễu sự giả tạo của tầng lớp thượng lưu, áp lực hôn nhân đặt lên phụ nữ, và những định kiến về địa vị xã hội. Đồng thời, bà cũng cho thấy con người có thể thay đổi và phát triển khi sẵn sàng nhìn nhận sai lầm của mình.

Mối tình giữa Elizabeth và Darcy là một trong những câu chuyện tình yêu đẹp nhất trong văn học. Cả hai đều phải vượt qua kiêu hãnh và định kiến của bản thân để nhận ra tình cảm thực sự. Cuốn sách là minh chứng cho sức mạnh của tình yêu chân thành và sự tôn trọng lẫn nhau.
""",

    "The Hobbit": """
"The Hobbit" (Người Hobbit) của J.R.R. Tolkien là cuốn sách khởi đầu cho thế giới Trung Địa huyền thoại, xuất bản năm 1937 và trở thành một trong những tác phẩm fantasy được yêu thích nhất mọi thời đại. Đây là cuốn sách đã mở đường cho "The Lord of the Rings" và định hình cả một thể loại văn học.

Bilbo Baggins là một hobbit bình thường, yêu thích cuộc sống yên ổn trong ngôi nhà dưới đồi của mình tại Bag End. Mọi thứ thay đổi khi phù thủy Gandalf và mười ba người lùn đến gõ cửa, mời anh tham gia cuộc phiêu lưu đến Núi Cô Độc để giành lại kho báu từ con rồng Smaug. Dù ban đầu từ chối, Bilbo cuối cùng vẫn lên đường, bắt đầu hành trình thay đổi cuộc đời.

Tolkien đã tạo ra một thế giới phép thuật đầy màu sắc với những sinh vật độc đáo: người lùn cứng đầu, yêu tinh xấu xa, người sói hung dữ, nhện khổng lồ, và người gác rừng có thể biến hình. Mỗi cuộc gặp gỡ đều là một thử thách, buộc Bilbo phải khám phá sức mạnh tiềm ẩn bên trong mình.

Chiếc nhẫn ma thuật mà Bilbo tìm được trong hang động của Gollum là một chi tiết tưởng như nhỏ nhưng sẽ trở thành trung tâm của câu chuyện lớn hơn nhiều. Cuộc đối thoại câu đố giữa Bilbo và Gollum là một trong những phân đoạn đáng nhớ nhất trong văn học fantasy.

Cuốn sách không chỉ là câu chuyện phiêu lưu mà còn là hành trình trưởng thành của Bilbo. Anh học được rằng dũng cảm không có nghĩa là không sợ hãi, mà là vượt qua nỗi sợ để làm điều đúng đắn. "The Hobbit" phù hợp cho mọi lứa tuổi và là cánh cửa hoàn hảo để bước vào thế giới Trung Địa.
""",

    "Sapiens": """
"Sapiens: Lược sử loài người" của Yuval Noah Harari là một cuốn sách phi hư cấu đột phá, đưa người đọc vào hành trình 70,000 năm lịch sử nhân loại. Xuất bản năm 2011, cuốn sách đã trở thành hiện tượng toàn cầu với hàng triệu bản được bán ra.

Harari đặt ra những câu hỏi lớn: Tại sao Homo Sapiens lại thống trị thế giới thay vì các loài người khác? Điều gì khiến chúng ta khác biệt? Ông lập luận rằng khả năng tin vào những thứ chỉ tồn tại trong trí tưởng tượng - như tiền tệ, quốc gia, và tôn giáo - là điều cho phép con người hợp tác với số lượng lớn và xây dựng nền văn minh.

Cuốn sách chia lịch sử nhân loại thành bốn cuộc cách mạng lớn: Cách mạng Nhận thức (70,000 năm trước), Cách mạng Nông nghiệp (12,000 năm trước), Cách mạng Khoa học (500 năm trước), và sự hội nhập toàn cầu đang diễn ra. Mỗi giai đoạn đều mang lại những thay đổi sâu sắc cho cách con người sống và tương tác.

Harari không ngại đưa ra những quan điểm gây tranh cãi. Ông cho rằng Cách mạng Nông nghiệp có thể là "lừa đảo lớn nhất trong lịch sử" vì nó khiến cuộc sống con người khó khăn hơn thay vì dễ dàng hơn. Ông cũng phân tích cách đế quốc, tôn giáo và tiền tệ đã thống nhất nhân loại.

Phong cách viết của Harari dễ tiếp cận và đầy những ví dụ thú vị. Ông kết hợp lịch sử, sinh học, kinh tế và triết học một cách liền mạch. Cuốn sách không chỉ giúp hiểu quá khứ mà còn đặt ra những câu hỏi quan trọng về tương lai: Chúng ta sẽ trở thành gì? Công nghệ sẽ thay đổi nhân loại như thế nào?
""",

    "To Kill a Mockingbird": """
"To Kill a Mockingbird" (Giết con chim nhại) của Harper Lee là một trong những tiểu thuyết Mỹ vĩ đại nhất thế kỷ 20, đoạt giải Pulitzer năm 1961. Cuốn sách đã trở thành tác phẩm kinh điển về công lý, lòng dũng cảm và sự mất đi ngây thơ.

Câu chuyện được kể qua con mắt của Scout Finch, một cô bé sáu tuổi sống ở thị trấn nhỏ Maycomb, Alabama trong những năm 1930. Cha cô, luật sư Atticus Finch, được giao bào chữa cho Tom Robinson, một người đàn ông da đen bị buộc tội hiếp dâm một phụ nữ da trắng. Trong xã hội phân biệt chủng tộc sâu sắc của miền Nam, quyết định của Atticus mang đến những hậu quả nghiêm trọng cho cả gia đình.

Harper Lee đã tạo ra những nhân vật không thể nào quên. Atticus Finch là biểu tượng của sự chính trực và lòng can đảm đạo đức, luôn dạy con mình nhìn thế giới từ góc độ của người khác. Boo Radley, người hàng xóm bí ẩn, đại diện cho nỗi sợ hãi những điều chưa biết và bài học về việc không phán xét người khác.

Cuốn sách khéo léo đan xen nhiều chủ đề: phân biệt chủng tộc, bất công xã hội, mất đi sự ngây thơ, và sự phức tạp của bản chất con người. Qua mắt Scout, chúng ta thấy cả vẻ đẹp lẫn sự xấu xa của cộng đồng nhỏ bé này.

Tiêu đề "Giết con chim nhại" ám chỉ việc làm hại những người vô tội - những người như Tom Robinson hay Boo Radley chỉ muốn sống yên bình. Thông điệp của cuốn sách về lòng trắc ẩn và đấu tranh cho công lý vẫn còn nguyên giá trị trong xã hội ngày nay.
""",

    "Brave New World": """
"Brave New World" (Thế giới mới tươi đẹp) của Aldous Huxley là một tiểu thuyết phản địa đàng xuất bản năm 1932, mô tả một tương lai nơi con người được "sản xuất" trong nhà máy và hạnh phúc được đảm bảo bằng thuốc và giải trí. Cùng với "1984", đây là một trong hai tác phẩm định hình thể loại dystopia.

Thế giới Nhà nước của Huxley không cai trị bằng sợ hãi như trong "1984", mà bằng khoái lạc. Con người được sinh ra trong ống nghiệm, được điều kiện hóa từ nhỏ để chấp nhận vai trò xã hội, và có thể uống soma - loại thuốc mang lại hạnh phúc tức thì - bất cứ khi nào cảm thấy buồn. Không có gia đình, không có tình yêu, không có nghệ thuật thực sự.

Bernard Marx và Helmholtz Watson là những công dân bất mãn với xã hội này, dù không thể nói rõ tại sao. Khi họ gặp John "Savage" - người lớn lên bên ngoài nền văn minh trong một bộ lạc - cuộc đối đầu giữa hai thế giới bắt đầu. John đại diện cho những giá trị cũ: tình yêu, đau khổ, nghệ thuật và tự do.

Huxley cảnh báo về nguy cơ của chủ nghĩa tiêu dùng, công nghệ và sự thoải mái. Ông cho thấy một xã hội có thể mất đi nhân tính không phải vì bị đàn áp mà vì được cho quá nhiều. Khi mọi ham muốn đều được thỏa mãn ngay lập tức, con người không còn động lực để sáng tạo, yêu thương hay tìm kiếm ý nghĩa.

Đọc "Brave New World" ngày nay, trong thời đại của mạng xã hội, thuốc chống trầm cảm và giải trí vô tận, chúng ta nhận ra Huxley có thể đã đoán đúng hơn Orwell về hình dáng của tương lai.
""",

    "The Great Gatsby": """
"The Great Gatsby" (Gatsby vĩ đại) của F. Scott Fitzgerald là bức chân dung đầy ám ảnh về Giấc mơ Mỹ và sự suy tàn của nó. Xuất bản năm 1925, cuốn sách đã trở thành biểu tượng của thập niên 1920 đầy phóng túng và là một trong những tiểu thuyết Mỹ vĩ đại nhất.

Câu chuyện được kể bởi Nick Carraway, một chàng trai trẻ từ miền Trung Tây chuyển đến New York để làm việc trong ngành tài chính. Anh thuê một ngôi nhà nhỏ ở Long Island, bên cạnh biệt thự nguy nga của Jay Gatsby bí ẩn - người nổi tiếng với những bữa tiệc xa hoa nhưng không ai thực sự biết về ông ta.

Gatsby, với sự giàu có đáng ngờ và những bữa tiệc lộng lẫy, thực ra chỉ có một mục đích: gặp lại Daisy Buchanan, tình yêu thời trẻ mà ông đã mất vì nghèo khó. Daisy giờ đã kết hôn với Tom Buchanan giàu có nhưng thô lỗ. Gatsby tin rằng với đủ tiền, ông có thể quay ngược thời gian và lấy lại những gì đã mất.

Fitzgerald viết với ngòi bút thi vị và sắc bén về sự trống rỗng ẩn sau vẻ hào nhoáng. Ánh đèn xanh ở cuối bến tàu của Daisy, đôi mắt của Tiến sĩ T.J. Eckleburg trên biển quảng cáo, thung lũng tro tàn giữa hai thế giới giàu nghèo - mỗi hình ảnh đều mang ý nghĩa biểu tượng sâu sắc.

Cuốn sách là lời cảnh tỉnh về việc chạy theo giấc mơ không thể đạt được và sự tha hóa của vật chất. Gatsby, với tất cả sự lãng mạn và bi kịch của mình, đại diện cho niềm tin rằng tiền có thể mua được hạnh phúc - một niềm tin mà Fitzgerald chứng minh là sai lầm.
""",

    "Đất Rừng Phương Nam": """
"Đất Rừng Phương Nam" của nhà văn Đoàn Giỏi là một trong những tác phẩm văn học thiếu nhi Việt Nam được yêu thích nhất, xuất bản năm 1957. Cuốn sách đưa người đọc vào một hành trình khám phá vùng đất Nam Bộ hoang sơ nhưng đầy sức sống, nơi thiên nhiên và con người hòa quyện trong những câu chuyện giản dị mà sâu sắc.

Câu chuyện theo chân An, một cậu bé mồ côi cha từ nhỏ, phải rời quê hương để đi tìm cha dượng trong vùng đất rừng U Minh bí ẩn. Trên hành trình, An gặp gỡ nhiều nhân vật đáng nhớ: ông Hai già nua nhưng hiền hậu, Cò - người bạn đồng hành trung thành, và vô số những con người chân chất của vùng sông nước.

Đoàn Giỏi đã vẽ nên bức tranh sinh động về cuộc sống ở miền Tây Nam Bộ những năm đầu thế kỷ 20. Từ những cánh rừng tràm bạt ngàn, những con kênh rạch chằng chịt, đến những đêm trăng sáng trên sông - mỗi trang sách đều thấm đẫm hương vị của vùng đất này.

Cuốn sách không chỉ là câu chuyện phiêu lưu mà còn là bài ca về tình người trong hoàn cảnh khó khăn. Người dân nơi đây tuy nghèo khó nhưng luôn sẵn sàng giúp đỡ lẫn nhau, sẵn sàng chia sẻ miếng cơm manh áo với người lạ. Tinh thần đoàn kết và yêu thương là sợi chỉ đỏ xuyên suốt tác phẩm.

Đặc biệt, "Đất Rừng Phương Nam" còn là một cuốn bách khoa về thiên nhiên Nam Bộ với những mô tả chi tiết về cây cỏ, chim muông, và cách người dân săn bắt, đánh cá. Đây là tác phẩm không thể thiếu trong tủ sách của mọi gia đình Việt Nam, phù hợp cho cả trẻ em lẫn người lớn.
""",

    "Dế Mèn Phiêu Lưu Ký": """
"Dế Mèn Phiêu Lưu Ký" của nhà văn Tô Hoài là một trong những tác phẩm văn học thiếu nhi kinh điển nhất của Việt Nam, xuất bản lần đầu năm 1941. Cuốn sách đã trở thành một phần tuổi thơ của nhiều thế hệ người Việt và được dịch ra nhiều thứ tiếng trên thế giới.

Dế Mèn là một chú dế cường tráng, kiêu ngạo và thích phô trương sức mạnh. Ngay từ những trang đầu tiên, chúng ta thấy Dế Mèn khoe khoang về đôi càng khỏe, về bộ râu dài, và coi thường những sinh vật nhỏ bé xung quanh. Nhưng bi kịch đến khi sự kiêu ngạo này gây ra cái chết của Dế Choắt, người bạn yếu đuối nhưng hiền lành.

Sự ân hận về cái chết của Dế Choắt đã thay đổi Dế Mèn. Chú quyết định rời khỏi vùng đất quen thuộc để bước vào cuộc phiêu lưu, tìm kiếm ý nghĩa cuộc sống. Trên đường đi, Dế Mèn gặp Dế Trũi - người bạn trung thành sẽ đồng hành cùng chú trong suốt hành trình.

Tô Hoài đã tạo ra một thế giới côn trùng sinh động với những cuộc phiêu lưu hấp dẫn: từ cuộc chiến với bọ ngựa hung ác, cuộc gặp gỡ với Xiến Tóc tham lam, đến những ngày tháng ở nhà cụ Châu Chấu già nua. Mỗi cuộc gặp gỡ đều mang đến bài học quý giá về cuộc sống.

Cuốn sách không chỉ là câu chuyện phiêu lưu mà còn là hành trình trưởng thành. Dế Mèn học được rằng sức mạnh thực sự không nằm ở đôi càng khỏe mà ở tấm lòng rộng lượng, sự khiêm tốn và tinh thần đoàn kết. Đây là bài học vượt thời gian cho mọi độc giả, dù ở lứa tuổi nào.
""",

    "Số Đỏ": """
"Số Đỏ" của Vũ Trọng Phụng là một trong những tiểu thuyết châm biếm sắc sảo nhất trong văn học Việt Nam, xuất bản năm 1936. Tác phẩm là bức tranh biếm họa về xã hội Việt Nam thời thuộc địa với những nhân vật đáng cười nhưng cũng đáng thương.

Xuân Tóc Đỏ là một anh chàng ma cà bông, sống bằng nghề nhặt banh tennis ở sân quần vợt. Nhờ may mắn và sự lanh lợi, Xuân từ một kẻ vô danh trở thành "anh hùng cứu quốc", được tầng lớp thượng lưu tôn sùng. Cuộc đời Xuân là chuỗi những tình cờ may mắn, mỗi lần vấp ngã đều biến thành bước thăng tiến.

Vũ Trọng Phụng đã tạo ra một thế giới nhân vật đáng nhớ: bà Phó Đoan với những ý tưởng "Âu hóa" lố bịch, ông Văn Minh với những bài diễn thuyết rỗng tuếch, cô Tuyết với vẻ "tân thời" nửa mùa. Mỗi nhân vật đều đại diện cho một khía cạnh của xã hội đang chạy theo "văn minh" một cách mù quáng.

Phong cách châm biếm của Vũ Trọng Phụng vừa hài hước vừa cay đắng. Ông chế giễu không thương tiếc sự giả dối của xã hội, từ phong trào thể thao "cải cách" đến các cuộc thi hoa hậu, từ những đám ma hoành tráng đến những cuộc hôn nhân vì tiền. Tiếng cười trong "Số Đỏ" luôn đi kèm với nỗi buồn sâu sắc.

Cuốn sách vẫn còn nguyên giá trị sau gần một thế kỷ vì những vấn đề nó chỉ ra - sự sùng bái hình thức, chạy theo bề ngoài, bỏ quên giá trị thực - vẫn tồn tại trong xã hội ngày nay. "Số Đỏ" là tác phẩm bắt buộc phải đọc để hiểu văn học Việt Nam và con người Việt Nam.
""",

    "Nhà Giả Kim": """
"Nhà Giả Kim" (The Alchemist) của Paulo Coelho là một trong những cuốn sách bán chạy nhất mọi thời đại, được dịch ra hơn 80 ngôn ngữ. Xuất bản năm 1988, cuốn sách đã truyền cảm hứng cho hàng triệu người trên khắp thế giới với thông điệp về việc theo đuổi ước mơ.

Santiago là một cậu bé chăn cừu Tây Ban Nha, có một giấc mơ lặp đi lặp lại về kho báu chôn giấu dưới chân Kim Tự Tháp Ai Cập. Sau khi gặp một ông già bí ẩn tự xưng là vua Salem, Santiago quyết định bán đàn cừu và bắt đầu hành trình tìm kiếm "Huyền thoại cá nhân" của mình - mục đích sống mà mỗi người đều có.

Trên đường đi, Santiago gặp nhiều người thầy: một thương nhân pha lê dạy anh về sự kiên nhẫn, một người Anh nghiên cứu thuật giả kim dạy anh về kiến thức sách vở, và nhà giả kim huyền thoại dạy anh về "Linh hồn thế giới" và ngôn ngữ của vũ trụ. Fatima, cô gái sa mạc, dạy anh về tình yêu và sự đợi chờ.

Coelho viết bằng ngôn ngữ giản dị nhưng đầy chất thơ. Những câu nói như "Khi bạn thực sự muốn một điều gì đó, cả vũ trụ sẽ hợp lực giúp bạn đạt được nó" đã trở thành châm ngôn sống của nhiều người. Cuốn sách nhắc nhở chúng ta rằng hành trình quan trọng không kém đích đến.

"Nhà Giả Kim" không phải cuốn sách dành cho tất cả mọi người - có người thấy nó quá đơn giản hoặc mang tính giáo huấn. Nhưng với những ai đang tìm kiếm phương hướng, đang phân vân giữa an toàn và mạo hiểm, cuốn sách có thể là nguồn cảm hứng để dũng cảm theo đuổi ước mơ.
""",

    "Đắc Nhân Tâm": """
"Đắc Nhân Tâm" (How to Win Friends and Influence People) của Dale Carnegie là cuốn sách self-help kinh điển nhất mọi thời đại, xuất bản năm 1936. Với hơn 30 triệu bản được bán ra, đây là cuốn sách đã thay đổi cuộc sống của vô số người trên khắp thế giới.

Carnegie không viết lý thuyết suông mà đưa ra những nguyên tắc thực tế, đơn giản nhưng hiệu quả để cải thiện các mối quan hệ. Ông chia cuốn sách thành bốn phần: Kỹ thuật cơ bản trong việc ứng xử với người khác, Sáu cách để người khác quý mến bạn, Cách thuyết phục người khác theo cách nghĩ của bạn, và Cách thay đổi người khác mà không gây phật lòng.

Những nguyên tắc như "Đừng bao giờ chỉ trích, lên án hay phàn nàn", "Chân thành tán thưởng người khác", "Gợi lên trong lòng người khác sự ham muốn" nghe có vẻ đơn giản nhưng rất ít người thực sự làm được. Carnegie minh họa bằng hàng trăm câu chuyện có thật từ những người nổi tiếng và bình thường.

Cuốn sách dạy chúng ta rằng thành công không chỉ phụ thuộc vào kiến thức hay kỹ năng chuyên môn mà phần lớn đến từ khả năng giao tiếp và xây dựng mối quan hệ. Một người có thể rất giỏi nhưng nếu không biết cách làm việc với người khác, thành công sẽ hạn chế.

Dù đã gần một thế kỷ trôi qua, những nguyên tắc trong "Đắc Nhân Tâm" vẫn còn nguyên giá trị. Trong thời đại mạng xã hội, khi sự kết nối giữa người với người trở nên phức tạp hơn, những bài học về sự chân thành, lắng nghe và tôn trọng càng trở nên quan trọng.
""",

    "Harry Potter and the Philosopher's Stone": """
"Harry Potter and the Philosopher's Stone" (Harry Potter và Hòn đá Phù thủy) của J.K. Rowling là cuốn sách mở đầu cho series fantasy bán chạy nhất lịch sử, xuất bản năm 1997. Câu chuyện về cậu bé phù thủy đã làm say mê hàng trăm triệu độc giả trên toàn thế giới và tạo ra một hiện tượng văn hóa.

Harry Potter sống một cuộc sống khổ sở dưới gầm cầu thang nhà dì dượng Dursley, bị đối xử như kẻ hầu. Vào sinh nhật lần thứ 11, cuộc đời Harry hoàn toàn thay đổi khi Hagrid, người gác rừng khổng lồ hiền lành, đến thông báo rằng Harry là một phù thủy và được nhận vào trường Hogwarts.

Rowling đã tạo ra một thế giới phép thuật đầy màu sắc và chi tiết đáng kinh ngạc: từ con phố Diagon Alley với những cửa hàng bán đũa phép và chổi bay, đến lâu đài Hogwarts với những cầu thang biết di chuyển và bức tranh biết nói. Mỗi trang sách đều mang đến những bất ngờ thú vị.

Tình bạn giữa Harry, Ron Weasley và Hermione Granger là trái tim của câu chuyện. Ba đứa trẻ đến từ hoàn cảnh khác nhau - Harry mồ côi, Ron từ gia đình đông con nghèo khó, Hermione xuất thân Muggle - nhưng tìm thấy ở nhau sự đồng cảm và hỗ trợ. Cùng nhau, họ đối mặt với bí ẩn về Hòn đá Phù thủy và sự trở lại của Voldemort.

Cuốn sách không chỉ là câu chuyện phiêu lưu mà còn chứa đựng những thông điệp sâu sắc về tình bạn, lòng dũng cảm, và sự lựa chọn giữa đúng và dễ. Đây là cuốn sách phù hợp cho mọi lứa tuổi, là cánh cửa hoàn hảo để bước vào thế giới phép thuật của Harry Potter.
""",

    "The Lord of the Rings": """
"The Lord of the Rings" (Chúa tể của những chiếc nhẫn) của J.R.R. Tolkien là một trong những bộ tiểu thuyết fantasy vĩ đại nhất mọi thời đại. Xuất bản từ 1954-1955, tác phẩm đã định hình cả một thể loại văn học và truyền cảm hứng cho vô số tác giả sau này.

Câu chuyện tiếp nối "The Hobbit" khi Frodo Baggins thừa kế chiếc nhẫn quyền lực từ Bilbo. Gandalf phát hiện đây chính là Chiếc Nhẫn Chủ của Chúa tể Bóng tối Sauron - thứ duy nhất có thể giúp hắn thống trị Trung Địa. Cách duy nhất để ngăn chặn Sauron là ném chiếc nhẫn vào ngọn lửa Núi Doom, nơi nó được tạo ra.

Tolkien đã xây dựng một thế giới với chiều sâu lịch sử, ngôn ngữ và văn hóa chưa từng có trong văn học fantasy. Từ tiếng Elvish uyển chuyển đến tiếng Dwarvish khắc khổ, từ vương quốc rừng của người Elf đến những hang động vàng son của người Lùn - mọi chi tiết đều được chăm chút tỉ mỉ như một thế giới thực sự.

Hội Nhẫn với chín thành viên từ các chủng tộc khác nhau đại diện cho sự đoàn kết trong đa dạng: hobbit khiêm tốn, người lùn cứng đầu, người Elf cao quý, phù thủy quyền năng, và con người với cả sức mạnh lẫn điểm yếu. Mỗi nhân vật đều có hành trình phát triển riêng, từ Aragorn tìm lại vương quyền đến Sam thể hiện lòng trung thành vô điều kiện.

Cuốn sách là bài ca về hy vọng trong bóng tối, về sức mạnh của những kẻ nhỏ bé, và về việc làm điều đúng đắn dù phải trả giá đắt. Frodo không phải anh hùng theo nghĩa truyền thống - anh không có sức mạnh hay phép thuật - nhưng sự kiên định và hi sinh của anh đã cứu cả thế giới.
""",

    "Atomic Habits": """
"Atomic Habits" (Thói quen nguyên tử) của James Clear là cuốn sách self-help xuất sắc nhất về việc xây dựng thói quen, xuất bản năm 2018. Thay vì những lời khuyên chung chung, Clear cung cấp một hệ thống khoa học và thực tế để thay đổi hành vi lâu dài.

Ý tưởng cốt lõi của cuốn sách là "thói quen nguyên tử" - những thay đổi nhỏ 1% mỗi ngày có thể tích lũy thành kết quả đáng kinh ngạc theo thời gian. Clear lập luận rằng chúng ta thường đánh giá thấp sức mạnh của những hành động nhỏ lặp đi lặp lại, trong khi đây chính là nền tảng của mọi thành công.

Clear đưa ra bốn quy luật xây dựng thói quen tốt: Làm cho nó rõ ràng (tín hiệu), Làm cho nó hấp dẫn (thèm muốn), Làm cho nó dễ dàng (phản hồi), và Làm cho nó thỏa mãn (phần thưởng). Để loại bỏ thói quen xấu, chỉ cần đảo ngược: làm cho nó không rõ ràng, không hấp dẫn, khó khăn và không thỏa mãn.

Điểm độc đáo của Clear là cách ông kết hợp khoa học thần kinh, tâm lý học hành vi và kinh nghiệm thực tế. Mỗi khái niệm đều được minh họa bằng những câu chuyện cụ thể - từ vận động viên Olympic đến doanh nhân thành công. Cuốn sách không chỉ nói "cần làm gì" mà còn giải thích "tại sao" và "làm thế nào".

Ý tưởng về "thay đổi identity" (bản dạng) là điểm nhấn quan trọng nhất. Clear cho rằng mục tiêu không phải là "đọc sách" mà là "trở thành người đọc sách". Khi bạn thay đổi cách nhìn nhận bản thân, thói quen sẽ tự nhiên theo sau. Đây là cuốn sách bắt buộc phải đọc cho bất kỳ ai muốn cải thiện bản thân.
""",

    "Tư Duy Nhanh và Chậm": """
"Thinking, Fast and Slow" (Tư duy nhanh và chậm) của Daniel Kahneman là một trong những cuốn sách tâm lý học quan trọng nhất thế kỷ 21. Kahneman, người đoạt giải Nobel Kinh tế 2002, tổng hợp hàng thập kỷ nghiên cứu về cách con người suy nghĩ và ra quyết định.

Kahneman chia bộ não thành hai hệ thống: Hệ thống 1 (nhanh, trực giác, tự động) và Hệ thống 2 (chậm, logic, có chủ đích). Hầu hết thời gian, chúng ta sử dụng Hệ thống 1 vì nó tiết kiệm năng lượng. Nhưng Hệ thống 1 cũng dễ mắc sai lầm vì dựa vào các quy tắc heuristic và thiên kiến.

Cuốn sách đi sâu vào hàng loạt thiên kiến nhận thức: thiên kiến xác nhận (chỉ tìm kiếm thông tin ủng hộ quan điểm có sẵn), hiệu ứng neo (bị ảnh hưởng bởi con số đầu tiên nghe được), ảo tưởng về sự hiểu biết (tin rằng quá khứ có thể giải thích được dễ dàng), và nhiều hơn nữa.

Kahneman cũng giới thiệu "Lý thuyết triển vọng" nổi tiếng, giải thích tại sao con người sợ mất mát hơn ham muốn lợi ích (mất 100 đồng đau hơn được 100 đồng vui). Điều này có ứng dụng rộng rãi trong kinh tế, marketing và ra quyết định cá nhân.

Đây không phải cuốn sách dễ đọc - nó đòi hỏi sự tập trung và suy ngẫm. Nhưng những hiểu biết mà nó mang lại vô cùng quý giá. Sau khi đọc, bạn sẽ nhận ra những thiên kiến trong chính suy nghĩ của mình và có công cụ để đưa ra quyết định tốt hơn.
""",

    "A Brief History of Time": """
"A Brief History of Time" (Lược sử thời gian) của Stephen Hawking là cuốn sách khoa học phổ thông bán chạy nhất mọi thời đại, xuất bản năm 1988. Hawking đã làm được điều tưởng như bất khả thi: giải thích những khái niệm phức tạp nhất của vật lý học cho độc giả bình thường.

Cuốn sách đưa người đọc vào hành trình khám phá những câu hỏi lớn nhất về vũ trụ: Vũ trụ bắt đầu như thế nào? Thời gian là gì? Lỗ đen hoạt động ra sao? Liệu có thể du hành thời gian? Hawking trình bày từ thuyết tương đối của Einstein đến cơ học lượng tử với ngôn ngữ dễ hiểu và những ví dụ sinh động.

Hawking bắt đầu với lịch sử những ý tưởng về vũ trụ, từ Aristotle đến Newton, từ thuyết Big Bang đến bức xạ nền vũ trụ. Ông giải thích làm thế nào các nhà khoa học biết được vũ trụ đang giãn nở và tuổi của nó khoảng 13.8 tỷ năm.

Phần về lỗ đen là hấp dẫn nhất. Hawking mô tả những vùng không-thời gian nơi lực hấp dẫn mạnh đến mức ánh sáng không thể thoát ra. Ông cũng giới thiệu khám phá nổi tiếng của mình: "bức xạ Hawking" cho thấy lỗ đen thực ra không hoàn toàn "đen" mà phát ra năng lượng và có thể "bay hơi" theo thời gian.

Dù một số thông tin đã được cập nhật kể từ khi xuất bản, cuốn sách vẫn là cánh cửa tuyệt vời để bước vào thế giới vũ trụ học. Hawking, dù mắc bệnh ALS, đã truyền cảm hứng cho hàng triệu người với tinh thần tò mò không ngừng và khao khát hiểu biết vũ trụ.
""",
}

def update_descriptions():
    """Update book descriptions with longer content"""
    db = SessionLocal()
    try:
        print("Bắt đầu cập nhật mô tả sách...\n")
        
        updated_count = 0
        
        for title, description in BOOK_DESCRIPTIONS.items():
            # Tìm sách theo tiêu đề
            book = db.query(Book).filter(Book.title == title).first()
            
            if book:
                book.description = description.strip()
                updated_count += 1
                print(f"  [OK] Đã cập nhật: {title}")
            else:
                print(f"  [SKIP] Không tìm thấy sách: {title}")
        
        db.commit()
        print(f"\n✅ Hoàn thành! Đã cập nhật {updated_count} cuốn sách.")
        
    except Exception as e:
        print(f"❌ Lỗi: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    update_descriptions()

