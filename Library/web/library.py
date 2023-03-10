import json;import csv
from pydrive2.auth import GoogleAuth
from pydrive2.drive import GoogleDrive
from janome.tokenizer import Tokenizer
import jaconv;import eel;import os
import datetime;from datetime import datetime, timedelta


def eel_open(Path):
    eel.init(os.path.dirname(__file__) + "/web")
    eel.start(Path)


message_file = open("./system/message.json", "r")
message = json.load(message_file)


def status_load():
    status_file = open("./drive/status.json", "r")
    status = json.load(status_file)
    last_update = status["last_update"]
    edit_status = status["edit_status"]
    last_person_id = status["last_person_id"]
    last_person_name = status["last_person_name"]
    last_person_power = status["last_person_power"]
    last_book_count = status["last_book_count"]
    return last_update, edit_status, last_person_id, last_person_name, last_person_power, last_book_count


def edit():  # 編集可能かどうかの確認
    edit = status_load()[1]
    if edit == True:
        pass
    else:
        alert = message["already_taken"]


def db_load(field):  # 取得したいfieldを引数で入力
    field_list = []
    with open('./drive/db.csv', encoding='utf-8', newline='') as f:
        reader = csv.reader(f)
        for row in reader:
            field_list.append(row[field])
        return field_list


@eel.expose
def keyword():  # janomeを使用した形態素解析による、検索用ワードの抽出
    keyword_text_list = [];keyword_kana_list = []
    book_ids = db_load(0)
    last_book_count = status_load()[5]
    new_book_count = len(book_ids)
    book_title = db_load(6)
    if last_book_count < new_book_count:
        for num in range(new_book_count):
            t = Tokenizer()
            text = book_title[num]
            for token in t.tokenize(text):
                keyword_text = token.surface
                keyword_text_list.append([book_ids[num], keyword_text, text])
            for token in t.tokenize(text):
                keyword_kana = token.reading
                keyword_kanas = jaconv.kata2hira(keyword_kana)
                keyword_kana_list.append([book_ids[num], keyword_kanas, text])
            total_text = keyword_kana_list + keyword_text_list
            
        for num in range(new_book_count):
            t = Tokenizer()
            book_headline = db_load(8)
            headline_text = book_headline[num]
            for token in t.tokenize(headline_text):
                keyword_h=token.surface
                total_text.append([book_ids[num],keyword_h,headline_text])
                
    
        with open('./system/search_keyword.csv', 'w') as f:
            writer = csv.writer(f)
            writer.writerows(total_text)
# keyword()


def db_load_search(management, title, Path):
    management_field_list = [];title_field_list = []
    with open(Path, encoding='utf-8', newline='') as f:
        reader = csv.reader(f)
        for row in reader:
            management_field_list.append(row[management])
            title_field_list.append(row[title])
        return management_field_list, title_field_list


def aimai_load():
    aimai_title_list = []
    with open('system/search_keyword.csv', encoding='utf-8', newline='') as f:
        reader = csv.reader(f)
        for row in reader:
            aimai_title_list.append(row[2])
        return aimai_title_list


def search(word):  # 正確に一致する文字列を検索できます。
    r = []
    try:
        book_ids, book_title = db_load_search(0, 6, "./drive/db.csv")
        for num in range(len(book_ids)):
            idx = book_title[num].find(word)
            if idx != -1:
                r.append(book_ids[num])
    except ValueError:
        count = 0
        pass
    return r


def aimai_search(word):  # 曖昧な文字列を検索できます。
    r = []
    try:
        aimai_book_ids, aimai_book_key = db_load_search(0, 1, "system/search_keyword.csv")
        aimai_list = aimai_load()
        for num in range(len(aimai_book_ids)):
            idx = aimai_book_key[num].find(word)
            if idx != -1:
                r.append(aimai_book_ids[num])
                # print(aimai_list[num])
    except:
        pass
    return r


def db():  # 取得したいfieldを引数で入力
    title_list_load = [];author_list_load = []
    rental_status_list_load = [];return_day_load = []
    page_list_load = [];headline_load = []
    thumbnail_list_load = []
    with open('./drive/db.csv', encoding='utf-8', newline='') as f:
        reader = csv.reader(f)
        for row in reader:
            title_list_load.append(row[6]);author_list_load.append(row[7])
            rental_status_list_load.append(row[4]);return_day_load.append(row[5])
            page_list_load.append(row[10]);headline_load.append(row[8])
            thumbnail_list_load.append(row[9])
        return title_list_load, author_list_load, rental_status_list_load, return_day_load, page_list_load, headline_load, thumbnail_list_load


@eel.expose
def word_search(word):  # フロントエンドからの入力に対応した本を検索
    searchreturn = search(word)
    aimai_searchreturn = aimai_search(word)
    aimai_searchreturn = dict.fromkeys(aimai_searchreturn)
    aimai_searchreturn = list(aimai_searchreturn)
    kaburi = set(searchreturn) & set(aimai_searchreturn)
    kaburi = list(kaburi)
    for num in range(len(kaburi)):
        aimai_searchreturn.remove(kaburi[num])
    title_list = [];author_list = [];rental_status_list = []
    page_list = [];headline = [];thumbnail_list = []
    result = []
    numbers_list = db_load(0)
    title_list_load, author_list_load, rental_status_list_load, return_day_load, page_list_load, headline_load, thumbnail_list_load = db()
    for num in range(len(searchreturn)):
        number = numbers_list.index(searchreturn[num])
        title_list.append(title_list_load[number]);author_list.append(author_list_load[number])
        page_list.append(page_list_load[number]);headline.append(headline_load[number]);thumbnail_list.append(thumbnail_list_load[number])
        if rental_status_list_load[number] == "貸出中":
            day=return_day_load[number]
            date_object = datetime.strptime(day, "%Y/%m/%d")
            new_date = date_object + timedelta(days=7)
            new_date = new_date.strftime("%Y/%m/%d")
            new_date = new_date+"\n返却予定"
            rental_status_list.append(new_date)

        else:
            rental_status_list.append("貸出可能")
    book_count = [len(searchreturn)]
    if book_count == [0]:
        title_list = [];author_list = [];rental_status_list = []
        page_list = [];headline = [];thumbnail_list = []
    if book_count != 0:
        for num in range(book_count[0]):
            valu = {
                "title":title_list[num],
                "author":author_list[num],
                "rental_status":rental_status_list[num],
                "page":page_list[num],
                "headline":headline[num],
                "thumbnail":thumbnail_list[num]
            }
            result.append(valu)
    return result

# word_search("ありのまま")

@eel.expose
def aimai_word_search(word):  # フロントエンドからの入力に対応した本を検索
    searchreturn = search(word)
    aimai_searchreturn = aimai_search(word)
    aimai_searchreturn = dict.fromkeys(aimai_searchreturn)
    aimai_searchreturn = list(aimai_searchreturn)
    kaburi = set(searchreturn) & set(aimai_searchreturn)
    kaburi = list(kaburi)
    for num in range(len(kaburi)):
        aimai_searchreturn.remove(kaburi[num])
    title_list = [];author_list = [];rental_status_list = []
    page_list = [];headline = [];thumbnail_list = []

    result = []
    numbers_list = db_load(0)
    title_list_load, author_list_load, rental_status_list_load, return_day_load, page_list_load, headline_load, thumbnail_list_load = db()
    for num in range(len(aimai_searchreturn)):
        number = numbers_list.index(aimai_searchreturn[num])
        title_list.append(title_list_load[number]);author_list.append(author_list_load[number])
        page_list.append(page_list_load[number]);headline.append(headline_load[number]);thumbnail_list.append(thumbnail_list_load[number])
        if rental_status_list_load[number] == "貸出中":
            day=return_day_load[number]
            date_object = datetime.strptime(day, "%Y/%m/%d")
            new_date = date_object + timedelta(days=7)
            new_date = new_date.strftime("%Y/%m/%d")
            new_date = new_date+"\n返却予定"
            rental_status_list.append(new_date)
        else:
            rental_status_list.append("貸出可能")
        # page = page_list[number]
            
    book_count = [len(aimai_searchreturn)]
    if book_count == [0]:
        title_list = [];author_list = [];rental_status_list = []
        page_list = [];headline = [];thumbnail_list = []
    if book_count != 0:
        for num in range(book_count[0]):
            valu = {
                "title":title_list[num],
                "author":author_list[num],
                "rental_status":rental_status_list[num],
                "page":page_list[num],
                "headline":headline[num],
                "thumbnail":thumbnail_list[num]
            }
            result.append(valu)
            
            
    return result
# book_count,title_list, author_list, rental_status_list, page_list, headline, thumbnail_list = word_search("ネット")
# test(book_count,title_list, author_list, rental_status_list, page_list, headline, thumbnail_list)
# if __name__ == "__main__":
#     eel_open()
# print(word_search("革命"))


def management_code_search(code):#リスト型で入力してください
    management = db_load(0)
    returns =[]
    title_list_load, author_list_load, rental_status_list_load, return_day_load, page_list_load, headline_load, thumbnail_list_load = db()
    try:
        for num in range(len(code)):
            index = management.index(code[num])
            result ={
                "title":title_list_load[index],
                "status":rental_status_list_load[index]
            }
            returns.append(result)
        return returns
    except :
        returns ={
            "title":"undefined",
            "status":False
        }
        return returns

@eel.expose
def rental_start(code):
    data = management_code_search(code)
    count_data = len(data)
    result_set = []
    for num in range(count_data):
        if data[num]["status"] == "貸出中":
            result ={
            "title":data[num]["title"],
            "status":False
        }
            result_set.append(result)
        else:
            result ={
            "title":data[num]["title"],
            "status":True  
        }
            result_set.append(result)
    return result_set




def full_db():
    L0=[];L1 =[];L2=[];L3=[];L4=[];L5=[];L6=[]
    L7=[];L8=[];L9=[];L10=[];L11=[];L12=[];L13=[]
    with open('./drive/db.csv', encoding='utf-8', newline='') as f:
        reader = csv.reader(f)
        for row in reader:
            L0.append(row[0]);L1.append(row[2]);L2.append(row[2]);L3.append(row[3])
            L4.append(row[4]);L5.append(row[5]);L6.append(row[6]);L7.append(row[7])
            L8.append(row[8]);L9.append(row[9]);L10.append(row[10]);L11.append(row[11])
            L12.append(row[12])
        return L0,L1,L2,L3,L4,L5,L6,L7,L8,L9,L10,L11,L12

            
@eel.expose
def db_update(data):
    today = datetime.now()
    y = today.year
    m = today.month
    d = today.day
    management = db_load(0)
    id_list =[];status_list=[];user_list=[]
    L0,L1,L2,L3,L4,L5,L6,L7,L8,L9,L10,L11,L12= full_db()
    
    today = ("{0}/{1}/{2}".format(y,m,d))
    for num in range(len(data)):
        id = data[num]["id"];status = data[num]["status"];user = data[num]["user"]
        id_list.append(id);status_list.append(status);user_list.append(user)
        index = management.index(id_list[num])
        new_status = status
        new_date = today
        new_user = user
        L4[index]=new_status
        L5[index]=new_date
        L12[index]=new_user
    with open('./drive/db.csv', 'w',encoding='utf-8', newline='') as csv_file:
        csv_writer = csv.writer(csv_file)
        for num in range(len(L0)):
            csv_writer.writerow([L0[num],L1[num],L2[num],L3[num],L4[num],L5[num],L6[num],L7[num],L8[num],L9[num],L10[num],L11[num],L12[num]])
        
        
# !

# !
eel_open("index.html")