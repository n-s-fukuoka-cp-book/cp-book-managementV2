document.getElementById("loading_page").style.display = "none";
document.getElementById("buckbutton").style.display = "none";
document.getElementById("form_text_input").style.display = "none"
document.getElementById("search_table").style.display = "none"
document.getElementById("nones").style.display = "none"
document.getElementById("Background").style.display = "none"
document.getElementById("rental_form_div").style.display = "none"
document.getElementById("nones1").style.display = "none"


// document.getElementById("menues").style.display = "none";//編集用
const ld = document.getElementById("loading_page");
const menues_bar = document.getElementById("menues");
const search_from = document.getElementById("form_text_input");
const buck_button = document.getElementById("buckbutton");
const search_table = document.getElementById("search_table");
const Background = document.getElementById("Background");
const rental_form_div = document.getElementById("rental_form_div");


function buck() {
    let timerInterval
    Swal.fire({
        title: '少々お待ち下さい',
        html: 'あと<b></b>秒でホームに戻ります',
        timer: 1000,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading()
            const b = Swal.getHtmlContainer().querySelector('b')
            timerInterval = setInterval(() => {
                b.textContent = Swal.getTimerLeft()
            }, 100)
        },
        willClose: () => {
            clearInterval(timerInterval)
        }
    }).then((result) => {
        /* Read more about handling dismissals below */
        if (result.dismiss === Swal.DismissReason.timer) {
            // console.log('I was closed by the timer')
            // window.location.href = "index.html";
            ld.style.display = "none";
            buck_button.style.display = "none"
            menues_bar.style.display = "block";
            search_from.style.display = "none"
            window.location.href = "index.html";
        }
    })
}
function keyword_update() {
    menues_bar.style.display = "none";
    ld.style.display = "block";
    buck_button.style.display = "block"

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 18600,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })

    Toast.fire({
        icon: 'success',
        title: 'キーワードの更新中です'
    })
    eel.keyword()
    window.location.href = "index.html";
}
function book_search() {
    menues_bar.style.display = "none";
    search_from.style.display = "block";
    buck_button.style.display = "block";
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })

    Toast.fire({
        icon: 'info',
        title: '検索する本のタイトルや\nキーワードを入力してください'

    })

}
function write_table(result) {
    search_table.style.display = "block"
    var tableElem = document.getElementById('search_table');
    var trElem = tableElem.tBodies[0].insertRow(-1);

    var cellElem = trElem.insertCell(0);
    cellElem.appendChild(document.createTextNode(result[i]["title"]));
    cellElem.setAttribute("id", "table_title");

    var cellElem = trElem.insertCell(1);
    cellElem.appendChild(document.createTextNode(result[i]["author"]));
    cellElem.setAttribute("id", "table_author");

    var cellElem = trElem.insertCell(2);
    const rental_status_day = result[i]["rental_status"]
    // if(rental_status_day != "貸出可能"){

    // }
    cellElem.appendChild(document.createTextNode(rental_status_day));
    cellElem.setAttribute("id", "table_status");

    var cellElem = trElem.insertCell(3);
    cellElem.appendChild(document.createTextNode(result[i]["page"]));
    cellElem.setAttribute("id", "table_page");

    var cellElem = trElem.insertCell(4);
    var h_text = result[i]["headline"]
    if (0 == h_text.length) {
        cellElem.appendChild(document.createTextNode("There is no text"));
        cellElem.setAttribute("id", "table_headline");
    } else if (h_text.length < 35) {
        cellElem.appendChild(document.createTextNode(result[i]["headline"]));
        cellElem.setAttribute("id", "table_headline");
    } else {
        var extractedStr = h_text.substring(0, 35);
        cellElem.appendChild(document.createTextNode(extractedStr + "...."));
        cellElem.setAttribute("id", "table_headline");
    }


    var cellElem = trElem.insertCell(5);
    var imgElem = document.createElement('img');
    imgElem.src = result[i]["thumbnail"];
    var thumbnailUrl = result[i]["thumbnail"];
    if (thumbnailUrl) {
        imgElem.src = thumbnailUrl;
    } else {
        imgElem.src = "no_image.svg";
    }
    cellElem.appendChild(imgElem);
    cellElem.setAttribute("id", "table_thumbnail");
    imgElem.style.width = "50px";
    imgElem.style.height = "auto";
    imgElem.addEventListener("click", function () {
        var newImgElem = document.createElement('img');
        newImgElem.src = this.src;
        newImgElem.style.width = "250px";
        newImgElem.style.position = "fixed";
        newImgElem.style.top = "0";
        newImgElem.style.left = "0";
        newImgElem.style.bottom = "0";
        newImgElem.style.right = "0";
        newImgElem.style.margin = "auto";
        newImgElem.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        newImgElem.style.zIndex = "9999";
        document.body.appendChild(newImgElem);
        Background.style.display = "block"

        // 追加するコード
        newImgElem.addEventListener("click", function () {
            document.body.removeChild(newImgElem);
            Background.style.display = "none"

        });
        Background.addEventListener("click", function () {
            document.body.removeChild(newImgElem);
            Background.style.display = "none"

        });
    });
}


function search_start() {
    document.getElementById("label-text").style.display = "none"
    document.getElementById("label-text2").style.display = "none"
    var text = document.getElementById("form_text").value;
    var table = document.getElementById('search_table');
    var row_num = table.rows.length;
    if (row_num != 1) {
        for (i = 1; i < row_num; i++) {
            table.deleteRow(-1)
        }
    }
    if (text != "") {
        async function posts() {
            let result = await eel.word_search(text)();
            console.log(result.length)
            if (result.length == 0) {
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: '類似ワードで検索しています',
                    showConfirmButton: false,
                    timer: 1500
                })
                let result = await eel.aimai_word_search(text)();
                console.log(result.length)
                if (result.length == 0) {
                    search_table.style.display = "none"
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'エラーが発生したようです[U-002]',
                        footer: '<a href="info.html#U-002">なぜこの問題が発生するのですか?</a>'
                    })
                } else {
                    document.getElementById("label-text").textContent = "「" + text + "」の検索結果";
                    document.getElementById("label-text2").textContent = result.length + " 件ヒットしました";
                    document.getElementById("label-text").style.display = "block"
                    document.getElementById("label-text2").style.display = "block"
                    for (i = 0; i < result.length; i++) {
                        const Toast = Swal.mixin({
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 6000,
                            timerProgressBar: true,
                            didOpen: (toast) => {
                                toast.addEventListener('mouseenter', Swal.stopTimer)
                                toast.addEventListener('mouseleave', Swal.resumeTimer)
                            }
                        })
                        Toast.fire({
                            icon: 'info',
                            title: 'この検索結果は類似ワードによるものです\n正確性がないことをご了承ください'
                        })
                        console.log(result[i]["title"])
                        //書き込み
                        write_table(result)
                    }
                }
            } else {
                document.getElementById("label-text").textContent = "「" + text + "」の検索結果";
                document.getElementById("label-text2").textContent = result.length + " 件ヒットしました";
                document.getElementById("label-text").style.display = "block"
                document.getElementById("label-text2").style.display = "block"
                for (i = 0; i < result.length; i++) {
                    console.log(result[i]["title"])
                    write_table(result)
                }
                // var trElem = tableElem.tBodies[0].insertRow(-1);
                // var cellElem = trElem.insertCell(0);
                // cellElem.appendChild(document.createTextNode("類似ワードによる検索結果"));
            }
        }
        // console.log(A);
        tables = posts();
        // console.log(tables)
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'エラーが発生したようです[U-001]',
            footer: '<a href="info.html#U-001"target="_blank">なぜこの問題が発生するのですか?</a>'
        })
    }

}
function search_start_button() {
    rental_form_div.style.display = "block"
    menues_bar.style.display = "none";

}
const ids = [];
function CheckLength() {
    document.onkeypress = function (e) {
        // エンターキーだったら無効にする
        if (e.key === 'Enter') {
            return false;
        }
    }
    const input = document.getElementById("management_code");
    const value = input.value;
    const length = value.length;
    if (length === 8 && value[0] == 1) {
        id = document.getElementById("management_code").value;
        const list_t_f = ids.includes(id)
        if (list_t_f == false) {
            ids.push(id)
        } else {
            Swal.fire(
                'STOP!',
                'すでに同じ本を読み込んでいます!',
                'warning'
            )
            const form = document.getElementById("rental_form");
            form.reset();
            return
        }
        const form = document.getElementById("rental_form");
        form.reset();
        console.log(ids)

        const tables = document.getElementById('rental_table');
        const row_num_r = tables.rows.length;
        if (row_num_r != 1) {
            for (i = 1; i < row_num_r; i++) {
                tables.deleteRow(-1)
            }
        }
        async function posts() {
            let result = await eel.rental_start(ids)();
            for (i = 0; i < result.length; i++) {
                var tableElem = document.getElementById('rental_table');
                var trElem = tableElem.tBodies[0].insertRow(-1);
                if (result[i]["status"] == true) {
                    var cellElem = trElem.insertCell(0);
                    if (result[i]["title"] == "") {
                        title = "Title not found"
                    } else {
                        title = result[i]["title"]
                    }
                    cellElem.appendChild(document.createTextNode(title));
                    cellElem.setAttribute("id", "table_title_rental");

                    var cellElem = trElem.insertCell(1);
                    cellElem.appendChild(document.createTextNode(ids[i]));
                    cellElem.setAttribute("id", "table_code");
                } else {
                    Swal.fire(
                        'STOP!',
                        'この本は貸出中です\n返却されるまでお待ち下さい!',
                        'warning'
                    )
                    ids.splice(i, 1)

                }
            }
        }
        posts();
    }
}


function rental_start_button() {
    ld.style.display = "block";
    rental_form_div.style.display = "none"
    console.log(ids)
    if (ids.length == 0) {
        Swal.fire(
            'STOP!',
            '貸し出しする本が見つかりません\n上の入力フォームに8桁の管理コードを入力してください',
            'warning'
        )
        ld.style.display = "none"
        rental_form_div.style.display = "block"

    } else {
        //取得データ書き換え
        async function someFunction() {
            const { value: email } = await Swal.fire({
                title: 'メールアドレスか学籍番号を\n入力してください',
                input: 'email',
                inputLabel: 'あなたのメールアドレスか、学籍番号を入力してください\nメールドレスの方がおすすめです',
                inputPlaceholder: 'メールアドレスか学籍番号を入力'
            })
            if (email) {
                console.log(email)
            }
            const post_data = [];
            for (num = 0; num < ids.length; num++) {
                rental_list = {
                    "id": ids[num],
                    "status": "貸出中",
                    "user": email
                }
                post_data.push(rental_list)
            }
            console.log(post_data)
            async function data_update() {
                let result = await eel.db_update(post_data)();
                console.log(result);
            }
            data_update();
            const tables = document.getElementById('rental_table');
            const row_num_r = tables.rows.length;
            if (row_num_r != 1) {
                for (i = 1; i < row_num_r; i++) {
                    tables.deleteRow(-1)
                }
            }
            buck();
        }
        someFunction();
    }
}

// ?
document.getElementById("rental_end_form_div").style.display = "none"
const rental_end_form_div=document.getElementById("rental_end_form_div")

function search_end_start_button() {
    rental_end_form_div.style.display = "block"
    menues_bar.style.display = "none";
}
const idss = [];



// ?