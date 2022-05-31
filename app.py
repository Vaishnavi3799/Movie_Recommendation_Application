from flask import Flask, request, render_template, make_response, jsonify
import psycopg2

from flask_cors import CORS

app = Flask(__name__)
CORS(app)

conn = None


def get_connection():
    global conn
    conn = psycopg2.connect("host=localhost dbname=Movies user=postgres password=root")


def validate_login(user_name, pwd):
    login_details = getLoginDetails()[0]

    if login_details[0] == user_name and login_details[1] == pwd:
        return True

    # return True


def insert_table_db(table_name, cols, val):
    try:
        columns = "("
        for col in cols:
            columns += col + ","

        columns = columns[:-1]
        columns += ")"

        values = "("
        for data in val:
            values += "'" + data + "',"

        values = values[:-1]
        values += ")"

        sql = f"insert into {table_name}{columns} values {values};"
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()
        return True
    except:
        cur.execute("ROLLBACK")
        return False


def update_table_db(table_name, cols, val, where_cols, where_values):
    try:
        update_query = ""
        for i in range(len(cols)):
            update_query += cols[i] + "='" + val[i] + "',"
        update_query = update_query[:-1]

        where_query = ""
        for i in range(len(where_cols)):
            if len(where_query) > 0:
                where_query += " AND "
            where_query += where_cols[i] + "=" + where_values[i]

        sql = f"update {table_name} SET {update_query} where {where_query};"
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()
        return True
    except:
        cur.execute("ROLLBACK")
        return False


def delete_table_db(table_name, cols, val):
    try:
        where_query = ""
        for i in range(len(cols)):
            if len(where_query) > 0:
                where_query += " AND "
            where_query += cols[i] + "=" + val[i]

        sql = f"delete from {table_name} where {where_query};"
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()
        return True
    except:
        cur.execute("ROLLBACK")
        return False


def get_table_db(table_name, cols, val):
    try:
        where_query = ""
        for i in range(len(cols)):
            if len(where_query) > 0:
                where_query += " AND "
            where_query += cols[i] + "=" + val[i]

        sql = f"select * from {table_name} where {where_query};"
        cur = conn.cursor()
        cur.execute(sql)
        return cur.fetchall()
    except:
        return False


def getLoginDetails():
    sql = "select * from Login;"
    cur = conn.cursor()
    cur.execute(sql)
    return cur.fetchall()


def getAllMovie(data):
    sql = f"SELECT MovieID, Title, duration, IMDBID, CensorRating, Popularity, TagLine from Movie limit {data['limit']} offset {data['offset']}; "
    cur = conn.cursor()
    cur.execute(sql)
    return cur.fetchall()


def getAllMovieByGenre(data):
    sql = f"SELECT m.MovieID, m.Title, m.duration, m.IMDBID, m.CensorRating, m.Popularity, m.TagLine from Movie m natural join moviesingenre mg natural join genre g where LOWER(g.genrename) = LOWER('{data['genre']}') and popularity is not null order by m.popularity DESC limit {data['limit']} offset {data['offset']};"
    cur = conn.cursor()
    cur.execute(sql)
    return cur.fetchall()


def getAllMovieByProduction(data):
    sql = f"SELECT m.MovieID, m.Title, m.duration, m.IMDBID, m.CensorRating, m.Popularity, m.TagLine from Movie m natural join moviesbyproduction mp natural join production p where LOWER(p.productionname) = LOWER('{data['production']}') and popularity is not null order by m.popularity DESC limit {data['limit']} offset {data['offset']};"
    cur = conn.cursor()
    cur.execute(sql)
    return cur.fetchall()


def getAllMovieByKeyword(data):
    sql = f"SELECT m.MovieID, m.Title, m.duration, m.IMDBID, m.CensorRating, m.Popularity, m.TagLine from Movie m natural join moviestosearchkeywords ms natural join searchkeywords s where LOWER(s.searchkeyword) = LOWER('{data['search_keyword']}') and popularity is not null order by m.popularity DESC limit {data['limit']} offset {data['offset']};"
    cur = conn.cursor()
    cur.execute(sql)
    return cur.fetchall()


def getMovie(data):
    if data['col'] == 'movieid':
        sql = f"SELECT MovieID, Title, duration, IMDBID, CensorRating, Popularity, TagLine from Movie where {data['col']} = '{data['val']}' limit {data['limit']} offset {data['offset']}; "
    elif data['col'] == 'title':
        sql = f"SELECT MovieID, Title, duration, IMDBID, CensorRating, Popularity, TagLine from Movie where LOWER({data['col']}) = LOWER('{data['val']}') limit {data['limit']} offset {data['offset']}; "
    cur = conn.cursor()
    cur.execute(sql)
    return cur.fetchall()


def getPopularMovie():
    sql = f"SELECT MovieID, Title, duration, IMDBID, CensorRating, Popularity, TagLine from Movie where Popularity is not null order by Popularity DESC limit 10;"
    cur = conn.cursor()
    cur.execute(sql)
    return cur.fetchall()


def getHighestRatedMovie():
    sql = f"SELECT m.MovieID, m.Title, m.duration, m.IMDBID, m.CensorRating, m.Popularity, m.TagLine, r.RatingAverage, r.RatingCount from Movie m natural join MovieRating r where r.RatingAverage is not null and r.RatingCount > 1000 order by r.RatingAverage DESC limit 10;"
    cur = conn.cursor()
    cur.execute(sql)
    return cur.fetchall()


@app.route('/')
def render_home():
    get_connection()
    return render_template("home.html")


@app.route('/get_all_movie', methods=["GET"])
def get_all_movie():
    output = {
        "movie": getAllMovie(request.values)
    }
    return make_response(output, 200)


@app.route('/get_movie', methods=["GET"])
def get_movie():
    output = {
        "movie": getMovie(request.values)
    }
    return make_response(output, 200)


@app.route('/get_top_popular', methods=["GET"])
def get_popular_movie():
    output = {
        "movie": getPopularMovie()
    }
    return make_response(output, 200)


@app.route('/get_top_rated', methods=["GET"])
def get_highest_rated_movie():
    output = {
        "movie": getHighestRatedMovie()
    }
    return make_response(output, 200)


@app.route('/get_movie_by_genre', methods=["GET"])
def get_movie_by_genre():
    output = {
        "movie": getAllMovieByGenre(request.values)
    }
    return make_response(output, 200)


@app.route('/get_movie_by_production', methods=["GET"])
def get_movie_by_production():
    output = {
        "movie": getAllMovieByProduction(request.values)
    }
    return make_response(output, 200)


@app.route('/get_movie_by_keyword', methods=["GET"])
def get_movie_by_keyword():
    output = {
        "movie": getAllMovieByKeyword(request.values)
    }
    return make_response(output, 200)


@app.route('/check_login', methods=["GET"])
def check_login():
    output = {
        "login_status": validate_login(request.values['user_name'], request.values['pwd'])
    }

    return make_response(output, 200)


@app.route('/insert_table', methods=["POST"])
def insert_table():

    output = {
        "status": insert_table_db(request.values['table_name'], request.values['cols'].split(','),
                    request.values['values'].split(','))
    }
    return make_response(output, 200)


@app.route('/delete_table', methods=["POST"])
def delete_table():

    output = {
        "status": delete_table_db(request.values['table_name'], request.values['cols'].split(','),
                    request.values['values'].split(','))
    }
    return make_response(output, 200)


@app.route('/update_table', methods=["PUT"])
def update_table():

    output = {
        "status": update_table_db(request.values['table_name'], request.values['cols'].split(','),
                    request.values['values'].split(','), request.values['where_cols'].split(','), request.values['where_values'].split(','))
    }
    return make_response(output, 200)


@app.route('/get_table', methods=["GET"])
def get_table():

    output = {
        "values": get_table_db(request.values['table_name'], request.values['cols'].split(','),
                    request.values['values'].split(','))
    }
    return make_response(output, 200)


if __name__ == '__main__':
    app.run()
