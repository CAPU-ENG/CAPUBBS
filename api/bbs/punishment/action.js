function printPunishmentTableByYear(div_id, year, history, admin) {
    $(div_id).empty();
    captionText = history ? "上年度罚跑名单记录：" : "本年度罚跑名单记录：";
    table = `
        <table class="contenttable" style="-webkit-text-size-adjust: 100%">
            <caption style="-webkit-text-size-adjust: 100%">
                <b><font face="宋体">${captionText}</font></b>
            </caption>
            <thead>
                <tr><th>姓名</th><th>ID</th><th>原因</th><th>长度</th><th>职务加罚</th><th>开始时间</th><th>结束时间</th><th>完成情况</th></tr>
            </thead>
            <tbody></tbody>
        </table>`;
    $(div_id).append(table);

    params = history ? { "year": year, "history": 1 } : { "year": year };
    $.get("/api/bbs/punishment/get/", params, function (data) {
        tbody = $(div_id).find("tbody");
        data.result.forEach((item, index) => {
            startDate = item.start_date.split('-').map(part => parseInt(part)).join('.');
            endDate = item.is_end == 1 ? item.end_date.split('-').map(part => parseInt(part)).join('.') : "";

            if (admin) {
                completionCell = item.is_end == 0
                    ? `<td>
                         <button onclick='update_punishment(${item.id}, ${index});' 
                                 style="padding:3px 8px;background:#4CAF50;color:white;border:none;border-radius:3px;cursor:pointer;">
                             更新
                         </button>
                       </td>`
                    : `<td>已完成</td>`;
            } else {
                completionCell = `<td>${item.is_end == 1 ? "已完成" : ""}</td>`;
            }

            row = `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.username}</td>
                    <td>${item.reason}</td>
                    <td>${item.distance}</td>
                    <td>${item.addition == 1 ? "是" : "否"}</td>
                    <td>${startDate}</td>
                    <td>${endDate}</td>
                    ${completionCell}
                </tr>`;
            tbody.append(row);
        });
        
        window.punishmentData = data.result;
    });
}

function update_punishment(punishment_id, index) {
    modal = $(
        `<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:9999;">
            <div style="background:white;padding:20px;border-radius:5px;text-align:center;">
                <h3>选择完成日期</h3>
                <input type="date" id="punishment-date" style="margin:10px 0;padding:5px;">
                <div>
                    <button id="confirm-btn" style="margin-right:10px;padding:5px 10px;background:#4CAF50;color:white;border:none;border-radius:3px;cursor:pointer;">确认</button>
                    <button id="cancel-btn" style="padding:5px 10px;background:#f44336;color:white;border:none;border-radius:3px;cursor:pointer;">取消</button>
                </div>
            </div>
        </div>`
    );

    $('body').append(modal);
    $('#punishment-date').val(new Date().toISOString().split('T')[0]);
    
    $('#cancel-btn').on('click', function () {
        modal.remove();
    });

    modal.on('click', function (e) {
        if (e.target === modal[0]) {
            modal.remove();
        }
    });

    $('#confirm-btn').on('click', function () {
        selectedDate = $('#punishment-date').val();
        if (!selectedDate) {
            alert('请选择日期');
            return;
        }
        
        option_values = {
            "punishment_id": punishment_id,
            "action": "finish",
            "end_date": selectedDate
        };

        $.post("/api/bbs/punishment/update/", option_values,
            function (response) {
                window.location.reload();
            });
    });
}

function add_punishment() {
    modal = $(
        `<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:9999;">
            <div style="background:white;padding:20px;border-radius:5px;text-align:center;width:300px;">
                <h3>添加罚跑记录</h3>
                <form id="add-punishment-form" style="text-align:left;">
                    <div style="margin-bottom:10px;">
                        <label>ID:</label>
                        <input type="text" name="username" required style="width:100%;padding:5px;">
                    </div>
                    <div style="margin-bottom:10px;">
                        <label>姓名:</label>
                        <input type="text" name="name" required style="width:100%;padding:5px;">
                    </div>
                    <div style="margin-bottom:10px;">
                        <label>原因:</label>
                        <input type="text" name="reason" required style="width:100%;padding:5px;">
                    </div>
                    <div style="margin-bottom:10px;">
                        <label>长度:</label>
                        <input type="number" name="distance" min="1" required style="width:100%;padding:5px;">
                    </div>
                    <div style="margin-bottom:10px;">
                        <label>职务加罚:</label>
                        <select name="addition" style="width:100%;padding:5px;">
                            <option value="0">否</option>
                            <option value="1">是</option>
                        </select>
                    </div>
                    <div style="margin-bottom:15px;">
                        <label>开始日期:</label>
                        <input type="date" name="start_date" required style="width:100%;padding:5px;">
                    </div>
                </form>
                <div>
                    <button id="confirm-add-btn" style="margin-right:10px;padding:5px 10px;background:#4CAF50;color:white;border:none;border-radius:3px;cursor:pointer;">确认添加</button>
                    <button id="cancel-add-btn" style="padding:5px 10px;background:#f44336;color:white;border:none;border-radius:3px;cursor:pointer;">取消</button>
                </div>
            </div>
        </div>`
    );

    $('body').append(modal);

    $('input[name="start_date"]').val(new Date().toISOString().split('T')[0]);

    $('#cancel-add-btn').on('click', function () {
        modal.remove();
    });

    modal.on('click', function (e) {
        if (e.target === modal[0]) {
            modal.remove();
        }
    });

    $('#add-punishment-form').on('keypress', function (e) {
        if (e.which === 13) {
            $('#confirm-add-btn').click();
            e.preventDefault();
        }
    });

    $('#confirm-add-btn').on('click', function () {
        formData = {};
        isValid = true;

        $('#add-punishment-form').find('input, select').each(function () {
            $input = $(this);
            value = $input.val().trim();

            if ($input.attr('required') && !value) {
                alert(`请填写${$input.prev('label').text()}`);
                isValid = false;
                return false;
            }

            formData[$input.attr('name')] = value;
        });

        if (!isValid) return;

        formData.action = "add";
        formData.distance = parseInt(formData.distance);
        formData.addition = parseInt(formData.addition);

        $.post("/api/bbs/punishment/add/", formData,
            function (response) {
                window.location.reload();
            });
    });
}
