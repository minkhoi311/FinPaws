$(document).ready(function () {
    // click chuyển mục 
    var btns = document.querySelectorAll(".tab");
    var btn_contents = document.querySelectorAll(".tab-content");
    btns.forEach((btn, index) => {
        btn.onclick = function (event) {
            event.preventDefault();
            btn_contents.forEach(content => {
                content.classList.remove('show');
            });
            btns.forEach(tab => {
                tab.classList.remove('active');
            });
            this.classList.add('active');
            btn_contents[index].classList.add('show');
        };
    });

    // click submenu
    $(".circle .fa-plus").click(function () {
        $(".submenu").toggle();
    });

    // Khi nhấn Lưu trong modal
    $('#saveExpense').on('click', function() {
        var transactionType = $('#transactionType').val(); // Loại giao dịch
        var amount = parseFloat($('#amount').val()); // Số tiền
        var purpose = $('#purpose').val(); // Mục đích
        var date = $('#date').val(); // Ngày giao dịch

        var isEdit = $('#saveExpense').data('isEdit'); // Kiểm tra xem có phải đang chỉnh sửa không
        var editTarget = $('#saveExpense').data('editTarget'); // Phần tử đang chỉnh sửa

        if (isEdit) {
            // Nếu là chỉnh sửa, chỉ cập nhật số tiền
            $(editTarget).find('.expense-amount span').text(`${transactionType === 'expense' ? '-' : '+'}${amount.toLocaleString()} VND`);
            
            // Xóa trạng thái chỉnh sửa
            $('#saveExpense').data('isEdit', false);
            $('#saveExpense').data('editTarget', null);
        } else {
            // Thêm giao dịch mới
            var totalExpense = parseFloat($('#total-expense').text().replace(/,/g, ''));
            var totalIncome = parseFloat($('#total-income').text().replace(/,/g, ''));

            // Cập nhật tổng chi tiêu hoặc thu nhập
            if (transactionType === 'expense') {
                totalExpense += amount;
                $('#total-expense').text(totalExpense.toLocaleString());
            } else if (transactionType === 'income') {
                totalIncome += amount;
                $('#total-income').text(totalIncome.toLocaleString());
            }

            // Tạo giao dịch mới với thuộc tính `data-date` để lưu trữ ngày giao dịch
            var newTransaction = `
            <div class="container mt-2 expense d-flex align-items-center justify-content-between" data-date="${date}">
                <div class="expense-category d-flex align-items-center">
                    <div class="category-icon-container">
                        <i class="fas ${transactionType === 'expense' ? 'fa-utensils' : 'fa-money-bill-wave'}"></i>
                    </div>
                    <div class="category-text-container ms-2">
                        <span>${purpose}</span>
                    </div>
                </div>
                <div class="expense-amount">
                    <span>${transactionType === 'expense' ? `-${amount.toLocaleString()} VND` : `+${amount.toLocaleString()} VND`}</span>
                </div>
                <div class="action-icons d-flex">
                    <div class="edit-icon me-2">
                        <a href="#" class="edit-expense"><i class="fas fa-edit"></i></a>
                    </div>
                    <div class="delete-icon">
                        <a href="#" class="delete-expense"><i class="fas fa-trash-alt"></i></a>
                    </div>
                </div>
            </div>`;

            // Thêm giao dịch vào danh sách
            $('.middle-box-right').append(newTransaction);

            // Kiểm tra xem ngày giao dịch đã tồn tại chưa
            var existingDate = $('.dates .date').filter(function() {
                return $(this).find('span').text() === date;
            });

            if (existingDate.length === 0) {
                // Nếu ngày chưa tồn tại, thêm vào Left Middle Box
                var newDate = `
                <div class="date p-3 mb-4 rounded-3" data-date="${date}">
                    <span>${date}</span>
                </div>`;
                $('.dates').append(newDate);
            }
        }
        // Đóng modal sau khi lưu
        $('#expenseModal').modal('hide');
    });

    // Các tùy chọn cho mục đích giao dịch
    var expenseOptions = [
        { value: "Ăn uống", text: "Ăn uống" },
        { value: "Mua sắm", text: "Mua sắm" },
        { value: "Học khóa học", text: "Học khóa học" },
        { value: "Giải trí", text: "Giải trí" }
    ];

    var incomeOptions = [
        { value: "Lương", text: "Lương" },
        { value: "Part-time job", text: "Part-time job" },
        { value: "Tiền thưởng", text: "Tiền thưởng" },
        { value: "Đầu tư", text: "Đầu tư" }
    ];

    // Hàm để cập nhật các mục đích giao dịch
    function updatePurposeOptions(transactionType) {
        var purposeSelect = $('#purpose');
        purposeSelect.empty(); // Xóa tất cả các tùy chọn hiện tại

        var options = transactionType === 'expense' ? expenseOptions : incomeOptions;

        options.forEach(function(option) {
            purposeSelect.append(new Option(option.text, option.value));
        });
    }

    // Khi thay đổi loại giao dịch, cập nhật danh sách mục đích
    $('#transactionType').on('change', function() {
        var transactionType = $(this).val();
        updatePurposeOptions(transactionType);
    });

    // Thiết lập mặc định ban đầu khi trang tải
    updatePurposeOptions($('#transactionType').val());

    // Xóa giao dịch khi nhấn vào delete-icon
    $(document).on('click', '.delete-expense', function(e) {
        e.preventDefault();
        var transaction = $(this).closest('.expense'); // Lấy giao dịch hiện tại
        
        // Lấy ngày giao dịch từ thuộc tính `data-date`
        var transactionDate = transaction.data('date');
        
        // Xóa giao dịch
        transaction.remove();
        
        // Kiểm tra xem còn giao dịch nào vào cùng ngày không
        var hasSameDateTransaction = false;
        $('.middle-box-right .expense').each(function() {
            var currentDate = $(this).data('date');
            if (currentDate === transactionDate) {
                hasSameDateTransaction = true;
                return false; // Ngừng vòng lặp nếu tìm thấy
            }
        });
        
        // Nếu không còn giao dịch nào cùng ngày, xóa ngày khỏi Left Middle Box
        if (!hasSameDateTransaction) {
            $('.dates .date').each(function() {
                if ($(this).data('date') === transactionDate) {
                    $(this).remove(); // Xóa ngày tương ứng
                }
            });
        }
    });

    // Chỉnh sửa giao dịch khi nhấn vào edit-icon (chỉ thay đổi số tiền)
    $(document).on('click', '.edit-expense', function(e) {
        e.preventDefault();
        var transaction = $(this).closest('.expense');
        
        // Lấy thông tin hiện tại
        var amountText = transaction.find('.expense-amount span').text();
        
        // Xác định loại giao dịch
        var isExpense = amountText.charAt(0) === '-';
        var amount = parseFloat(amountText.replace(/[^\d.-]/g, ''));
        var transactionType = isExpense ? 'expense' : 'income';

        // Đặt giá trị vào modal để chỉnh sửa
        $('#transactionType').val(transactionType);
        $('#amount').val(amount);
        $('#saveExpense').data('isEdit', true); // Đánh dấu trạng thái đang chỉnh sửa
        $('#saveExpense').data('editTarget', transaction); // Lưu lại phần tử đang chỉnh sửa

        // Hiển thị modal
        $('#expenseModal').modal('show');
    });

    // left và right kéo cùng lúc
    $('.middle-box-right').on('scroll', function() {
        $('.middle-box-left').scrollTop($(this).scrollTop());
    });
});
