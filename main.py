from flask import Flask, request, render_template
import psycopg2

app = Flask(__name__)


def get_connection():
    return psycopg2.connect("host=localhost dbname=Movies user=postgres password=root")


conn = get_connection()
cur = conn.cursor()


@app.route('/', methods=["GET"])
def home():
    if request.method == "GET":
        return render_template("index.html")


# @app.route('/example', methods = ['GET'])
# def example():
#     cur.execute('SELECT movieid,title,imdbid,runtime from movie LIMIT 3')
#     data = cur.fetchall()
#     with app.app_context(), app.test_request_context():
#         return render_template('example.html', output_data = cur.fetchall())


if __name__ == '__main__':
    app.run()
