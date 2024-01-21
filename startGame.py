from http.server import SimpleHTTPRequestHandler, HTTPServer
import json
from swiplserver import *
import webbrowser

class RequestHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        # Обработка данных от клиента (в виде строки текста)
        received_data = data.get('data')
        # Здесь вы можете выполнить какую-либо обработку и подготовить ответ

        parsed = ''

        for i in received_data:
            parsed+='l('
            for j in i:
                if j==0:
                    parsed+='0, '  
                if j==1:
                    parsed+='1, '
                if j=='black':
                    parsed+='b, '
                if j=='white':
                    parsed+='w, '
                if j=='white queen':
                    parsed+='wq, '
                if j=='black queen':
                    parsed+='bq, '
            parsed = parsed[:-2]                  
            parsed+='),\n'
        parsed = parsed[:-2]
        
        cur = 'cur_board(game_board(\n' +parsed+"\n))."

        with open("mglgar.pl", "r+") as file:
                content = file.read()
                modified_content = content.replace('%test',cur)
                file.seek(0)
                file.write(modified_content)
                file.truncate()


        with PrologMQI() as mqi:
            with mqi.create_thread() as prolog_thread:
                prolog_thread.query("set_prolog_flag(encoding,utf8).")
                prolog_thread.query("consult(\"mglgar.pl\").")

                prolog_thread.query("main().") 

        with open("mglgar.pl", "r+") as file:
                content = file.read()
                modified_content = content.replace(cur,'%test')
                file.seek(0)
                file.write(modified_content)
                file.truncate()

        comp_moves = []
        with open('comp_moves.txt', 'r+', encoding='utf-8') as f:
            content = f.read()
            content = content[:-1]
            content = content.split(" -> ")
            for i in content:
                comp_moves.append(i)
             
        pos_moves = []
        with open('pos_moves.txt', 'r+', encoding='utf-8') as f:
            content = f.read()
            content = content[:-1]
            content = content.split('\n')
            for line in content:
                parts = line.split(' ',1)
                line = parts[1]
                line = line.split(" -> ")
                pos_moves.append(line)

        board = []
        with open('board.txt', 'r+', encoding='utf-8') as f:
            content = f.read()
            content = content[:-1]
            content = content.split('\n')
            for line in content:
                line = line.split('  ')
                board.append(line)

        response_data = {'comp_moves': comp_moves, 'pos_moves': pos_moves, 'board': board};

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode('utf-8'))

def run(server_class=HTTPServer, handler_class=RequestHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print('Сервер запущен на порту 8000...')
    url = "http://localhost:8000"
    webbrowser.open(url)
    httpd.serve_forever()

if __name__ == '__main__':
    print('Starting game...')
    run()